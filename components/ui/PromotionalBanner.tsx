import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ImageSourcePropType, Animated, Dimensions } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { MaterialIcons } from '@expo/vector-icons';
import { DesignTokens } from '@/constants/design';
import { Button } from './Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromotionalBannerProps {
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
  backgroundColor?: string;
  discount?: string;
  urgencyText?: string;
  // socialProof?: string;
}

/**
 * Enhanced Promotional Banner Component
 * Psychologically compelling promotional cards with animations and urgency
 */
export function PromotionalBanner({
  title,
  subtitle,
  image,
  onPress,
  backgroundColor,
  discount = "50%",
  urgencyText = "Limited Time Only",
  // socialProof = "",
}: PromotionalBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulsing animation for urgency
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer effect for attention
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnim.stopAnimation();
      shimmerAnim.stopAnimation();
    };
  }, []);

  const handlePress = () => {
    // Scale animation on press for feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress?.();
  };

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Gradient Background */}
      <View style={styles.gradientBackground}>
        {/* Shimmer Effect Overlay */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerTranslateX }],
            },
          ]}
        />
        
        {/* Main Content */}
        <XStack style={styles.content}>
          {/* Left Content */}
          <YStack flex={1} gap="$2" justifyContent="center">
            {/* Urgency Badge */}
            <Animated.View
              style={[
                styles.urgencyBadge,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <MaterialIcons name="access-time" size={12} color="#FF4444" />
              <Text style={styles.urgencyText}>{urgencyText}</Text>
            </Animated.View>

            {/* Discount Badge */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}</Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>

            {/* Main Title */}
            <Text style={styles.mainTitle}>
              {title}
            </Text>

            {/* Subtitle */}
            {subtitle && (
              <Text style={styles.subtitle}>
                {subtitle}
              </Text>
            )}

            {/* Social Proof */}
            {/* <XStack alignItems="center" gap="$1" marginTop="$1">
              <MaterialIcons name="people" size={14} color="#FFD700" />
              <Text style={styles.socialProofText}>{socialProof}</Text>
            </XStack> */}

            {/* CTA Button */}
            {onPress && (
              <View style={styles.ctaContainer}>
                <Button
                  onPress={handlePress}
                  style={styles.ctaButton}
                >
                  <XStack alignItems="center" gap="$2">
                    <MaterialIcons name="flash-on" size={16} color="white" />
                    <Text style={styles.ctaText}>Claim Now</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="white" />
                  </XStack>
                </Button>
              </View>
            )}
          </YStack>

          {/* Right Visual Element */}
          <View style={styles.visualContainer}>
            {image ? (
              <Image
                source={image}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.defaultVisual}>
                <MaterialIcons name="local-offer" size={60} color="#FFD700" />
                <View style={styles.sparkles}>
                  <MaterialIcons name="star" size={16} color="#FFD700" style={styles.sparkle1} />
                  <MaterialIcons name="star" size={12} color="#FFA500" style={styles.sparkle2} />
                  <MaterialIcons name="star" size={14} color="#FFD700" style={styles.sparkle3} />
                </View>
              </View>
            )}
          </View>
        </XStack>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: DesignTokens.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientBackground: {
    backgroundColor: '#FF6B35', // Primary orange color
    position: 'relative',
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    padding: DesignTokens.spacing.lg,
    minHeight: 140,
    alignItems: 'center',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
  },
  discountText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  discountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
    marginTop: -2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    lineHeight: 22,
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  // socialProofText: {
  //   fontSize: 12,
  //   fontWeight: '500',
  //   color: 'rgba(255, 255, 255, 0.8)',
  // },
  ctaContainer: {
    marginTop: 12,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  visualContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultVisual: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  sparkle3: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
});

