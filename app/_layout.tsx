import 'react-native-gesture-handler';
import '../global.css';

import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { session, isLoading, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const initialized = useRef(false);

  // Only call checkSession ONCE on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      checkSession();
    }
  }, []);

  // Only redirect authenticated users AWAY from auth screens
  // Anonymous users can freely use the main app
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If user IS logged in and still on auth screens, redirect to main
    if (session && inAuthGroup) {
      router.replace('/(main)/chat');
    }
    // Do NOT redirect unauthenticated users — they can use the app anonymously
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#09090B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#4F46E5" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
