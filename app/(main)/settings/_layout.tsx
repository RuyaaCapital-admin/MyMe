import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SettingsLayout() {
  const router = useRouter();
  const backButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
      <ArrowLeft size={22} color="#FAFAFA" />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#09090B' },
        headerTintColor: '#fff',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Settings', headerLeft: backButton }} />
      <Stack.Screen name="personalization" options={{ headerShown: true, title: 'Personalization', headerLeft: backButton }} />
      <Stack.Screen name="subscription" options={{ headerShown: true, title: 'Subscription', headerLeft: backButton }} />
    </Stack>
  );
}
