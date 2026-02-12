import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let soundObject: Audio.Sound | null = null;

/**
 * Play a short notification sound.
 * Uses a system-compatible tone generated via Audio API.
 * Gracefully handles failures (sound is non-critical).
 */
export async function playNotificationSound(): Promise<void> {
  try {
    // Configure audio mode for notification playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    // Unload previous sound if still loaded
    if (soundObject) {
      try {
        await soundObject.unloadAsync();
      } catch {
        // ignore
      }
      soundObject = null;
    }

    // Use a simple built-in tone — create a short beep via expo-av
    // We generate a data URI for a tiny WAV notification chime
    const { sound } = await Audio.Sound.createAsync(
      // Minimal WAV: 44100Hz, mono, 16-bit, ~0.15s ping tone (A5 = 880Hz)
      { uri: generateToneDataUri(880, 0.15) },
      { shouldPlay: true, volume: 0.7 }
    );
    soundObject = sound;

    // Auto-unload after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        soundObject = null;
      }
    });
  } catch (error) {
    // Sound is non-critical — log and move on
    console.warn('[NotificationSound] Failed to play:', error);
  }
}

/**
 * Generate a data URI for a simple sine-wave tone WAV.
 */
function generateToneDataUri(frequency: number, durationSec: number): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = numSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate sine wave with fade-in/out envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;

    // Envelope: quick attack, gradual decay
    let envelope = 1;
    if (progress < 0.05) {
      envelope = progress / 0.05;
    } else if (progress > 0.6) {
      envelope = (1 - progress) / 0.4;
    }

    // Two-tone chime: fundamental + octave above for pleasant sound
    const sample =
      envelope * 0.5 * Math.sin(2 * Math.PI * frequency * t) +
      envelope * 0.3 * Math.sin(2 * Math.PI * frequency * 1.5 * t);

    const clampedSample = Math.max(-1, Math.min(1, sample));
    view.setInt16(headerSize + i * bytesPerSample, clampedSample * 0x7fff, true);
  }

  // Convert to base64 data URI
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
