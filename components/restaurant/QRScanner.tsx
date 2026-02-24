import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Alert, View, Dimensions, TouchableOpacity, Platform, StatusBar, TextInput } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { parseQRCode } from '@/utils/api';
import { StorageService } from '@/utils/storage';
import { DesignTokens } from '@/constants/design';

// Conditionally import expo-camera (not available on web)
let CameraView: any = null;
let useCameraPermissions: any = null;
if (Platform.OS !== 'web') {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
}

// Import jsQR for web-based QR decoding
let jsQR: any = null;
if (Platform.OS === 'web') {
  jsQR = require('jsqr');
}

interface QRScannerProps {
  onScanSuccess: (restaurantId: string) => void;
  onClose: () => void;
}

/**
 * Web QR Scanner: uses browser camera via getUserMedia + jsQR for real-time decoding
 * Falls back to manual text input if camera access is denied
 */
function WebQRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [cameraState, setCameraState] = useState<'prompt' | 'loading' | 'active' | 'denied' | 'unsupported' | 'manual'>('prompt');
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup camera stream on unmount
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Called from a user tap — mobile browsers require user gesture for getUserMedia
  const startCamera = async () => {
    // Check if getUserMedia is available (requires HTTPS on mobile)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    setCameraState('loading');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        scanFrame();
      }
    } catch (err: any) {
      console.warn('[WebQR] Camera access failed:', err?.name, err?.message);
      if (err?.name === 'NotAllowedError') {
        setCameraState('denied');
      } else if (err?.name === 'NotFoundError') {
        setCameraState('unsupported');
      } else {
        setCameraState('denied');
      }
    }
  };

  const scanFrame = () => {
    if (scanned) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleQRDetected(code.data);
      return; // Stop scanning
    }

    // Keep scanning at ~15fps
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQRDetected = async (data: string) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = parseQRCode(data);
      if (parsed) {
        stopCamera();
        await StorageService.setScanned(true);
        onScanSuccess(parsed.restaurantId);
      } else {
        setError('Invalid QR code. Please scan a valid restaurant code.');
        setScanned(false);
        // Resume scanning after brief pause
        setTimeout(() => {
          setError('');
          scanFrame();
        }, 2000);
      }
    } catch (err) {
      console.error('Error parsing QR code:', err);
      setError('Failed to process QR code.');
      setScanned(false);
      setTimeout(() => {
        setError('');
        scanFrame();
      }, 2000);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      setError('Please enter the 4-character table code');
      return;
    }
    try {
      const parsed = parseQRCode(manualInput.trim());
      if (parsed) {
        stopCamera();
        await StorageService.setScanned(true);
        onScanSuccess(parsed.restaurantId);
      } else {
        setError('Invalid code. Enter the 4-character code from your table (e.g. A1B2).');
      }
    } catch (err) {
      setError('Failed to process code.');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Prompt: show "Tap to Start Camera" — needed for mobile browser user gesture requirement
  if (cameraState === 'prompt') {
    return (
      <View style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding={DesignTokens.spacing.xl} gap={DesignTokens.spacing.lg}>
          <TouchableOpacity onPress={handleClose} style={styles.webBackButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={DesignTokens.colors.neutral.white} />
          </TouchableOpacity>

          <View style={styles.webIconContainer}>
            <MaterialIcons name="photo-camera" size={80} color={DesignTokens.colors.teal[400]} />
          </View>

          <Text fontSize={DesignTokens.typography.fontSize['2xl']} fontWeight={DesignTokens.typography.fontWeight.bold} color={DesignTokens.colors.neutral.white} textAlign="center">
            Scan QR Code
          </Text>
          <Text fontSize={DesignTokens.typography.fontSize.md} color={DesignTokens.colors.charcoal[300]} textAlign="center">
            Your browser needs camera access to scan restaurant QR codes.
          </Text>

          <TouchableOpacity onPress={startCamera} style={styles.webCameraButton} activeOpacity={0.8}>
            <MaterialIcons name="photo-camera" size={22} color={DesignTokens.colors.neutral.white} />
            <Text color={DesignTokens.colors.neutral.white} fontWeight={DesignTokens.typography.fontWeight.semibold} fontSize={DesignTokens.typography.fontSize.md} marginLeft={10}>
              Open Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCameraState('manual')} activeOpacity={0.7}>
            <Text fontSize={DesignTokens.typography.fontSize.sm} color={DesignTokens.colors.teal[400]} textAlign="center">
              Or enter code manually
            </Text>
          </TouchableOpacity>
        </YStack>
      </View>
    );
  }

  // Camera denied, unsupported (HTTP / no camera), or user chose manual entry
  if (cameraState === 'denied' || cameraState === 'manual' || cameraState === 'unsupported') {
    const isUnsupported = cameraState === 'unsupported';
    const isDenied = cameraState === 'denied';

    return (
      <View style={styles.container}>
        <YStack flex={1} alignItems="center" justifyContent="center" padding={DesignTokens.spacing.xl} gap={DesignTokens.spacing.lg}>
          <TouchableOpacity onPress={handleClose} style={styles.webBackButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={DesignTokens.colors.neutral.white} />
          </TouchableOpacity>

          <View style={styles.webIconContainer}>
            <MaterialIcons name={isUnsupported ? 'no-photography' : isDenied ? 'camera-alt' : 'qr-code-scanner'} size={80} color={DesignTokens.colors.teal[400]} />
          </View>

          <Text fontSize={DesignTokens.typography.fontSize['2xl']} fontWeight={DesignTokens.typography.fontWeight.bold} color={DesignTokens.colors.neutral.white} textAlign="center">
            {isUnsupported ? 'Camera Not Available' : isDenied ? 'Camera Access Denied' : 'Enter Code Manually'}
          </Text>
          <Text fontSize={DesignTokens.typography.fontSize.md} color={DesignTokens.colors.charcoal[300]} textAlign="center">
            {isUnsupported
              ? 'Camera is unavailable. Enter the 4-character code from the restaurant table:'
              : isDenied
                ? 'Tap "Try Again" to allow camera, or enter the 4-character table code:'
                : 'Enter the 4-character code from the restaurant table (e.g. A1B2):'}
          </Text>

          {isDenied && (
            <TouchableOpacity onPress={startCamera} style={styles.webRetryButton} activeOpacity={0.8}>
              <MaterialIcons name="refresh" size={20} color={DesignTokens.colors.neutral.white} />
              <Text color={DesignTokens.colors.neutral.white} fontWeight={DesignTokens.typography.fontWeight.semibold} fontSize={DesignTokens.typography.fontSize.sm} marginLeft={8}>
                Try Again
              </Text>
            </TouchableOpacity>
          )}

          <TextInput
            style={styles.webInput}
            value={manualInput}
            onChangeText={(text) => { setManualInput(text); setError(''); }}
            placeholder="Enter 4-character code (e.g. A1B2)"
            placeholderTextColor={DesignTokens.colors.charcoal[500]}
            autoCapitalize="characters"
            maxLength={4}
            autoCorrect={false}
            onSubmitEditing={handleManualSubmit}
          />
          {error ? <Text fontSize={DesignTokens.typography.fontSize.sm} color="#ef4444" textAlign="center">{error}</Text> : null}
          <TouchableOpacity onPress={handleManualSubmit} style={styles.webSubmitButton} activeOpacity={0.8}>
            <Text color={DesignTokens.colors.neutral.white} fontWeight={DesignTokens.typography.fontWeight.semibold} fontSize={DesignTokens.typography.fontSize.md}>
              Go to Restaurant
            </Text>
          </TouchableOpacity>
        </YStack>
      </View>
    );
  }

  // Camera active or loading — render video + overlay
  return (
    <View style={styles.container}>
      {/* Hidden canvas for QR frame decoding */}
      <canvas ref={canvasRef as any} style={{ display: 'none' }} />

      {/* Camera video feed */}
      <video
        ref={videoRef as any}
        style={{
          position: 'absolute' as any,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover' as any,
          backgroundColor: '#000',
        }}
        playsInline
        muted
      />

      {/* Overlay UI */}
      <View style={styles.webOverlay}>
        {/* Back button - top left */}
        <TouchableOpacity onPress={handleClose} style={styles.backButtonOverlay} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={DesignTokens.colors.neutral.white} />
        </TouchableOpacity>

        {/* Switch to manual input - top right */}
        <TouchableOpacity
          onPress={() => { stopCamera(); setCameraState('manual'); }}
          style={styles.webManualButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="keyboard" size={20} color={DesignTokens.colors.neutral.white} />
          <Text color={DesignTokens.colors.neutral.white} fontSize={DesignTokens.typography.fontSize.sm} marginLeft={6}>
            Enter Code
          </Text>
        </TouchableOpacity>

        {/* Scan area with corner markers */}
        <YStack flex={1} alignItems="center" justifyContent="center">
          <View style={[styles.scanArea, { width: 260, height: 260 }]}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Status text */}
          <YStack marginTop={DesignTokens.spacing.xl} alignItems="center">
            {cameraState === 'loading' ? (
              <Text fontSize={DesignTokens.typography.fontSize.md} color={DesignTokens.colors.neutral.white} textAlign="center">
                Starting camera...
              </Text>
            ) : error ? (
              <Text fontSize={DesignTokens.typography.fontSize.md} color="#ef4444" textAlign="center">
                {error}
              </Text>
            ) : (
              <Text fontSize={DesignTokens.typography.fontSize.md} color={DesignTokens.colors.charcoal[200]} textAlign="center">
                Point your camera at a restaurant QR code
              </Text>
            )}
          </YStack>
        </YStack>
      </View>
    </View>
  );
}

/**
 * QR Scanner Component
 * Uses browser camera on web (getUserMedia + jsQR), expo-camera on native
 */
export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  if (Platform.OS === 'web') {
    return <WebQRScanner onScanSuccess={onScanSuccess} onClose={onClose} />;
  }
  return <NativeQRScanner onScanSuccess={onScanSuccess} onClose={onClose} />;
}

/**
 * Native-only QR scanner using expo-camera
 */
function NativeQRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions!();
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
  // Web-specific styles
  webBackButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  webIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  webInput: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 16,
  },
  webSubmitButton: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: DesignTokens.colors.teal[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  webManualButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: DesignTokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  webCameraButton: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.teal[500],
    paddingVertical: 16,
    borderRadius: 12,
  },
  webRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});