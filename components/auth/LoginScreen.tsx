import { useState, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { AuthService } from '@/services/authService';
import { User } from '@/types';

type LoginScreenState = 'initial' | 'otp' | 'password';

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

interface LoginScreenProps {
  onLoginSuccess: (user: User, token: string) => void;
  onSwitchToSignup: () => void;
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
 * Login Screen Component
 * Implements three-screen login flow matching the design:
 * 1. Initial screen: Phone number entry with OTP/Password options
 * 2. OTP screen: 6-digit code verification
 * 3. Password screen: Password entry with visibility toggle
 */
export function LoginScreen({ onLoginSuccess, onSwitchToSignup }: LoginScreenProps) {
  const [screenState, setScreenState] = useState<LoginScreenState>('initial');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // India as default
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Format phone number as user types (supports different formats based on country)
  const formatPhoneNumber = (text: string, countryCode: string) => {
    // Remove all non-digits
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
    // Default: no formatting, just return cleaned
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text, selectedCountry.dialCode);
    setPhone(formatted);
  };

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const getPhoneMaxLength = (countryCode: string) => {
    // India: 10 digits
    if (countryCode === '+91') return 13; // 4-4-2 format
    // US/Canada: 10 digits
    if (countryCode === '+1') return 12; // 3-3-4 format
    // Default: allow up to 15 digits (international standard)
    return 15;
  };

  // OTP Timer countdown
  useEffect(() => {
    if (screenState === 'otp' && resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screenState, resendTimer, canResend]);

  const handleLoginWithOTP = async () => {
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }

    // Format phone for API (remove dashes and add country code)
    const cleanedPhone = phone.replace(/\D/g, '');
    const formattedPhone = `${selectedCountry.dialCode}${cleanedPhone}`;

    // Validate phone length (India: 10 digits, US/Canada: 10 digits, others: at least 7)
    const minLength = selectedCountry.dialCode === '+91' || selectedCountry.dialCode === '+1' ? 10 : 7;
    if (cleanedPhone.length < minLength) {
      Alert.alert('Invalid', `Please enter a valid phone number (minimum ${minLength} digits)`);
      return;
    }

    // TODO: Call OTP send API endpoint when available
    // For now, simulate OTP flow
    setScreenState('otp');
    setResendTimer(59);
    setCanResend(false);
  };

  const handleLoginWithPassword = () => {
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }

    const formattedPhone = `+1${phone.replace(/\D/g, '')}`;

    if (formattedPhone.length !== 12) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit phone number');
      return;
    }

    setScreenState('password');
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerifyOTP(newCode.join(''));
    }
  };

  const handleOTPKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    if (!canResend) return;

    // TODO: Call resend OTP API
    setResendTimer(59);
    setCanResend(false);
    setOtpCode(['', '', '', '', '', '']);
    Alert.alert('Code Sent', 'A new verification code has been sent to your phone');
  };

  const handleVerifyOTP = async (code?: string) => {
    const finalCode = code || otpCode.join('');

    if (finalCode.length !== 6) {
      Alert.alert('Invalid', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      // TODO: Call OTP verify API endpoint when available
      // For now, simulate successful verification and fall back to password login
      Alert.alert(
        'OTP Not Implemented',
        'OTP verification is not yet available. Please use password login.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScreenState('password');
              setLoading(false);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', error.message || 'Failed to verify code. Please try again.');
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your phone number and password');
      return;
    }

    setLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const formattedPhone = `${selectedCountry.dialCode}${cleanedPhone}`;
      const { user, token } = await AuthService.login({
        phone: formattedPhone,
        password: password,
      });

      onLoginSuccess(user, token);
    } catch (error: any) {
      console.error('Error logging in:', error);

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

  const handleBack = () => {
    if (screenState === 'otp' || screenState === 'password') {
      setScreenState('initial');
      setOtpCode(['', '', '', '', '', '']);
      setPassword('');
      setShowPassword(false);
    }
  };

  const formatPhoneForDisplay = (phoneNum: string, countryCode: string) => {
    const cleaned = phoneNum.replace(/\D/g, '');

    // India format: +91 XXXX-XXXX-XX
    if (countryCode === '+91' && cleaned.length === 10) {
      return `${countryCode} ${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    // US/Canada format: +1 (XXX) XXX-XXXX
    if (countryCode === '+1' && cleaned.length === 10) {
      return `${countryCode} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // Default format
    if (cleaned.length > 0) {
      return `${countryCode} ${cleaned}`;
    }
    return phoneNum;
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

  // Initial Login Screen
  if (screenState === 'initial') {
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

              {/* Welcome Heading */}
              <YStack gap={8} marginBottom={32} alignItems="center">
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$brown9"
                  textAlign="center"
                  lineHeight={40}
                >
                  Welcome Back!
                </Text>
                <Text
                  fontSize={16}
                  fontWeight="400"
                  color="$lightBrown5"
                  textAlign="center"
                  lineHeight={24}
                >
                  Enter your phone number to continue
                </Text>
              </YStack>

              {/* Phone Number Input */}
              <YStack gap={12} marginBottom={32}>
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
                    autoFocus
                  />
                </XStack>
              </YStack>

              {/* Login Buttons */}
              <YStack gap={16} marginBottom={32}>
                <TouchableOpacity
                  onPress={handleLoginWithOTP}
                  disabled={loading}
                  style={[
                    styles.primaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    fontSize={18}
                    fontWeight="600"
                    color="white"
                  >
                    Login with OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLoginWithPassword}
                  disabled={loading}
                  style={[
                    styles.secondaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    fontSize={18}
                    fontWeight="600"
                    color="$orange6"
                  >
                    Login with Password
                  </Text>
                </TouchableOpacity>
              </YStack>

              {/* Sign Up Link */}
              <XStack
                alignItems="center"
                justifyContent="center"
                gap={4}
              >
                <Text fontSize={16} color="$brown9" fontWeight="400">
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={onSwitchToSignup} activeOpacity={0.7}>
                  <Text fontSize={16} color="$orange6" fontWeight="600">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </XStack>
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

  // OTP Verification Screen
  if (screenState === 'otp') {
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
              {/* Header with Back Button */}
              <XStack alignItems="center" marginBottom={40} gap={16}>
                <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                  <MaterialIcons name="arrow-back" size={24} color="#1A0F08" />
                </TouchableOpacity>
                <Text
                  fontSize={20}
                  fontWeight="600"
                  color="$brown9"
                >
                  Verify Your Number
                </Text>
              </XStack>

              {/* Heading */}
              <YStack gap={8} marginBottom={8} alignItems="center">
                <Text
                  fontSize={32}
                  fontWeight="700"
                  color="$brown9"
                  textAlign="center"
                  lineHeight={40}
                >
                  Enter Code
                </Text>
                <Text
                  fontSize={16}
                  fontWeight="400"
                  color="#6B7280"
                  textAlign="center"
                  lineHeight={24}
                >
                  We've sent a 6-digit code to your mobile number.
                </Text>
              </YStack>

              {/* OTP Input Fields */}
              <XStack
                gap={12}
                justifyContent="center"
                marginTop={40}
                marginBottom={24}
              >
                {otpCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpInputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleOTPKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                    autoFocus={index === 0}
                  />
                ))}
              </XStack>

              {/* Resend Code */}
              <XStack
                alignItems="center"
                justifyContent="center"
                gap={4}
                marginBottom={40}
              >
                <Text fontSize={16} color="#6B7280" fontWeight="400">
                  Didn't receive a code?
                </Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={!canResend}
                  activeOpacity={0.7}
                >
                  <Text
                    fontSize={16}
                    color={canResend ? "$orange6" : "#6B7280"}
                    fontWeight="600"
                  >
                    Resend
                  </Text>
                </TouchableOpacity>
                {!canResend && (
                  <Text fontSize={16} color="#6B7280" fontWeight="400">
                    ({String(Math.floor(resendTimer / 60)).padStart(2, '0')}:{String(resendTimer % 60).padStart(2, '0')})
                  </Text>
                )}
              </XStack>

              {/* Verify Button */}
              <TouchableOpacity
                onPress={() => handleVerifyOTP()}
                disabled={loading || otpCode.some(d => !d)}
                style={[
                  styles.primaryButton,
                  (loading || otpCode.some(d => !d)) && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  fontSize={18}
                  fontWeight="600"
                  color="white"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </TouchableOpacity>
            </YStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  // Password Entry Screen
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
            {/* Header with Back Button */}
            <XStack alignItems="center" marginBottom={40} gap={16}>
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                <MaterialIcons name="arrow-back" size={24} color="#1A0F08" />
              </TouchableOpacity>
            </XStack>

            {/* Heading */}
            <YStack gap={8} marginBottom={32} alignItems="flex-start">
              <Text
                fontSize={32}
                fontWeight="700"
                color="$brown9"
                lineHeight={40}
              >
                Enter Your Password
              </Text>
              <Text
                fontSize={16}
                fontWeight="400"
                color="$lightBrown5"
                lineHeight={24}
              >
                Welcome back! Please enter your password for {formatPhoneForDisplay(phone, selectedCountry.dialCode) || `${selectedCountry.dialCode} (555) 123-4567`}.
              </Text>
            </YStack>

            {/* Password Input */}
            <YStack gap={12} marginBottom={24}>
              <Text
                fontSize={16}
                fontWeight="600"
                color="$brown9"
              >
                Password
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
                  placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <XStack justifyContent="flex-end" marginBottom={32}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  fontSize={16}
                  fontWeight="400"
                  color="$orange6"
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </XStack>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handlePasswordLogin}
              disabled={loading || !password.trim()}
              style={[
                styles.primaryButton,
                (loading || !password.trim()) && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Text
                fontSize={18}
                fontWeight="600"
                color="white"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Text>
            </TouchableOpacity>
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
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A0F08',
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
  secondaryButton: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
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
