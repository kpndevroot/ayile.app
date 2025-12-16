import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { YStack, XStack } from '@tamagui/stacks';
import { Text } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Phone, LogOut, ArrowRight, Building2, ShieldCheck, Mail } from '@tamagui/lucide-icons';
import { DesignTokens } from '@/constants/design';
import { AuthService } from '@/services/authService';
import { StorageService } from '@/utils/storage';
import { StaffService } from '@/services/staffService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

/**
 * Staff Profile Screen
 * Allows staff to view their profile details and logout
 */
export default function StaffProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const userData = await StorageService.getUserData();
        setUser(userData);

        const restaurantData = await StaffService.getRestaurantDetails();
        setRestaurant(restaurantData);
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await AuthService.logout();
                            // Clear storage explicitly just in case
                            await StorageService.clearAll();
                            // Navigate to root which loads (tabs)/index.tsx -> LoginScreen
                            router.replace('/');
                        } catch (error) {
                            console.error('Logout failed:', error);
                            // Ensure redirect happens even on error
                            router.replace('/');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const ProfileItem = ({ icon: Icon, label, value, color = DesignTokens.colors.brown[900] }: any) => (
        <XStack
            paddingVertical="$3"
            borderBottomWidth={1}
            borderBottomColor={DesignTokens.colors.beige[300]}
            alignItems="center"
            space="$3"
        >
            <XStack
                width={40}
                height={40}
                backgroundColor={DesignTokens.colors.beige[200]}
                borderRadius={DesignTokens.radius.full}
                alignItems="center"
                justifyContent="center"
            >
                <Icon size={20} color={DesignTokens.colors.brown[600]} />
            </XStack>
            <YStack flex={1}>
                <Text fontSize={DesignTokens.typography.fontSize.xs} color={DesignTokens.colors.brown[600]}>
                    {label}
                </Text>
                <Text fontSize={DesignTokens.typography.fontSize.md} fontWeight="600" color={color}>
                    {value || 'N/A'}
                </Text>
            </YStack>
        </XStack>
    );

    return (
        <YStack flex={1} backgroundColor={DesignTokens.colors.background.light} paddingTop={insets.top}>
            {/* Header */}
            <XStack padding="$4" alignItems="center" borderBottomWidth={1} borderBottomColor={DesignTokens.colors.beige[300]}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
                    <ChevronLeft size={24} color={DesignTokens.colors.brown[900]} />
                </TouchableOpacity>
                <Text fontSize={DesignTokens.typography.fontSize.xl} fontWeight="bold" color={DesignTokens.colors.brown[900]}>
                    My Profile
                </Text>
            </XStack>

            <ScrollView showsVerticalScrollIndicator={false}>
                <YStack padding="$4" space="$4">

                    {/* User Profile Card */}
                    <Card
                        padding="xl"
                        backgroundColor={DesignTokens.colors.background.card}
                        shadow="md"
                        borderRadius="xl"
                        style={{ alignItems: 'center' }}
                    >
                        <XStack
                            width={80}
                            height={80}
                            backgroundColor={DesignTokens.colors.orange[100]}
                            borderRadius={40}
                            alignItems="center"
                            justifyContent="center"
                            marginBottom="$3"
                            borderWidth={2}
                            borderColor={DesignTokens.colors.orange[200]}
                        >
                            <Text fontSize={32} fontWeight="bold" color={DesignTokens.colors.orange[600]}>
                                {user?.firstName?.[0] || 'U'}
                            </Text>
                        </XStack>

                        <Text fontSize={DesignTokens.typography.fontSize.xl} fontWeight="bold" color={DesignTokens.colors.brown[900]}>
                            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </Text>

                        <XStack
                            backgroundColor={DesignTokens.colors.teal[100]}
                            paddingHorizontal="$3"
                            paddingVertical="$1.5"
                            borderRadius={DesignTokens.radius.md}
                            marginTop="$2"
                        >
                            <Text fontSize={DesignTokens.typography.fontSize.xs} fontWeight="600" color={DesignTokens.colors.teal[700]}>
                                {user?.role || 'STAFF'}
                            </Text>
                        </XStack>
                    </Card>

                    {/* Personal Information */}
                    <YStack space="$2">
                        <Text fontSize={DesignTokens.typography.fontSize.lg} fontWeight="bold" color={DesignTokens.colors.brown[900]} marginLeft="$1">
                            Personal Information
                        </Text>
                        <Card padding="lg" backgroundColor={DesignTokens.colors.neutral.white} shadow="sm">
                            <ProfileItem icon={Phone} label="Phone Number" value={user?.phone} />
                            <ProfileItem icon={Mail} label="Email Address" value={user?.email || 'Not provided'} />
                            <ProfileItem icon={ShieldCheck} label="Account Type" value="Staff Member" />
                        </Card>
                    </YStack>

                    {/* Restaurant Information */}
                    <YStack space="$2">
                        <Text fontSize={DesignTokens.typography.fontSize.lg} fontWeight="bold" color={DesignTokens.colors.brown[900]} marginLeft="$1">
                            Workplace Details
                        </Text>
                        <Card padding="lg" backgroundColor={DesignTokens.colors.neutral.white} shadow="sm">
                            <ProfileItem icon={Building2} label="Restaurant Name" value={restaurant?.name} />

                            <XStack
                                marginTop="$2"
                                padding="$3"
                                backgroundColor={DesignTokens.colors.beige[100]}
                                borderRadius="$2"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <YStack>
                                    <Text fontSize={DesignTokens.typography.fontSize.xs} color={DesignTokens.colors.brown[600]}>
                                        Restaurant ID
                                    </Text>
                                    <Text fontSize={DesignTokens.typography.fontSize.xs} color={DesignTokens.colors.brown[400]} numberOfLines={1}>
                                        {user?.restaurantId || 'N/A'}
                                    </Text>
                                </YStack>
                            </XStack>
                        </Card>
                    </YStack>

                    {/* Logout Button */}
                    <YStack marginTop="$4">
                        <TouchableOpacity
                            onPress={handleLogout}
                            disabled={loading}
                            style={{
                                backgroundColor: DesignTokens.colors.orange[50],
                                borderColor: DesignTokens.colors.semantic.error,
                                borderWidth: 1,
                                borderRadius: DesignTokens.radius.md,
                                paddingVertical: DesignTokens.spacing.md,
                                paddingHorizontal: DesignTokens.spacing.lg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={DesignTokens.colors.semantic.error} />
                            ) : (
                                <XStack space="$2" alignItems="center">
                                    <LogOut size={20} color={DesignTokens.colors.semantic.error} />
                                    <Text color={DesignTokens.colors.semantic.error} fontWeight="600">
                                        Logout
                                    </Text>
                                </XStack>
                            )}
                        </TouchableOpacity>

                        <Text
                            textAlign="center"
                            marginTop="$4"
                            fontSize={DesignTokens.typography.fontSize.xs}
                            color={DesignTokens.colors.brown[400]}
                        >
                            Forks Staff App v1.0.0
                        </Text>
                    </YStack>

                </YStack>
            </ScrollView>
        </YStack>
    );
}
