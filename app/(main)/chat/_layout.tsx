import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#09090B' }, headerTintColor: '#fff', headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
