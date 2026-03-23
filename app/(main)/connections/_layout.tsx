import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ConnectionsLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Connections', headerLeft: backButton }} />
      <Stack.Screen name="[id]" options={{ headerShown: true, title: 'App Details', headerLeft: backButton }} />
    </Stack>
  );
}
