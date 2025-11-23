import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { ThemedView } from '@/components/themed-view';
import { TopBar } from '@/components/ui/TopBar';
import { User } from '@/types';
import { StorageService } from '@/utils/storage';

interface HomePageProps {
  userData: User | null;
  onScanQR: () => void;
  onLogout: () => void;
}

/**
 * HomePage Component
 * Displays welcome screen with user profile and QR scan option for Guest users
 */
export function HomePage({ userData, onScanQR, onLogout }: HomePageProps) {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            onLogout();
          },
        },
      ]
    );
  };

  const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'Guest';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.homeContent}>
        {/* TopBar for Guest users */}
        {userData?.role === 'GUEST' && (
          <TopBar
            userName={userName}
            userRole={userData.role}
            onLogout={handleLogout}
            onScanAnotherQR={onScanQR}
          />
        )}
        
        <YStack gap="$6" padding="$6" alignItems="center" justifyContent="center" flex={1}>
          <YStack gap="$4" alignItems="center" maxWidth={400} width="100%">
            <Text fontSize="$10" fontWeight="bold" textAlign="center">
              Welcome to Forks! 🍴
            </Text>
            <Text fontSize="$6" color="$gray11" textAlign="center">
              Your account has been set up successfully
            </Text>
            
            {userData && (
              <YStack
                gap="$4"
                padding="$4"
                backgroundColor="$gray2"
                borderRadius="$4"
                width="100%"
                marginTop="$4"
              >
                <Text fontSize="$5" fontWeight="bold" marginBottom="$2">
                  Your Profile
                </Text>
                <YStack gap="$2">
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Name:</Text>
                    <Text fontSize="$4" fontWeight="600">
                      {userData.firstName} {userData.lastName}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Phone:</Text>
                    <Text fontSize="$4" fontWeight="600">{userData.phone || 'N/A'}</Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Role:</Text>
                    <Text fontSize="$4" fontWeight="600">{userData.role}</Text>
                  </XStack>
                </YStack>
              </YStack>
            )}

            {userData?.role === 'GUEST' && (
              <Button
                onPress={onScanQR}
                size="$5"
                width="100%"
                backgroundColor="$blue10"
                marginTop="$4"
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  Scan Restaurant QR Code 📷
                </Text>
              </Button>
            )}

            <YStack gap="$3" marginTop="$4" width="100%">
              <Text fontSize="$4" color="$gray11" textAlign="center">
                {userData?.role === 'GUEST' 
                  ? 'Scan a QR code to view restaurant details'
                  : "You're all set! Start exploring the app."}
              </Text>
            </YStack>

            <Button
              onPress={handleLogout}
              size="$4"
              width="100%"
              backgroundColor="$red5"
              marginTop="$4"
            >
              <Text color="$red11" fontWeight="600">
                Logout
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeContent: {
    flexGrow: 1,
  },
});

