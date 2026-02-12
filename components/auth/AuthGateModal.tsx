import React from 'react';
import { Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from './LoginScreen';
import { SetupScreen } from './SetupScreen';

export function AuthGateModal() {
  const { showAuthModal, authMode, login, dismissAuthModal, setAuthMode } = useAuth();

  return (
    <Modal
      visible={showAuthModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={dismissAuthModal}
    >
      {authMode === 'login' ? (
        <LoginScreen
          onLoginSuccess={(user, token) => login(user, token)}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
      ) : (
        <SetupScreen
          onUserCreated={(user, token) => login(user, token)}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )}
    </Modal>
  );
}
