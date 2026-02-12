import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DesignTokens } from '@/constants/design';
import { NotificationType } from '@/contexts/NotificationContext';

interface NotificationBannerProps {
  type: NotificationType;
  title: string;
  message?: string;
  visible: boolean;
  duration: number;
  onDismiss: () => void;
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: string; bgColor: string; accentColor: string; iconBg: string }
> = {
  success: {
    icon: 'check-circle',
    bgColor: '#F0FDF4',
    accentColor: DesignTokens.colors.semantic.success,
    iconBg: '#DCFCE7',
  },
  error: {
    icon: 'error',
    bgColor: '#FEF2F2',
    accentColor: DesignTokens.colors.semantic.error,
    iconBg: '#FEE2E2',
  },
  warning: {
    icon: 'warning',
    bgColor: '#FFFBEB',
    accentColor: DesignTokens.colors.semantic.warning,
    iconBg: '#FEF3C7',
  },
  info: {
    icon: 'notifications-active',
    bgColor: '#FFF7ED',
    accentColor: DesignTokens.colors.orange[500],
    iconBg: DesignTokens.colors.orange[100],
  },
};

export function NotificationBanner({
  type,
  title,
  message,
  visible,
  duration,
  onDismiss,
}: NotificationBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(1)).current;

  const config = NOTIFICATION_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress bar countdown
      if (duration > 0) {
        progressWidth.setValue(1);
        Animated.timing(progressWidth, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }).start();
      }
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onDismiss}
        style={[
          styles.banner,
          {
            backgroundColor: config.bgColor,
            borderLeftColor: config.accentColor,
          },
        ]}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
          <MaterialIcons
            name={config.icon as any}
            size={24}
            color={config.accentColor}
          />
        </View>

        {/* Content */}
        <YStack flex={1} gap={2}>
          <Text
            fontSize={15}
            fontWeight="700"
            color={DesignTokens.colors.brown[900]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {message && (
            <Text
              fontSize={13}
              fontWeight="400"
              color={DesignTokens.colors.lightBrown[500]}
              numberOfLines={2}
            >
              {message}
            </Text>
          )}
        </YStack>

        {/* Close button */}
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={18} color={DesignTokens.colors.lightBrown[400]} />
        </TouchableOpacity>

        {/* Progress bar */}
        {duration > 0 && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: config.accentColor,
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
