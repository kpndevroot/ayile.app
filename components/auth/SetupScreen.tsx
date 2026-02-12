import { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { AuthService } from '@/services/authService';
import { User, UserRole } from '@/types';

interface SetupScreenProps {
  onUserCreated: (user: User, token: string) => void;
  onSwitchToLogin: () => void;
}

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

// Common country codes with India (+91) as default
const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', dialCode: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
];

/**
 * SetupScreen Component
 * Two-step user registration form matching the design:
 * Step 1: Name and Phone Number
 * Step 2: Create and Confirm Password
 */
export function SetupScreen({ onUserCreated, onSwitchToLogin }: SetupScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // India as default
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Format phone number as user types
  const formatPhoneNumber = (text: string, countryCode: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    // India format: XXXX-XXXX-XX (10 digits)
    if (countryCode === '+91') {
      if (cleaned.length <= 4) {
        return cleaned;
      } else if (cleaned.length <= 8) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
      } else {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 10)}`;
      }
    }
    // US/Canada format: XXX-XXX-XXXX (10 digits)
    else if (countryCode === '+1') {
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    }
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text, selectedCountry.dialCode);
    setPhone(formatted);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Clear phone when country changes to avoid format mismatch
    setPhone('');
  };

  const getPhoneMaxLength = (countryCode: string) => {
    if (countryCode === '+91') return 13; // 4-4-2 format
    if (countryCode === '+1') return 12; // 3-3-4 format
    return 15;
  };

  const getPhonePlaceholder = (countryCode: string) => {
    if (countryCode === '+91') {
      return '1234-5678-90';
    }
    if (countryCode === '+1') {
      return '555-555-5555';
    }
    return '1234567890';
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!fullName.trim()) {
        Alert.alert('Required', 'Please enter your full name');
        return false;
      }
      if (!phone.trim()) {
        Alert.alert('Required', 'Please enter your phone number');
        return false;
      }
      const cleanedPhone = phone.replace(/\D/g, '');
      const minLength = selectedCountry.dialCode === '+91' || selectedCountry.dialCode === '+1' ? 10 : 7;
      if (cleanedPhone.length < minLength) {
        Alert.alert('Invalid', `Please enter a valid phone number (minimum ${minLength} digits)`);
        return false;
      }
      return true;
    }
    if (step === 2) {
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
    }
    return false;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const formattedPhone = `${selectedCountry.dialCode}${cleanedPhone}`;

      console.log({
        phone: formattedPhone,
        name: fullName.trim(),
        password,
        role: 'CUSTOMER' as UserRole,
      })
      const { user, token } = await AuthService.signup({
        phone: formattedPhone,
        name: fullName.trim(),
        password,
        role: 'CUSTOMER' as UserRole,
      });

      onUserCreated(user, token);
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
    const progress = currentStep / 2; // 0.5 for step 1, 1.0 for step 2
    
    return (
      <YStack gap={8} marginBottom={32} alignItems="center">
        <Text
          fontSize={14}
          fontWeight="400"
          color="$lightBrown5"
          textAlign="center"
        >
          Step {currentStep} of 2
        </Text>
        <XStack
          width="100%"
          height={6}
          backgroundColor="$beige3"
          borderRadius={3}
          overflow="hidden"
        >
          <XStack
            width={`${progress * 100}%`}
            height="100%"
            backgroundColor="$orange6"
            borderRadius={3}
          />
        </XStack>
      </YStack>
    );
  };

  // Step 1: Create Account
  if (currentStep === 1) {
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
            <YStack
              flex={1}
              paddingHorizontal={20}
              paddingTop={60}
              paddingBottom={40}
              maxWidth={500}
              width="100%"
              alignSelf="center"
              backgroundColor="$beige1"
            >
              {/* Brand Logo */}
              <YStack alignItems="center" marginBottom={48}>
                <Text
                  fontSize={24}
                  fontWeight="700"
                  color="$brown9"
                  textAlign="center"
                >
                  Brand Logo
                </Text>
              </YStack>

              {/* Title Section */}
              <YStack gap={8} marginBottom={32} alignItems="center">
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$brown9"
                  textAlign="center"
                  lineHeight={40}
                >
                  Create an Account
                </Text>
                <Text
                  fontSize={16}
                  fontWeight="400"
                  color="$lightBrown5"
                  textAlign="center"
                  lineHeight={24}
                >
                  Let's get you started with a new account
                </Text>
              </YStack>

              {/* Progress Bar */}
              {renderProgressBar()}

              {/* Input Fields */}
              <YStack gap={24} marginBottom={32}>
                {/* Your Name Input */}
                <YStack gap={12}>
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$brown9"
                  >
                    Your Name
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A68B6B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoFocus
                  />
                </YStack>

                {/* Phone Number Input */}
                <YStack gap={12}>
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="$brown9"
                  >
                    Phone Number
                  </Text>
                  <XStack
                    alignItems="center"
                    backgroundColor="white"
                    borderRadius={12}
                    borderWidth={1}
                    borderColor="$beige3"
                    paddingHorizontal={16}
                    paddingVertical={16}
                    gap={8}
                  >
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(true)}
                      activeOpacity={0.7}
                      style={styles.countryCodeButton}
                    >
                      <XStack alignItems="center" gap={6}>
                        <Text fontSize={18}>{selectedCountry.flag}</Text>
                        <Text fontSize={16} color="$brown9" fontWeight="500">
                          {selectedCountry.dialCode}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={20} color="#1A0F08" />
                      </XStack>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={getPhonePlaceholder(selectedCountry.dialCode)}
                      placeholderTextColor="#A68B6B"
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      maxLength={getPhoneMaxLength(selectedCountry.dialCode)}
                    />
                  </XStack>
                </YStack>
              </YStack>

              {/* Next Button */}
              <TouchableOpacity
                onPress={handleNext}
                disabled={loading || !fullName.trim() || !phone.trim()}
                style={[
                  styles.primaryButton,
                  (loading || !fullName.trim() || !phone.trim()) && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  fontSize={18}
                  fontWeight="600"
                  color="white"
                >
                  Next
                </Text>
              </TouchableOpacity>

              {/* Legal Text */}
              <YStack alignItems="center" marginTop={32}>
                <Text
                  fontSize={14}
                  fontWeight="400"
                  color="$lightBrown5"
                  textAlign="center"
                  lineHeight={20}
                >
                  By continuing, you agree to our{' '}
                  <Text
                    fontSize={14}
                    fontWeight="400"
                    color="$orange6"
                    onPress={() => {
                      // TODO: Navigate to Terms of Service
                      Alert.alert('Terms of Service', 'Terms of Service page coming soon');
                    }}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    fontSize={14}
                    fontWeight="400"
                    color="$orange6"
                    onPress={() => {
                      // TODO: Navigate to Privacy Policy
                      Alert.alert('Privacy Policy', 'Privacy Policy page coming soon');
                    }}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </YStack>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Country Code Picker Modal */}
        <Modal
          visible={showCountryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCountryPicker(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <YStack gap={16}>
                {/* Modal Header */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  paddingBottom={16}
                  borderBottomWidth={1}
                  borderBottomColor="#E8E0D6"
                >
                  <Text fontSize={20} fontWeight="600" color="$brown9">
                    Select Country
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(false)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={24} color="#1A0F08" />
                  </TouchableOpacity>
                </XStack>

                {/* Country List */}
                <FlatList
                  data={COUNTRY_CODES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleCountrySelect(item)}
                      activeOpacity={0.7}
                      style={[
                        styles.countryItem,
                        selectedCountry.code === item.code && styles.countryItemSelected,
                      ]}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        flex={1}
                      >
                        <XStack alignItems="center" gap={12} flex={1}>
                          <Text fontSize={24}>{item.flag}</Text>
                          <YStack flex={1}>
                            <Text
                              fontSize={16}
                              fontWeight="500"
                              color="$brown9"
                            >
                              {item.name}
                            </Text>
                            <Text
                              fontSize={14}
                              fontWeight="400"
                              color="$lightBrown5"
                            >
                              {item.dialCode}
                            </Text>
                          </YStack>
                        </XStack>
                        {selectedCountry.code === item.code && (
                          <MaterialIcons name="check" size={24} color="#F97316" />
                        )}
                      </XStack>
                    </TouchableOpacity>
                  )}
                  style={styles.countryList}
                  showsVerticalScrollIndicator={false}
                />
              </YStack>
            </Pressable>
          </Pressable>
        </Modal>
      </ThemedView>
    );
  }

  // Step 2: Set Your Password
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
          <YStack
            flex={1}
            paddingHorizontal={20}
            paddingTop={20}
            paddingBottom={40}
            maxWidth={500}
            width="100%"
            alignSelf="center"
            backgroundColor="$beige1"
          >
            {/* Header with Back Button and Step Indicator */}
            <XStack
              alignItems="center"
              justifyContent="space-between"
              marginBottom={40}
            >
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                <MaterialIcons name="arrow-back" size={24} color="#1A0F08" />
              </TouchableOpacity>
              <Text
                fontSize={16}
                fontWeight="400"
                color="$orange6"
              >
                Step 2 of 2
              </Text>
            </XStack>

            {/* Title Section */}
            <YStack gap={8} marginBottom={32} alignItems="flex-start">
              <Text
                fontSize={32}
                fontWeight="700"
                color="$brown9"
                lineHeight={40}
              >
                Set Your Password
              </Text>
              <Text
                fontSize={16}
                fontWeight="400"
                color="$lightBrown5"
                lineHeight={24}
              >
                Your password must be secure and easy to remember.
              </Text>
            </YStack>

            {/* Password Input Fields */}
            <YStack gap={24} marginBottom={32}>
              {/* Create Password */}
              <YStack gap={12}>
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color="$brown9"
                >
                  Create Password
                </Text>
                <XStack
                  alignItems="center"
                  backgroundColor="white"
                  borderRadius={12}
                  borderWidth={1}
                  borderColor="$beige3"
                  paddingHorizontal={16}
                  paddingVertical={16}
                  gap={8}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    placeholderTextColor="#A68B6B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#A68B6B"
                    />
                  </TouchableOpacity>
                </XStack>
              </YStack>

              {/* Confirm Password */}
              <YStack gap={12}>
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color="$brown9"
                >
                  Confirm Password
                </Text>
                <XStack
                  alignItems="center"
                  backgroundColor="white"
                  borderRadius={12}
                  borderWidth={1}
                  borderColor="$beige3"
                  paddingHorizontal={16}
                  paddingVertical={16}
                  gap={8}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#A68B6B"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#A68B6B"
                    />
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </YStack>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !password.trim() || !confirmPassword.trim()}
              style={[
                styles.primaryButton,
                (loading || !password.trim() || !confirmPassword.trim()) && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Text
                fontSize={18}
                fontWeight="600"
                color="white"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            {/* Legal Text */}
            <YStack alignItems="center" marginTop={32}>
              <Text
                fontSize={14}
                fontWeight="400"
                color="$lightBrown5"
                textAlign="center"
                lineHeight={20}
              >
                By signing up, you agree to our{' '}
                <Text
                  fontSize={14}
                  fontWeight="400"
                  color="$orange6"
                  onPress={() => {
                    // TODO: Navigate to Terms of Service
                    Alert.alert('Terms of Service', 'Terms of Service page coming soon');
                  }}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  fontSize={14}
                  fontWeight="400"
                  color="$orange6"
                  onPress={() => {
                    // TODO: Navigate to Privacy Policy
                    Alert.alert('Privacy Policy', 'Privacy Policy page coming soon');
                  }}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
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
    backgroundColor: '#FAF7F2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A0F08',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A0F08',
    padding: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A0F08',
    padding: 0,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  countryCodeButton: {
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E8E0D6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  countryItemSelected: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F97316',
  },
});
