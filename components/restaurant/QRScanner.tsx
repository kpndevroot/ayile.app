import { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, Dimensions, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { parseQRCode } from '@/utils/api';
import { StorageService } from '@/utils/storage';
import { DesignTokens } from '@/constants/design';

interface QRScannerProps {
  onScanSuccess: (restaurantId: string) => void;
  onClose: () => void;
}

/**
 * QR Scanner Component
 * Modern camera interface for scanning restaurant table QR codes
 * Matches the exact design from the provided PNG screen
 */
export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

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
      const parsed = parseQRCode(data);
      
      if (parsed) {
        const { restaurantId } = parsed;
        
        // Mark as scanned
        await StorageService.setScanned(true);
        onScanSuccess(restaurantId);
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid restaurant code.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setScanned(false);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={DesignTokens.colors.charcoal[900]} />
        <YStack flex={1} alignItems="center" justifyContent="center" padding={DesignTokens.spacing.lg}>
          <Text fontSize={DesignTokens.typography.fontSize.lg} color={DesignTokens.colors.neutral.white} textAlign="center">
            Requesting camera permission...
          </Text>
        </YStack>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={DesignTokens.colors.charcoal[900]} />
        <YStack flex={1} alignItems="center" justifyContent="center" padding={DesignTokens.spacing.lg} gap={DesignTokens.spacing.lg}>
          <Text 
            fontSize={DesignTokens.typography.fontSize['2xl']} 
            fontWeight={DesignTokens.typography.fontWeight.bold} 
            color={DesignTokens.colors.neutral.white}
            textAlign="center"
          >
            Camera Permission Required
          </Text>
          <Text 
            fontSize={DesignTokens.typography.fontSize.md} 
            color={DesignTokens.colors.charcoal[300]} 
            textAlign="center"
            lineHeight={DesignTokens.typography.lineHeight.normal}
          >
            We need access to your camera to scan QR codes
          </Text>
          <TouchableOpacity 
            onPress={requestPermission}
            style={styles.permissionButton}
            activeOpacity={0.8}
          >
            <Text 
              color={DesignTokens.colors.neutral.white} 
              fontWeight={DesignTokens.typography.fontWeight.semibold}
              fontSize={DesignTokens.typography.fontSize.md}
            >
              Grant Permission
            </Text>
          </TouchableOpacity>
        </YStack>
      </View>
    );
  }

  const { width, height } = Dimensions.get('window');
  const scanAreaSize = Math.min(width, height) * 0.65;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DesignTokens.colors.charcoal[900]} />
      
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashEnabled}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Back Button - Top Left */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.backButtonOverlay}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={DesignTokens.colors.neutral.white} />
        </TouchableOpacity>

        {/* Scan Area */}
        <YStack flex={1} alignItems="center" justifyContent="center">
          <View style={[styles.scanArea, { width: scanAreaSize, height: scanAreaSize }]}>
            {/* Top Left Corner */}
            <View style={[styles.corner, styles.topLeft]} />
            
            {/* Top Right Corner */}
            <View style={[styles.corner, styles.topRight]} />
            
            {/* Bottom Left Corner */}
            <View style={[styles.corner, styles.bottomLeft]} />
            
            {/* Bottom Right Corner */}
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </YStack>

        {/* Flash Button - Bottom Center */}
        <TouchableOpacity
          onPress={toggleFlash}
          style={[styles.flashButtonOverlay, flashEnabled && styles.flashButtonActive]}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={flashEnabled ? "flash-on" : "flash-off"} 
            size={28} 
            color={DesignTokens.colors.neutral.white} 
          />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.charcoal[900],
  },
  camera: {
    flex: 1,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: DesignTokens.spacing.lg,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  permissionButton: {
    backgroundColor: DesignTokens.colors.teal[500],
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: DesignTokens.colors.teal[500],
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  flashButtonOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  flashButtonActive: {
    backgroundColor: DesignTokens.colors.teal[500],
    borderColor: DesignTokens.colors.teal[400],
  },
});