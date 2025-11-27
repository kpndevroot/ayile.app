import React, { useState, useEffect } from 'react';
import {  StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { SetupScreen } from '@/components/auth/SetupScreen';
import { RestaurantDetails } from '@/components/restaurant/RestaurantDetails';
import { MenuListingScreen } from '@/components/menu/MenuListingScreen';
import { HomePage } from '@/components/home/HomePage';
import { QRScanner } from '@/components/restaurant/QRScanner';
import { AuthService } from '@/services/authService';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { StorageService } from '@/utils/storage';
import { MenuItem } from '@/types';


const USER_CREATED_KEY = '@forks_user_created';
const USER_DATA_KEY = '@forks_user_data';
const RESTAURANT_DATA_KEY = '@forks_restaurant_data';
const SCANNED_KEY = '@forks_qr_scanned';


// QR Scanner Component - Now imported from components/restaurant/QRScanner

// Main Component
export default function HomeScreen() {
  const [userCreated, setUserCreated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  // Listen for QR scan trigger from bottom navigation
  useFocusEffect(
    React.useCallback(() => {
      const checkQRTrigger = async () => {
        try {
          const triggerQR = await AsyncStorage.getItem('@forks_trigger_qr_scan');
          if (triggerQR === 'true') {
            // Clear the flag
            await AsyncStorage.removeItem('@forks_trigger_qr_scan');
            // Trigger QR scanner (scan another QR if restaurant exists)
            const currentRestaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
            if (currentRestaurant) {
              // Clear restaurant data and trigger scan again
              setRestaurantData(null);
              setTableInfo(null);
              setOrderId(null);
              await AsyncStorage.removeItem(RESTAURANT_DATA_KEY);
              await AsyncStorage.removeItem(SCANNED_KEY);
              await StorageService.setOrderId(null);
              setShowScanner(true);
              setScanning(true);
            } else {
              // Just trigger scanner
              setShowScanner(true);
              setScanning(true);
            }
          }
        } catch (error) {
          console.error('Error checking QR trigger:', error);
        }
      };
      checkQRTrigger();
    }, [])
  );

  const checkUserStatus = async () => {
    try {
      const created = await AsyncStorage.getItem(USER_CREATED_KEY);
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      const restaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
      const scanned = await AsyncStorage.getItem(SCANNED_KEY);
      
      if (created === 'true' && data) {
        setUserCreated(true);
        setUserData(JSON.parse(data));
        
        // If user is CUSTOMER and just created, show scanner
        const userInfo = JSON.parse(data);
        if (userInfo.role === 'CUSTOMER' && scanned !== 'true') {
          setShowScanner(true);
          setScanning(true);
        }
        
        // If restaurant data exists, show it
        if (restaurant) {
          setRestaurantData(JSON.parse(restaurant));
        }

        // Load table info and order ID
        const tableInfoData = await StorageService.getTableInfo();
        if (tableInfoData) {
          setTableInfo(tableInfoData);
        }
        const savedOrderId = await StorageService.getOrderId();
        if (savedOrderId) {
          setOrderId(savedOrderId);
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

  const handleUserCreated = async (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
    // If CUSTOMER user, show QR scanner immediately (new user, no scan yet)
    if (data.role === 'CUSTOMER') {
      setShowScanner(true);
      setScanning(true);
    }
  };

  const handleLoginSuccess = async (data: any) => {
    setUserCreated(true);
    setUserData(data);
    setShowLogin(false);
    
    // If CUSTOMER user, check if they have scanned a QR code
    if (data.role === 'CUSTOMER') {
      const scanned = await AsyncStorage.getItem(SCANNED_KEY);
      const restaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
      
      // If no restaurant scanned, show QR scanner immediately
      if (scanned !== 'true' && !restaurant) {
        setShowScanner(true);
        setScanning(true);
      } else if (restaurant) {
        // If restaurant exists, load it
        setRestaurantData(JSON.parse(restaurant));
      }
    }
  };

  const handleQRScanSuccess = async (restaurantId: string) => {
    try {
      setScanning(false);
      setShowScanner(false);
      
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
      const data = await response.json();

      if (response.ok && data.restaurant) {
        // Clear local cart when scanning a new restaurant
        await StorageService.clearLocalCart();
        setRestaurantData(data.restaurant);
        await AsyncStorage.setItem(RESTAURANT_DATA_KEY, JSON.stringify(data.restaurant));
        await AsyncStorage.setItem(SCANNED_KEY, 'true'); // Mark as scanned
        
        // Clear order ID when switching restaurants
        setOrderId(null);
        await StorageService.setOrderId(null);
        
        // Load table info if available
        const tableInfoData = await StorageService.getTableInfo();
        if (tableInfoData) {
          setTableInfo(tableInfoData);
        }
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
    setTableInfo(null);
    setOrderId(null);
    AsyncStorage.removeItem(RESTAURANT_DATA_KEY);
    AsyncStorage.removeItem(SCANNED_KEY);
    StorageService.setOrderId(null);
    // Clear local cart when scanning again
    StorageService.clearLocalCart();
    setShowScanner(true);
    setScanning(true);
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    try {
      // Add item to local cart (no API call)
      await StorageService.addToLocalCart(menuItem, 1);
      
      // Trigger cart refresh in CustomTabBar and cart screen
      await AsyncStorage.setItem('@forks_refresh_cart', 'true');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
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

  // Show QR scanner if scanning is active
  if (showScanner && scanning) {
    return <QRScanner onScanSuccess={handleQRScanSuccess} onClose={handleCloseScanner} />;
  }

  // Show menu listing screen if restaurant data exists
  if (restaurantData) {
    // Get table number from restaurant tables if available
    let tableNumber = '24'; // Default
    if (tableInfo?.uniqueId && restaurantData.tables) {
      const table = restaurantData.tables.find((t: any) => t.uniqueId === tableInfo.uniqueId);
      if (table?.tableNumber) {
        tableNumber = String(table.tableNumber);
      }
    }
    
    return (
      <MenuListingScreen
        restaurantId={restaurantData.id}
        tableNumber={tableNumber}
        onAddToCart={handleAddToCart}
      />
    );
  }

  // Show home page if user is created
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
