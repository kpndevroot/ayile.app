import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { StorageService } from '@/utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { DesignTokens } from '@/constants/design';

/**
 * ProfileScreen
 *
 * Design rules applied:
 * - Serial Position: key user info at top, destructive logout at bottom
 * - Visual Hierarchy: large avatar + name dominant, sections grouped by meaning
 * - Fitts's Law: large touch targets (56px row height)
 * - Accessibility: contrast ratios, semantic colors, readable font sizes
 * - Consistent spacing: 8pt grid via DesignTokens
 * - Jakob's Law: standard profile page patterns (avatar → info → menu → logout)
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, requireAuth, logout: contextLogout, setAuthMode } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const fetchProfileData = async (userId: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.BY_ID(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch profile data');
    }
    const data = await response.json();
    return data.user;
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await StorageService.getUserId();
      const AuthToken = await StorageService.getAuthToken();
      if (userId && AuthToken) {
        const data = await fetchProfileData(userId, AuthToken);
        setUserData(data);
      } else {
        setError('Please log in to view your profile');
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setUserData(null);
            await contextLogout();
            router.replace('/(tabs)/' as any);
          } catch {
            router.replace('/(tabs)/' as any);
          }
        },
      },
    ]);
  };

  const displayName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.name || 'User';

  const initials = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase()
    : 'U';

  const contactInfo = userData?.email || userData?.phone || '';

  // ─── Unauthenticated state ───
  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.guestScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <MaterialIcons name="person-outline" size={44} color={DesignTokens.colors.lightBrown[400]} />
            </View>
            <Text fontSize={26} fontWeight="800" color={DesignTokens.colors.brown[900]}>
              Welcome to Ayile
            </Text>
            <Text
              fontSize={15}
              color={DesignTokens.colors.lightBrown[400]}
              textAlign="center"
              lineHeight={22}
            >
              Sign in to view your profile, track{'\n'}orders, and manage preferences.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => requireAuth(() => loadUserData())}
              activeOpacity={0.8}
            >
              <MaterialIcons name="login" size={20} color="#FFF" />
              <Text fontSize={16} fontWeight="700" color="#FFF" marginLeft={8}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setAuthMode('signup');
                requireAuth(() => loadUserData());
              }}
              activeOpacity={0.7}
              style={{ marginTop: 4 }}
            >
              <Text fontSize={15} color={DesignTokens.colors.orange[500]} fontWeight="600">
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // ─── Authenticated state ───
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <Text
          fontSize={28}
          fontWeight="800"
          color={DesignTokens.colors.brown[900]}
          style={styles.title}
        >
          Profile
        </Text>

        {/* Loading */}
        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={DesignTokens.colors.orange[500]} />
            <Text fontSize={14} color={DesignTokens.colors.lightBrown[400]} marginTop={12}>
              Loading profile...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={24} color={DesignTokens.colors.semantic.error} />
            <Text fontSize={14} color={DesignTokens.colors.semantic.error} marginTop={8}>
              {error}
            </Text>
            <TouchableOpacity onPress={loadUserData} style={styles.retryBtn}>
              <Text fontSize={14} fontWeight="600" color="#FFF">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Card */}
        {!loading && !error && (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text fontSize={30} fontWeight="800" color="#FFF">
                  {initials}
                </Text>
              </View>
              <Text
                fontSize={22}
                fontWeight="700"
                color={DesignTokens.colors.brown[900]}
                marginTop={14}
              >
                {displayName}
              </Text>
              {contactInfo ? (
                <Text
                  fontSize={14}
                  color={DesignTokens.colors.lightBrown[400]}
                  marginTop={4}
                >
                  {contactInfo}
                </Text>
              ) : null}
              {userData?.role && (
                <View style={styles.roleBadge}>
                  <Text fontSize={12} fontWeight="700" color={DesignTokens.colors.orange[600]}>
                    {userData.role}
                  </Text>
                </View>
              )}
            </View>

            {/* ─── Activity Section ─── */}
            <Text style={styles.sectionLabel}>Activity</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="receipt-long"
                label="Order History"
                onPress={() => router.push('/(tabs)/order')}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="favorite-border"
                label="Saved Items"
                onPress={() => { }}
              />
            </View>

            {/* ─── Preferences Section ─── */}
            <Text style={styles.sectionLabel}>Preferences</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="notifications-none"
                label="Notifications"
                onPress={() => { }}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="language"
                label="Language"
                subtitle="English"
                onPress={() => { }}
              />
            </View>

            {/* ─── Support Section ─── */}
            <Text style={styles.sectionLabel}>Support</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="help-outline"
                label="Help & Support"
                onPress={() => { }}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="info-outline"
                label="About"
                onPress={() => { }}
              />
            </View>

            {/* ─── Logout ─── */}
            <View style={[styles.menuGroup, { marginTop: 24 }]}>
              <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.7}
                style={styles.logoutRow}
              >
                <XStack alignItems="center" gap={14}>
                  <View style={[styles.menuIcon, { backgroundColor: DesignTokens.colors.semantic.error + '12' }]}>
                    <MaterialIcons name="logout" size={20} color={DesignTokens.colors.semantic.error} />
                  </View>
                  <Text fontSize={16} fontWeight="600" color={DesignTokens.colors.semantic.error}>
                    Logout
                  </Text>
                </XStack>
              </TouchableOpacity>
            </View>

            {/* App version */}
            <Text
              fontSize={12}
              color={DesignTokens.colors.lightBrown[300]}
              textAlign="center"
              marginTop={24}
              marginBottom={8}
            >
              Ayile v1.0.0
            </Text>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// ─── Reusable menu row ───
function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.menuRow}>
      <XStack alignItems="center" gap={14} flex={1}>
        <View style={styles.menuIcon}>
          <MaterialIcons name={icon as any} size={20} color={DesignTokens.colors.brown[700]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text fontSize={16} fontWeight="500" color={DesignTokens.colors.brown[900]}>
            {label}
          </Text>
          {subtitle && (
            <Text fontSize={13} color={DesignTokens.colors.lightBrown[400]} marginTop={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </XStack>
      <MaterialIcons name="chevron-right" size={22} color={DesignTokens.colors.beige[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.light,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 64 : 24,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 24,
  },

  // Profile card
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignTokens.colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DesignTokens.colors.orange[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: DesignTokens.colors.orange[50],
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700' as any,
    color: DesignTokens.colors.lightBrown[400],
    textTransform: 'uppercase' as any,
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 10,
    marginLeft: 4,   
  },

  // Menu groups
  menuGroup: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: DesignTokens.colors.beige[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: DesignTokens.colors.beige[200],
    marginLeft: 66, // icon 36 + gap 14 + padding 16
  },

  // Logout row
  logoutRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  // States
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: DesignTokens.colors.orange[500],
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },

  // Guest / unauthenticated
  guestScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  guestCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  guestAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DesignTokens.colors.beige[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.orange[500],
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
    shadowColor: DesignTokens.colors.orange[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
