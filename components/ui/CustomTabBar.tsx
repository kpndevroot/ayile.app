import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '@/utils/storage';
import { DesignTokens } from '@/constants/design';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

const TAB_ITEMS: TabItem[] = [
  { name: 'home', label: 'Home', icon: 'home', route: '/(tabs)/' },
  { name: 'order', label: 'Orders', icon: 'receipt', route: '/(tabs)/order' },
  { name: 'offers', label: 'Offers', icon: 'local-offer', route: '/(tabs)/offers' },
  { name: 'profile', label: 'Profile', icon: 'person', route: '/(tabs)/profile' },
];

/**
 * Custom Tab Bar Component
 * Enhanced with smooth animations and refined styling
 * - Standard tabs for Home, Orders, Offers, Profile
 * - Elevated center button (Cart or QR Scan) based on restaurant session
 * - Smooth scale, opacity, and color transitions
 * - Clear active/inactive states with visual emphasis
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const pathname = usePathname();
  const [hasRestaurantSession, setHasRestaurantSession] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [currentFocusedTab, setCurrentFocusedTab] = useState<string>('');
  const [shouldHideTabBar, setShouldHideTabBar] = useState(false);
  
  // Animation refs for each tab
  interface TabAnimation {
    scale: Animated.Value;
    opacity: Animated.Value;
  }
  const tabAnimations = useRef<{ [key: string]: TabAnimation }>({});
  
  // Initialize animation values for each tab
  useEffect(() => {
    TAB_ITEMS.forEach((item) => {
      if (!tabAnimations.current[item.name]) {
        tabAnimations.current[item.name] = {
          scale: new Animated.Value(1),
          opacity: new Animated.Value(0.6),
        };
      }
    });
  }, []);

  // Check if user is logged in - hide tab bar if not logged in (showing login/signup)
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const userData = await StorageService.getUserData();
        const userCreated = await StorageService.getUserCreated();
        
        // Check if we're on the index route (where login/signup is shown)
        const isIndexRoute = pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '/' || state.routes[state.index]?.name === 'index';
        
        // Hide tab bar if:
        // 1. We're on the index route AND
        // 2. User is not logged in (login/signup screens are shown)
        if (isIndexRoute && (!userData || !userCreated)) {
          setShouldHideTabBar(true);
        } else {
          setShouldHideTabBar(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // On error, check if we're on index route and hide if so
        const isIndexRoute = pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '/' || state.routes[state.index]?.name === 'index';
        setShouldHideTabBar(isIndexRoute);
      }
    };

    checkAuthState();
    
    // Check periodically for auth state changes (every 500ms for responsiveness)
    const authInterval = setInterval(checkAuthState, 500);
    
    return () => {
      clearInterval(authInterval);
    };
  }, [pathname, state.index, state.routes]);

  // Check for active restaurant session and update cart count from local storage
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const restaurantData = await StorageService.getRestaurantData();
        
        if (restaurantData) {
          setHasRestaurantSession(true);
          // Get cart count from local storage
          const localCart = await StorageService.getLocalCart();
          const total = localCart.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(total);
        } else {
          setHasRestaurantSession(false);
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
        setHasRestaurantSession(false);
        setCartCount(0);
      }
    };

    updateCartCount();
    
    // Check for refresh trigger from adding/removing items
    const checkAndRefresh = async () => {
      try {
        const refreshTrigger = await AsyncStorage.getItem('@forks_refresh_cart');
        if (refreshTrigger === 'true') {
          await AsyncStorage.removeItem('@forks_refresh_cart');
          await updateCartCount();
        }
      } catch (error) {
        console.error('Error checking cart refresh trigger:', error);
      }
    };

    // Check immediately
    checkAndRefresh();

    // Check periodically (every 2 seconds) for cart updates
    const refreshInterval = setInterval(checkAndRefresh, 2000);
    
    // Also check session status periodically (every 30 seconds)
    const sessionInterval = setInterval(updateCartCount, 30000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(sessionInterval);
    };
  }, []);

  const handleTabPress = (route: string, isFocused: boolean, navigation: any) => {
    // Add haptic feedback for better UX
    if (Platform.OS === 'ios') {
      // Import and use haptic feedback if available
      try {
        const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
        impactAsync(ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, continue without
      }
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route);
    }
  };

  const handleCenterButtonPress = (navigation: any) => {
    if (hasRestaurantSession) {
      // Navigate to cart
      navigation.navigate('cart');
    } else {
      // Navigate to home and trigger QR scanner
      navigation.navigate('index', { triggerQRScan: true });
    }
  };

  // Handle QR button press (when showing QR icon)
  const handleQRButtonPress = async (navigation: any) => {
    // Always trigger QR scanner, even if there's a restaurant session
    // This allows scanning another QR code
    // Set a flag in storage to trigger scanner
    await AsyncStorage.setItem('@forks_trigger_qr_scan', 'true');
    navigation.navigate('index');
  };

  const isRouteActive = (route: string): boolean => {
    // Use both pathname and navigation state for accurate focus detection
    const routeIndex = state.routes.findIndex(r => {
      if (route === '/(tabs)/') {
        return r.name === 'index';
      }
      return r.name === route.replace('/(tabs)/', '');
    });
    
    // Check if this route is currently focused in navigation state
    const isNavigationFocused = state.index === routeIndex;
    
    // Also check pathname as fallback
    const isPathnameMatch = route === '/(tabs)/' 
      ? (pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '/') 
      : pathname === route;
    
    return isNavigationFocused || isPathnameMatch;
  };

  // Animate tab on focus change with improved timing and easing
  const animateTab = (itemName: string, isActive: boolean) => {
    const anim = tabAnimations.current[itemName];
    if (!anim) return;

    // Animate native driver properties together with better timing
    Animated.parallel([
      Animated.spring(anim.scale, {
        toValue: isActive ? 1.05 : 1,
        useNativeDriver: true,
        tension: 400,
        friction: 25,
      }),
      Animated.timing(anim.opacity, {
        toValue: isActive ? 1 : 0.7,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Tab Item Component with animations
  const TabItemComponent = ({ item, isFocused, onPress }: {
    item: TabItem;
    isFocused: boolean;
    onPress: () => void;
  }) => {
    const anim = tabAnimations.current[item.name];
    
    // Animate when focus changes
    useEffect(() => {
      if (anim) {
        animateTab(item.name, isFocused);
        // Update current focused tab for debugging
        if (isFocused) {
          setCurrentFocusedTab(item.name);
        }
      }
    }, [isFocused, item.name, anim]);

    const scale = anim?.scale || new Animated.Value(isFocused ? 1.05 : 1);
    const opacity = anim?.opacity || new Animated.Value(isFocused ? 1 : 0.7);

    // Active tab: Orange color for icon and text
    // Inactive tab: Gray color for icon and text
    const iconColor = isFocused 
      ? DesignTokens.colors.orange[500] // Orange when active
      : DesignTokens.colors.charcoal[500]; // Gray when inactive
    
    const textColor = isFocused 
      ? DesignTokens.colors.orange[500] // Orange when active
      : DesignTokens.colors.charcoal[500]; // Gray when inactive

    // No background fill - transparent for all states
    const backgroundColor = 'transparent';

    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={item.label}
      >
        <Animated.View
          style={[
            styles.tabItemContainer,
            {
              transform: [{ scale }],
              opacity,
              backgroundColor,
            },
          ]}
        >
          <YStack alignItems="center" justifyContent="center">
            <MaterialIcons
              name={item.icon as any}
              size={28}
              color={iconColor}
            />
            {/* <Text
              fontSize={12}
              fontWeight={isFocused ? '700' : '500'}
              color={textColor}
              textAlign="center"
            >
              {item.label}
            </Text> */}
            {/* Remove active indicator since we're using background color */}
          </YStack>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Remove React.memo to ensure component always re-renders when props change
  // This ensures icon and text colors update properly when isFocused changes
  const TabItem = TabItemComponent;

  // Hide tab bar if showing login/signup screens
  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View 
      style={styles.tabBar}
      accessibilityRole="tablist"
    >
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={20}
        paddingVertical={8}
        backgroundColor={DesignTokens.colors.beige[50]}
        height={70}
      >
        {/* Left Tabs: Home and Orders */}
        <XStack flex={1} justifyContent="space-evenly" alignItems="center">
          {TAB_ITEMS.slice(0, 2).map((item) => {
            const isFocused = isRouteActive(item.route);
            const route = item.route === '/(tabs)/' ? 'index' : item.name;
            return (
              <TabItem
                key={`${item.name}-${isFocused}`}
                item={item}
                isFocused={isFocused}
                onPress={() => handleTabPress(route, isFocused, navigation)}
              />
            );
          })}
        </XStack>

        {/* Spacer for center button */}
        <XStack flex={0} width={72} />

        {/* Right Tabs: Offers and Profile */}
        <XStack flex={1} justifyContent="space-evenly" alignItems="center">
          {TAB_ITEMS.slice(2, 4).map((item) => {
            const isFocused = isRouteActive(item.route);
            return (
              <TabItem
                key={`${item.name}-${isFocused}`}
                item={item}
                isFocused={isFocused}
                onPress={() => handleTabPress(item.name, isFocused, navigation)}
              />
            );
          })}
        </XStack>
      </XStack>
      
      {/* Absolutely Positioned Center Button */}
      <View style={styles.centerButtonContainer}>
        <AnimatedCenterButton
          hasRestaurantSession={hasRestaurantSession}
          cartCount={cartCount}
          onPress={() => {
            if (hasRestaurantSession) {
              handleCenterButtonPress(navigation);
            } else {
              handleQRButtonPress(navigation);
            }
          }}
          onLongPress={() => {
            if (hasRestaurantSession) {
              handleQRButtonPress(navigation);
            }
          }}
        />
      </View>
    </View>
  );
}

// Animated Center Button Component
const AnimatedCenterButton = React.memo(({
  hasRestaurantSession,
  cartCount,
  onPress,
  onLongPress,
}: {
  hasRestaurantSession: boolean;
  cartCount: number;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse animation when cart count changes
    if (cartCount > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cartCount]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <YStack alignItems="center" justifyContent="center">
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={hasRestaurantSession ? `Cart with ${cartCount} items` : 'Scan QR Code'}
        accessibilityHint={hasRestaurantSession ? 'Tap to view cart' : 'Tap to scan QR code'}
      >
        <Animated.View
          style={[
            styles.centerButton,
            {
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          {hasRestaurantSession ? (
            <View style={styles.cartButton}>
              {cartCount > 0 && (
                <Animated.View
                  style={[
                    styles.badgeContainer,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </Animated.View>
              )}
              <MaterialIcons name="shopping-bag" size={32} color="white" />
            </View>
          ) : (
            <MaterialIcons name="qr-code-scanner" size={32} color="white" />
          )}
        </Animated.View>
      </TouchableOpacity>
      {/* <Text
        fontSize={12}
        fontWeight="400"
        color={DesignTokens.colors.orange[500]}
        marginTop={4}
      >
        {hasRestaurantSession ? 'Cart' : 'Scan'}
      </Text> */}
    </YStack>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: DesignTokens.colors.beige[50],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.beige[200],
    ...DesignTokens.shadows.lg,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: DesignTokens.radius.lg,
    minHeight: 48,
    width: '100%',
  },
  // Removed activeIndicator since we're using background color fill
  centerButtonContainer: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -32, // Half of button width (64/2)
    zIndex: 10,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DesignTokens.colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadows.lg,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: DesignTokens.colors.beige[50],
  },
  cartButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: DesignTokens.colors.neutral.white,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: DesignTokens.colors.orange[500],
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: DesignTokens.colors.orange[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeText: {
    color: DesignTokens.colors.orange[500],
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

