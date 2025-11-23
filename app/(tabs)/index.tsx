import { useState, useEffect } from 'react';
import {  StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { SetupScreen } from '@/components/auth/SetupScreen';
import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { HomePage } from '@/components/home/HomePage';
import { QRScanner } from '@/components/restaurant/QRScanner';
import { AuthService } from '@/services/authService';


const USER_CREATED_KEY = '@forks_user_created';
const USER_DATA_KEY = '@forks_user_data';
const RESTAURANT_DATA_KEY = '@forks_restaurant_data';
const SCANNED_KEY = '@forks_qr_scanned';

const API_BASE_URL = 'http://192.168.30.26:3000';


// QR Scanner Component - Now imported from components/restaurant/QRScanner

// Main Component
export default function HomeScreen() {
  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
        setShowLogin(true); // Show login screen first
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserCreated(false);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
    // If GUEST user, show QR scanner immediately
    if (data.role === 'GUEST') {
      setShowScanner(true);
      setScanning(true);
    }
  };

  const handleLoginSuccess = (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
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

  const handleLogout = async () => {
    try {
      // Call logout API and clear storage (if not already done by TopBar)
      await AuthService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Reset all state
      setUserCreated(false);
      setUserData(null);
      setRestaurantData(null);
      setShowScanner(false);
      setScanning(false);
      setShowLogin(true); // Show login screen
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (showScanner && scanning) {
    return <QRScanner onScanSuccess={handleQRScanSuccess} onClose={handleCloseScanner} />;
  }

  if (restaurantData) {
    return <RestaurantDetails restaurant={restaurantData} onScanAgain={handleScanAgain} onLogout={handleLogout} />;
  }

  if (userCreated) {
    return <HomePage userData={userData} onScanQR={handleScanQR} onLogout={handleLogout} />;
  }

  if (showLogin) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowLogin(false)}
      />
    );
  }

  return (
    <SetupScreen
      onUserCreated={handleUserCreated}
      onSwitchToLogin={() => setShowLogin(true)}
    />
  );
}
