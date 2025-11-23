import { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Text } from '@tamagui/core';
import { YStack, XStack } from '@tamagui/stacks';
import { Input } from '@tamagui/input';
import { Button } from '@tamagui/button';
import { Label } from '@tamagui/label';
import { ThemedView } from '@/components/themed-view';

type UserRole = 'GUEST' | 'ADMIN' | 'STAFF';

export default function CreateUserScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('GUEST');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone: phone || undefined,
          firstName,
          lastName,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setEmail('');
              setPhone('');
              setFirstName('');
              setLastName('');
              setPassword('');
              setRole('GUEST');
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to create user');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check if the API server is running.');
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <YStack gap="$4" padding="$4" maxWidth={600} width="100%" alignSelf="center">
          <Text fontSize="$8" fontWeight="bold" marginBottom="$2">
            Create New User
          </Text>

          <YStack gap="$2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              placeholder="john.doe@example.com"
              value={email}
              onChangeText={setEmail as any}
              keyboardType="email-address"
              autoCapitalize="none"
              size="$4"
              borderWidth={1}
            />
          </YStack>

          <YStack gap="$2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              placeholder="+1234567890"
              value={phone}
              onChangeText={setPhone as any}
              keyboardType="phone-pad"
              size="$4"
              borderWidth={1}
            />
          </YStack>

          <YStack gap="$2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={firstName}
              onChangeText={setFirstName as any}
              size="$4"
              borderWidth={1}
            />
          </YStack>

          <YStack gap="$2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName as any}
              size="$4"
              borderWidth={1}
            />
          </YStack>

          <YStack gap="$2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword as any}
              secureTextEntry
              size="$4"
              borderWidth={1}
            />
          </YStack>

          <YStack gap="$2">
            <Label htmlFor="role">Role *</Label>
            <XStack gap="$2">
              {(['GUEST', 'ADMIN', 'STAFF'] as UserRole[]).map((roleOption) => (
                <Button
                  key={roleOption}
                  onPress={() => setRole(roleOption)}
                  size="$3"
                  flex={1}
                  backgroundColor={role === roleOption ? '$blue10' : '$gray5'}
                  color={role === roleOption ? 'white' : '$gray11'}
                >
                  <Text color={role === roleOption ? 'white' : '$gray11'} fontWeight="600">
                    {roleOption}
                  </Text>
                </Button>
              ))}
            </XStack>
          </YStack>

          <Button
            onPress={handleSubmit}
            disabled={loading}
            size="$4"
            marginTop="$4"
            backgroundColor="$blue10"
            color="white"
          >
            <Text color="white" fontWeight="600">
              {loading ? 'Creating...' : 'Create User'}
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
});
