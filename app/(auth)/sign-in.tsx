import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppShell } from '../../components/ui/AppShell';
import { PrimaryButton } from '../../components/ui/Buttons';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { useRouter } from 'expo-router';
import { Zap } from 'lucide-react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('demo@myme.ai');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const { user, token } = await api.auth.login();
      await login(user, token);
      router.replace('/(main)/chat');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell className="pb-8">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          <View className="items-center mb-12">
            <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6 border border-primary/20">
              <Zap size={32} color="#3b82f6" />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-tight mb-2">Welcome to MyMe</Text>
            <Text className="text-muted text-base">Sign in to access your AI assistant</Text>
          </View>

          <View className="space-y-4 mb-8">
            <View>
              <Text className="text-white font-medium mb-2 ml-1">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface text-white px-4 py-4 rounded-2xl border border-border focus:border-primary text-base"
              />
            </View>
            <View className="mt-4">
              <Text className="text-white font-medium mb-2 ml-1">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#a3a3a3"
                secureTextEntry
                className="bg-surface text-white px-4 py-4 rounded-2xl border border-border focus:border-primary text-base"
              />
            </View>
          </View>

          <PrimaryButton title="Sign In" onPress={handleSignIn} isLoading={isLoading} />
          
          <View className="flex-row justify-center mt-8">
            <Text className="text-muted">Don't have an account? </Text>
            <Text className="text-primary font-bold">Sign Up</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
