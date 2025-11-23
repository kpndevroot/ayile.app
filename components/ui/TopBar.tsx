import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { Avatar } from '@tamagui/avatar';
import { Popover } from '@tamagui/popover';
import { Button } from '@tamagui/button';
import { DesignTokens } from '@/constants/design';
import { AuthService } from '@/services/authService';

interface TopBarProps {
  userName: string;
  userRole?: string;
  profileImage?: string;
  onProfilePress?: () => void;
  onLogout?: () => void;
  onScanAnotherQR?: () => void;
  rightAction?: React.ReactNode;
}

/**
 * TopBar Component
 * Modern top bar with greeting and profile picture
 * Based on the reference design with purple gradient corners
 */
export function TopBar({
  userName,
  userRole,
  profileImage,
  onProfilePress,
  onLogout,
  onScanAnotherQR,
  rightAction,
}: TopBarProps) {
  const firstName = userName?.split(' ')[0] || 'Guest';
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API and clear storage
              await AuthService.logout();
              
              // Call the onLogout callback to reset parent component state
              // This will trigger navigation reset and show login screen
              onLogout?.();
            } catch (error) {
              console.error('Error during logout:', error);
              // Even if API call fails, clear local storage and logout
              try {
                await AuthService.logout();
              } catch (clearError) {
                console.error('Error clearing storage:', clearError);
              }
              // Always call onLogout to reset navigation
              onLogout?.();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient corners */}
      <View style={styles.gradientContainer}>
        <View style={[styles.gradientCorner, styles.topLeft]} />
        <View style={[styles.gradientCorner, styles.topRight]} />
      </View>

      {/* Content */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-between"
        alignItems="center"
        style={styles.content}
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text
            style={{
              fontSize: DesignTokens.typography.fontSize['lg'],
              fontWeight: DesignTokens.typography.fontWeight.bold,
              color: DesignTokens.colors.neutral.gray900,
            }}
          >
            Hi, {firstName}!
          </Text>
          {userRole && (
            <Text
              style={{
                fontSize: DesignTokens.typography.fontSize.sm,
                color: DesignTokens.colors.neutral.gray600,
                marginTop: DesignTokens.spacing.xs / 2,
              }}
            >
              {userRole}
            </Text>
          )}
        </View>

        {/* Right side - Profile or custom action */}
        <XStack gap="$3" alignItems="center">
          {rightAction}
          <Popover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            size="$5"
            stayInFrame
            placement="bottom-end"
          >
            <Popover.Trigger asChild>
              <Button
                unstyled
                onPress={() => {
                  setPopoverOpen(true);
                  onProfilePress?.();
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <Avatar
                  circular
                  size="$4"
                  borderWidth={2}
                  borderColor={DesignTokens.colors.neutral.gray300}
                >
                  {profileImage ? (
                    <Avatar.Image source={{ uri: profileImage }} />
                  ) : null}
                  <Avatar.Fallback
                    backgroundColor={DesignTokens.colors.primary.orange}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize={DesignTokens.typography.fontSize.lg}
                      fontWeight={DesignTokens.typography.fontWeight.bold}
                      color={DesignTokens.colors.neutral.white}
                    >
                      {firstName.charAt(0).toUpperCase()}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              </Button>
            </Popover.Trigger>

            <Popover.Content
              padding={0}
              borderWidth={1}
              borderColor={DesignTokens.colors.neutral.gray300}
              backgroundColor={DesignTokens.colors.neutral.white}
              borderRadius={DesignTokens.radius.md}
              shadowColor={DesignTokens.colors.neutral.black}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              elevation={5}
              enterStyle={{ opacity: 0, scale: 0.95 }}
              exitStyle={{ opacity: 0, scale: 0.95 }}
              animation="quick"
            >
              <YStack padding="$2" gap="$1" minWidth={180}>
                {onScanAnotherQR && (
                  <Button
                    unstyled
                    onPress={() => {
                      setPopoverOpen(false);
                      onScanAnotherQR();
                    }}
                    padding="$3"
                    borderRadius={DesignTokens.radius.sm}
                    hoverStyle={{
                      backgroundColor: DesignTokens.colors.neutral.gray100,
                    }}
                    pressStyle={{
                      backgroundColor: DesignTokens.colors.neutral.gray200,
                    }}
                  >
                    <XStack gap="$3" alignItems="center">
                      <Text fontSize={20}>📷</Text>
                      <Text
                        fontSize={DesignTokens.typography.fontSize.md}
                        fontWeight={DesignTokens.typography.fontWeight.medium}
                        color={DesignTokens.colors.neutral.gray900}
                      >
                        Scan Another QR
                      </Text>
                    </XStack>
                  </Button>
                )}
                <Button
                  unstyled
                  onPress={() => {
                    setPopoverOpen(false);
                    handleLogout();
                  }}
                  padding="$3"
                  borderRadius={DesignTokens.radius.sm}
                  hoverStyle={{
                    backgroundColor: DesignTokens.colors.neutral.gray100,
                  }}
                  pressStyle={{
                    backgroundColor: DesignTokens.colors.neutral.gray200,
                  }}
                >
                  <XStack gap="$3" alignItems="center">
                    <Text fontSize={20}>🚪</Text>
                    <Text
                      fontSize={DesignTokens.typography.fontSize.md}
                      fontWeight={DesignTokens.typography.fontWeight.medium}
                      color={DesignTokens.colors.semantic.error}
                    >
                      Logout
                    </Text>
                  </XStack>
                </Button>
              </YStack>
            </Popover.Content>
          </Popover>
        </XStack>
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: DesignTokens.colors.neutral.gray100,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 0,
  },
  gradientCorner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
  },
  topLeft: {
    top: -50,
    left: -50,
    backgroundColor: '#A855F7', // Light purple
  },
  topRight: {
    top: -50,
    right: -50,
    backgroundColor: '#A855F7', // Light purple
  },
  content: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  greetingContainer: {
    flex: 1,
  },
});

