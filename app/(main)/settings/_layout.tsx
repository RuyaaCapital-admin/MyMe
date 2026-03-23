import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personalization" options={{ headerShown: true, title: '', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#09090B' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="subscription" options={{ headerShown: true, title: '', headerBackTitle: 'Back', headerStyle: { backgroundColor: '#09090B' }, headerTintColor: '#fff' }} />
    </Stack>
  );
}
