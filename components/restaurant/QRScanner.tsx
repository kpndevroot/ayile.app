import { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { ThemedView } from '@/components/themed-view';
import { parseQRCode } from '@/utils/api';
import { StorageService } from '@/utils/storage';

interface QRScannerProps {
  onScanSuccess: (restaurantId: string) => void;
  onClose: () => void;
}

/**
 * QR Scanner Component
 * Camera interface for scanning restaurant table QR codes
 */
export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
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
      // Parse the QR code URL to extract restaurant ID and table unique ID
      const parsed = parseQRCode(data);
      
      if (parsed) {
        const { restaurantId, tableUniqueId } = parsed;
        
        // Store table info
        await StorageService.setTableInfo({ uniqueId: tableUniqueId });
        await StorageService.setScanned(true);
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
                  borderColor: '#3B82F6', // blue10
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
                  borderColor: '#3B82F6', // blue10
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
                  borderColor: '#3B82F6', // blue10
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
                  borderColor: '#3B82F6', // blue10
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});
