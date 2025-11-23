import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, View, Dimensions } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';

type UserRole = 'GUEST' | 'ADMIN' | 'STAFF';

type Step = 1 | 2 | 3 | 4;

const USER_CREATED_KEY = '@forks_user_created';
const USER_DATA_KEY = '@forks_user_data';
const RESTAURANT_DATA_KEY = '@forks_restaurant_data';
const SCANNED_KEY = '@forks_qr_scanned';

const API_BASE_URL = 'http://192.168.30.26:3000';

// QR Scanner Component
function QRScanner({ onScanSuccess, onClose }: { onScanSuccess: (restaurantId: string) => void; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Parse the QR code URL to extract restaurant ID
      // Format: http://baseUrl/restaurant/{restaurantId}/table/{uniqueId}
      const urlPattern = /\/restaurant\/([^/]+)\/table\//;
      const match = data.match(urlPattern);
      
      if (match && match[1]) {
        const restaurantId = match[1];
        await AsyncStorage.setItem(SCANNED_KEY, 'true');
        onScanSuccess(restaurantId);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid restaurant table code.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
          <Text fontSize="$5" color="$gray11" textAlign="center">
            Requesting camera permission...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$4">
          <Text fontSize="$6" fontWeight="bold" textAlign="center">
            Camera Permission Required
          </Text>
          <Text fontSize="$4" color="$gray11" textAlign="center">
            We need access to your camera to scan QR codes
          </Text>
          <Button onPress={requestPermission} size="$5" backgroundColor="$blue10">
            <Text color="white" fontWeight="600">
              Grant Permission
            </Text>
          </Button>
        </YStack>
      </ThemedView>
    );
  }

  const { width, height } = Dimensions.get('window');
  const scanAreaSize = Math.min(width, height) * 0.7;

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <YStack flex={1} justifyContent="space-between" padding="$4">
          <XStack justifyContent="flex-end">
            <Button
              onPress={onClose}
              size="$4"
              backgroundColor="rgba(0,0,0,0.5)"
              borderRadius="$4"
            >
              <Text color="white" fontWeight="600">
                Close
              </Text>
            </Button>
          </XStack>

          <YStack alignItems="center" gap="$4">
            <YStack
              width={scanAreaSize}
              height={scanAreaSize}
              borderWidth={3}
              borderColor="white"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            >
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  width: 30,
                  height: 30,
                  borderTopWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 30,
                  height: 30,
                  borderTopWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: -2,
                  width: 30,
                  height: 30,
                  borderBottomWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '$blue10',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 30,
                  height: 30,
                  borderBottomWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '$blue10',
                }}
              />
            </YStack>
            <YStack
              backgroundColor="rgba(0,0,0,0.7)"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
              gap="$2"
            >
              <Text fontSize="$5" fontWeight="bold" color="white" textAlign="center">
                Scan QR Code
              </Text>
              <Text fontSize="$3" color="white" textAlign="center">
                Point your camera at the restaurant table QR code
              </Text>
            </YStack>
          </YStack>
        </YStack>
      </CameraView>
    </ThemedView>
  );
}

// Restaurant Details Component
function RestaurantDetails({ restaurant, onScanAgain }: { restaurant: any; onScanAgain: () => void }) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.homeContent}>
        <YStack gap="$6" padding="$6" alignItems="center" flex={1}>
          <YStack gap="$4" alignItems="center" maxWidth={500} width="100%">
            <Text fontSize="$10" fontWeight="bold" textAlign="center">
              {restaurant.name} 🍴
            </Text>

            {restaurant.description && (
              <Text fontSize="$4" color="$gray11" textAlign="center">
                {restaurant.description}
              </Text>
            )}

            <YStack
              gap="$4"
              padding="$4"
              backgroundColor="$gray2"
              borderRadius="$4"
              width="100%"
              marginTop="$4"
            >
              <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
                Restaurant Details
              </Text>
              
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <Text fontSize="$4" color="$gray11">Address:</Text>
                  <Text fontSize="$4" fontWeight="600" flex={1} textAlign="right" marginLeft="$2">
                    {restaurant.address}
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$gray11">City:</Text>
                  <Text fontSize="$4" fontWeight="600">
                    {restaurant.city}
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$gray11">Country:</Text>
                  <Text fontSize="$4" fontWeight="600">
                    {restaurant.country}
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$gray11">Phone:</Text>
                  <Text fontSize="$4" fontWeight="600">
                    {restaurant.phone}
                  </Text>
                </XStack>
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$4" color="$gray11">Email:</Text>
                  <Text fontSize="$4" fontWeight="600">
                    {restaurant.email}
                  </Text>
                </XStack>
                
                {restaurant.rating !== undefined && (
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Rating:</Text>
                    <XStack gap="$1" alignItems="center">
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant.rating.toFixed(1)}
                      </Text>
                      <Text fontSize="$4">⭐</Text>
                    </XStack>
                  </XStack>
                )}
                
                {(restaurant.openingTime || restaurant.closingTime) && (
                  <XStack justifyContent="space-between">
                    <Text fontSize="$4" color="$gray11">Hours:</Text>
                    <Text fontSize="$4" fontWeight="600">
                      {restaurant.openingTime || '--'} - {restaurant.closingTime || '--'}
                    </Text>
                  </XStack>
                )}
                
                {restaurant._count && (
                  <YStack gap="$2" marginTop="$2" paddingTop="$3" borderTopWidth={1} borderColor="$gray5">
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Tables:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant._count.tables || 0}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text fontSize="$4" color="$gray11">Menu Items:</Text>
                      <Text fontSize="$4" fontWeight="600">
                        {restaurant._count.menuItems || 0}
                      </Text>
                    </XStack>
                  </YStack>
                )}
              </YStack>
            </YStack>

            <Button
              onPress={onScanAgain}
              size="$5"
              width="100%"
              backgroundColor="$blue10"
              marginTop="$4"
            >
              <Text color="white" fontWeight="600">
                Scan Another QR Code
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

// Home Page Component
function HomePage({ userData, onScanQR }: { userData: any; onScanQR: () => void }) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.homeContent}>
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
                    <Text fontSize="$4" fontWeight="600">{userData.phone}</Text>
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
          </YStack>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

// Setup Screen Component (keeping the existing setup screen code)
function SetupScreen({ onUserCreated }: { onUserCreated: (data: any) => void }) {
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
      const email = `${phone.replace(/\s/g, '')}@forks.app`;

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone: phone.replace(/\s/g, ''),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\s/g, ''),
          role,
          email,
        };

        await AsyncStorage.setItem(USER_CREATED_KEY, 'true');
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        onUserCreated(userData);
      } else {
        Alert.alert('Error', data.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your connection and try again.'
      );
      console.error('Error creating user:', error);
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
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// Main Component
export default function HomeScreen() {
  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const created = await AsyncStorage.getItem(USER_CREATED_KEY);
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      const restaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
      const scanned = await AsyncStorage.getItem(SCANNED_KEY);
      
      if (created === 'true' && data) {
        setUserCreated(true);
        setUserData(JSON.parse(data));
        
        // If user is GUEST and just created, show scanner
        const userInfo = JSON.parse(data);
        if (userInfo.role === 'GUEST' && scanned !== 'true') {
          setShowScanner(true);
          setScanning(true);
        }
        
        // If restaurant data exists, show it
        if (restaurant) {
          setRestaurantData(JSON.parse(restaurant));
        }
      } else {
        setUserCreated(false);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserCreated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (data: any) => {
    setUserCreated(true);
    setUserData(data);
    
    // If GUEST user, show QR scanner immediately
    if (data.role === 'GUEST') {
      setShowScanner(true);
      setScanning(true);
    }
  };

  const handleQRScanSuccess = async (restaurantId: string) => {
    try {
      setScanning(false);
      setShowScanner(false);
      
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
      const data = await response.json();

      if (response.ok && data.restaurant) {
        setRestaurantData(data.restaurant);
        await AsyncStorage.setItem(RESTAURANT_DATA_KEY, JSON.stringify(data.restaurant));
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch restaurant details');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      Alert.alert('Error', 'Failed to fetch restaurant details. Please try again.');
    }
  };

  const handleScanQR = () => {
    setShowScanner(true);
    setScanning(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  const handleScanAgain = () => {
    setRestaurantData(null);
    AsyncStorage.removeItem(RESTAURANT_DATA_KEY);
    AsyncStorage.removeItem(SCANNED_KEY);
    setShowScanner(true);
    setScanning(true);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text fontSize="$5" color="$gray11">
            Loading...
          </Text>
        </YStack>
      </ThemedView>
    );
  }

  if (showScanner && scanning) {
    return <QRScanner onScanSuccess={handleQRScanSuccess} onClose={handleCloseScanner} />;
  }

  if (restaurantData) {
    return <RestaurantDetails restaurant={restaurantData} onScanAgain={handleScanAgain} />;
  }

  if (userCreated) {
    return <HomePage userData={userData} onScanQR={handleScanQR} />;
  }

  return <SetupScreen onUserCreated={handleUserCreated} />;
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
  homeContent: {
    flexGrow: 1,
  },
  camera: {
    flex: 1,
  },
});
