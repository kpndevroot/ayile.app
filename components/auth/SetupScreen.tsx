import { useState } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { ThemedView } from '@/components/themed-view';
import { AuthService } from '@/services/authService';
import { User, UserRole, Step } from '@/types';
import { StorageService } from '@/utils/storage';

interface SetupScreenProps {
  onUserCreated: (user: User) => void;
  onSwitchToLogin: () => void;
}

/**
 * SetupScreen Component
 * Multi-step user registration form
 * Handles phone, name, password, and role selection
 */
export function SetupScreen({ onUserCreated, onSwitchToLogin }: SetupScreenProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!phone.trim()) {
          Alert.alert('Required', 'Please enter your mobile number');
          return false;
        }
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          Alert.alert('Invalid', 'Please enter a valid mobile number');
          return false;
        }
        return true;
      case 2:
        if (!firstName.trim()) {
          Alert.alert('Required', 'Please enter your first name');
          return false;
        }
        if (!lastName.trim()) {
          Alert.alert('Required', 'Please enter your last name');
          return false;
        }
        return true;
      case 3:
        if (!password.trim()) {
          Alert.alert('Required', 'Please enter a password');
          return false;
        }
        if (password.length < 6) {
          Alert.alert('Invalid', 'Password must be at least 6 characters');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Mismatch', 'Passwords do not match');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const user = await AuthService.signup({
        phone: phone.replace(/\s/g, ''),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        role,
      });

      // Save user data to storage
      await StorageService.setUserData(user);
      await StorageService.setUserCreated(true);
      await StorageService.setUserId(user.id);

      onUserCreated(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
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

  const renderProgressBar = () => {
    return (
      <YStack gap="$2" marginBottom="$4">
        <XStack gap="$2" alignItems="center" justifyContent="center">
          {[1, 2, 3, 4].map((step) => (
            <XStack key={step} alignItems="center" gap="$1">
              <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={currentStep >= step ? '$blue10' : '$gray5'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color={currentStep >= step ? 'white' : '$gray11'}
                  fontWeight="bold"
                  fontSize="$5"
                >
                  {step}
                </Text>
              </YStack>
              {step < totalSteps && (
                <YStack
                  width={30}
                  height={3}
                  backgroundColor={currentStep > step ? '$blue10' : '$gray5'}
                />
              )}
            </XStack>
          ))}
        </XStack>
        <Text textAlign="center" fontSize="$3" color="$gray11">
          Step {currentStep} of {totalSteps}
        </Text>
      </YStack>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Welcome! 👋
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Let's get you started with your mobile number
              </Text>
            </YStack>
            <YStack gap="$2">
              <Label htmlFor="phone" fontSize="$4" fontWeight="600">
                Mobile Number *
              </Label>
              <Input
                id="phone"
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
                We'll use this to create your account
              </Text>
            </YStack>
          </YStack>
        );

      case 2:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                What's your name? ✨
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Tell us how we should address you
              </Text>
            </YStack>
            <YStack gap="$3">
              <YStack gap="$2">
                <Label htmlFor="firstName" fontSize="$4" fontWeight="600">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName as any}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
              </YStack>
              <YStack gap="$2">
                <Label htmlFor="lastName" fontSize="$4" fontWeight="600">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName as any}
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
              </YStack>
            </YStack>
          </YStack>
        );

      case 3:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Create Password 🔒
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Choose a strong password to secure your account
              </Text>
            </YStack>
            <YStack gap="$3">
              <YStack gap="$2">
                <Label htmlFor="password" fontSize="$4" fontWeight="600">
                  Password *
                </Label>
                <Input
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword as any}
                  secureTextEntry
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                  autoFocus
                />
                <Text fontSize="$2" color="$gray10">
                  Must be at least 6 characters
                </Text>
              </YStack>
              <YStack gap="$2">
                <Label htmlFor="confirmPassword" fontSize="$4" fontWeight="600">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword as any}
                  secureTextEntry
                  size="$5"
                  borderWidth={2}
                  borderRadius="$4"
                />
              </YStack>
            </YStack>
          </YStack>
        );

      case 4:
        return (
          <YStack gap="$4" animation="quick" enterStyle={{ opacity: 0, y: 10 }}>
            <YStack gap="$2" alignItems="center" marginBottom="$2">
              <Text fontSize="$9" fontWeight="bold" textAlign="center">
                Select Your Role 🎯
              </Text>
              <Text fontSize="$4" color="$gray11" textAlign="center">
                Choose the role that best describes you
              </Text>
            </YStack>
            <YStack gap="$3">
              {(['GUEST', 'ADMIN', 'STAFF'] as UserRole[]).map((roleOption) => (
                <Button
                  key={roleOption}
                  onPress={() => setRole(roleOption)}
                  size="$5"
                  borderRadius="$4"
                  borderWidth={role === roleOption ? 3 : 2}
                  borderColor={role === roleOption ? '$blue10' : '$gray5'}
                  backgroundColor={role === roleOption ? '$blue2' : '$gray2'}
                  pressStyle={{ scale: 0.98 }}
                  animation="quick"
                >
                  <XStack gap="$3" alignItems="center" justifyContent="space-between" width="100%">
                    <YStack gap="$1">
                      <Text fontSize="$5" fontWeight="bold" color={role === roleOption ? '$blue11' : '$gray11'}>
                        {roleOption}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        {roleOption === 'GUEST' && 'Regular user access'}
                        {roleOption === 'ADMIN' && 'Full administrative access'}
                        {roleOption === 'STAFF' && 'Staff member access'}
                      </Text>
                    </YStack>
                    {role === roleOption && (
                      <Text fontSize="$6" color="$blue10">
                        ✓
                      </Text>
                    )}
                  </XStack>
                </Button>
              ))}
            </YStack>
          </YStack>
        );

      default:
        return null;
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
          <YStack gap="$4" padding="$4" maxWidth={500} width="100%" alignSelf="center">
            {renderProgressBar()}
            {renderStepContent()}

            <XStack gap="$3" marginTop="$6">
              {currentStep > 1 && (
                <Button
                  onPress={handleBack}
                  size="$5"
                  flex={1}
                  backgroundColor="$gray5"
                  color="$gray11"
                  borderRadius="$4"
                  disabled={loading}
                >
                  <Text color="$gray11" fontWeight="600">
                    Back
                  </Text>
                </Button>
              )}
              <Button
                onPress={currentStep === totalSteps ? handleSubmit : handleNext}
                size="$5"
                flex={1}
                backgroundColor="$blue10"
                color="white"
                borderRadius="$4"
                disabled={loading}
                pressStyle={{ scale: 0.98 }}
              >
                <Text color="white" fontWeight="600">
                  {loading
                    ? 'Creating...'
                    : currentStep === totalSteps
                      ? 'Create Account'
                      : 'Next'}
                </Text>
              </Button>
            </XStack>

            {currentStep === 1 && (
              <XStack gap="$2" alignItems="center" justifyContent="center" marginTop="$3">
                <Text fontSize="$4" color="$gray11">
                  Already have an account?
                </Text>
                <Button
                  onPress={onSwitchToLogin}
                  size="$3"
                  backgroundColor="transparent"
                  padding={0}
                >
                  <Text fontSize="$4" color="$blue10" fontWeight="600">
                    Sign In
                  </Text>
                </Button>
              </XStack>
            )}
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

