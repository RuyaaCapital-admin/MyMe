import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { Alert } from 'react-native';

/**
 * Hook that checks if the user is authenticated.
 * If not, shows an alert and redirects to sign-in.
 * Use this to gate protected features like connections, subscriptions, etc.
 * 
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   const handleConnect = () => {
 *     if (!requireAuth()) return;
 *     // ... proceed with auth-required action
 *   };
 */
export function useRequireAuth() {
  const { session } = useAuthStore();
  const router = useRouter();

  return (featureName?: string): boolean => {
    if (session) return true;

    const feature = featureName || 'this feature';
    Alert.alert(
      'Sign In Required',
      `You need to sign in to use ${feature}. Would you like to sign in now?`,
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in' as any) },
      ]
    );
    return false;
  };
}
