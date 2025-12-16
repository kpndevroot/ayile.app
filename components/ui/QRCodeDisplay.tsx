import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  value: string; // The data to encode in the QR code
  size?: number; // Size of the QR code (default: 250)
  backgroundColor?: string; // Background color (default: white)
  color?: string; // QR code color (default: black)
  logo?: any; // Optional logo in the center
  logoSize?: number; // Size of the logo
  logoBackgroundColor?: string; // Background color for logo area
  logoMargin?: number; // Margin around logo
  style?: ViewStyle; // Additional styles
}

/**
 * QRCodeDisplay Component
 * Generates and displays a QR code locally without API calls
 * 
 * @example
 * <QRCodeDisplay 
 *   value="https://example.com/restaurant/123/table/5"
 *   size={250}
 * />
 */
export function QRCodeDisplay({
  value,
  size = 250,
  backgroundColor = '#FFFFFF',
  color = '#000000',
  logo,
  logoSize = 60,
  logoBackgroundColor = '#FFFFFF',
  logoMargin = 2,
  style,
}: QRCodeDisplayProps) {
  if (!value) {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <View style={styles.placeholder}>
          {/* Placeholder content if needed */}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <QRCode
        value={value}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        logo={logo}
        logoSize={logoSize}
        logoBackgroundColor={logoBackgroundColor}
        logoMargin={logoMargin}
        quietZone={10} // Padding around QR code
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
});
