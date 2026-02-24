import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

import { HomePage } from '@/components/home/HomePage';
import { QRScanner } from '@/components/restaurant/QRScanner';
import { API_BASE_URL } from '@/constants/api';
import { StorageService } from '@/utils/storage';
import { MenuItem } from '@/types';


const RESTAURANT_DATA_KEY = '@forks_restaurant_data';
const SCANNED_KEY = '@forks_qr_scanned';


export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  // Listen for QR scan trigger and logout trigger from bottom navigation
  useFocusEffect(
    React.useCallback(() => {
      const checkTriggers = async () => {
        try {
          // Check for QR scan trigger
          const triggerQR = await AsyncStorage.getItem('@forks_trigger_qr_scan');
          if (triggerQR === 'true') {
            await AsyncStorage.removeItem('@forks_trigger_qr_scan');
            const currentRestaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
            if (currentRestaurant) {
              setRestaurantData(null);
              setTableInfo(null);
              setOrderId(null);
              await AsyncStorage.removeItem(RESTAURANT_DATA_KEY);
              await AsyncStorage.removeItem(SCANNED_KEY);
              await StorageService.setOrderId(null);
              setShowScanner(true);
              setScanning(true);
            } else {
              setShowScanner(true);
              setScanning(true);
            }
          }
        } catch (error) {
          console.error('Error checking triggers:', error);
        }
      };

      // If user is staff/admin, redirect to staff dashboard
      if (user && (user.role === 'STAFF' || user.role === 'ADMIN')) {
        router.replace('/(staff)/(tabs)/dashboard');
        return;
      }

      checkTriggers();
    }, [user])
  );

  const checkStatus = async () => {
    try {
      const restaurant = await AsyncStorage.getItem(RESTAURANT_DATA_KEY);
      const scanned = await AsyncStorage.getItem(SCANNED_KEY);

      // If restaurant data exists, show it
      if (restaurant) {
        setRestaurantData(JSON.parse(restaurant));
      }

      // If no restaurant scanned, show QR scanner for guests
      if (scanned !== 'true' && !restaurant) {
        setShowScanner(true);
        setScanning(true);
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
    } catch (error) {
      console.error('Error checking status:', error);
      setShowScanner(true);
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = async (restaurantId: string) => {
    try {
      setScanning(false);
      setShowScanner(false);

      const response = await fetch(`${API_BASE_URL}/api/restaurants/by-qr/${restaurantId}`);
      const data = await response.json();

      if (response.ok && data.restaurant) {
        await StorageService.clearLocalCart();
        setRestaurantData(data.restaurant);
        await AsyncStorage.setItem(RESTAURANT_DATA_KEY, JSON.stringify(data.restaurant));
        await AsyncStorage.setItem(SCANNED_KEY, 'true');

        setOrderId(null);
        await StorageService.setOrderId(null);

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
    StorageService.clearLocalCart();
    setShowScanner(true);
    setScanning(true);
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    try {
      await StorageService.addToLocalCart(menuItem, 1);
      await AsyncStorage.setItem('@forks_refresh_cart', 'true');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local state
      setRestaurantData(null);
      setTableInfo(null);
      setOrderId(null);
      setShowScanner(true);
      setScanning(true);

      // Clear restaurant-specific storage
      await AsyncStorage.multiRemove([RESTAURANT_DATA_KEY, SCANNED_KEY]);
      await StorageService.setOrderId(null);
      await StorageService.clearLocalCart();

      // Use context logout
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
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
    let tableNumber = '5'; // Default
    if (tableInfo?.uniqueId && restaurantData.tables) {
      const table = restaurantData.tables.find((t: any) => t.uniqueId === tableInfo.uniqueId);
      if (table?.tableNumber) {
        tableNumber = String(table.tableNumber);
      }
    }

    return (
      <HomePage
        userData={user}
        onScanQR={handleScanQR}
        onLogout={handleLogout}
        restaurantId={restaurantData.id}
        tableNumber={tableNumber}
      />
    );
  }

  // Default: show QR scanner prompt (guest with no restaurant scanned)
  return <QRScanner onScanSuccess={handleQRScanSuccess} onClose={handleCloseScanner} />;
}
