import { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { ThemedView } from '@/components/themed-view';
import { AuthService } from '@/services/authService';
import { User } from '@/types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
}

/**
 * Login Screen Component
 * Handles user login with phone and password
 */
export function LoginScreen({ onLoginSuccess, onSwitchToSignup }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your phone number and password');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const { user, token } = await AuthService.login({
        phone: phone.replace(/\s/g, ''),
        password: password,
      });

      // Save authentication data
      await AuthService.saveAuthData(user, token);

      onLoginSuccess(user);
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      // Handle different error types
      const errorMessage = error.message || 'Failed to login. Please try again.';
      
      if (errorMessage.includes('Invalid') || errorMessage.includes('401') || errorMessage.includes('credentials')) {
        Alert.alert('Invalid Credentials', 'Invalid phone number or password. Please try again.');
      } else if (errorMessage.includes('400') || errorMessage.includes('input')) {
        Alert.alert('Error', 'Please check your input and try again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your connection and try again.'
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$6" padding="$4" maxWidth={500} width="100%" alignSelf="center" justifyContent="center" flex={1}>
            <YStack gap="$4" alignItems="center" marginBottom="$4">
              <Text fontSize="$10" fontWeight="bold" textAlign="center">
                Welcome Back! 👋
              </Text>
              <Text fontSize="$5" color="$gray11" textAlign="center">
                Sign in to your account
              </Text>
            </YStack>

            <YStack gap="$4">
              <YStack gap="$2">
                <Label htmlFor="loginPhone" fontSize="$4" fontWeight="600">
                  Phone Number *
                </Label>
                <Input
                  id="loginPhone"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChangeText={setPhone as any}
                  keyboardType="phone-pad"
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
                <Text fontSize="$2" color="$gray10">
                  Enter the phone number you used to sign up
                </Text>
              </YStack>

              <YStack gap="$2">
                <Label htmlFor="loginPassword" fontSize="$4" fontWeight="600">
                  Password *
                </Label>
                <Input
                  id="loginPassword"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword as any}
                  secureTextEntry={!showPassword}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
                <XStack gap="$2" alignItems="center" marginTop="$1">
                  <Button
                    onPress={() => setShowPassword(!showPassword)}
                    size="$3"
                    backgroundColor="transparent"
                    padding={0}
                  >
                    <Text fontSize="$3" color="$blue10">
                      {showPassword ? 'Hide' : 'Show'} Password
                    </Text>
                  </Button>
                </XStack>
              </YStack>

              <Button
                onPress={handleLogin}
                size="$5"
                width="100%"
                backgroundColor="$blue10"
                marginTop="$2"
                disabled={loading}
              >
                <Text color="white" fontWeight="600" fontSize="$5">
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </Button>

              <XStack gap="$2" alignItems="center" justifyContent="center" marginTop="$2">
                <Text fontSize="$4" color="$gray11">
                  Don't have an account?
                </Text>
                <Button
                  onPress={onSwitchToSignup}
                  size="$3"
                  backgroundColor="transparent"
                  padding={0}
                >
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Sign Up
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
});
