import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Sparkles, UserPlus } from 'lucide-react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSignup = async () => {
    setErrorText('');
    if (!email || !password || password.length < 6) {
      setErrorText('Please enter a valid email and a 6+ character password.');
      return;
    }
    
    try {
      await signup(email, password);
      // Wait for Auth check layout redirect
    } catch (err: any) {
      setErrorText(err.message || 'Signup failed.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#09090B]"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 justify-center px-6">
        
        <View className="items-center mb-12">
          <View className="w-16 h-16 rounded-3xl bg-indigo-600 items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
            <Sparkles size={32} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
          <Text className="text-zinc-400 text-center px-4">
            Join MyMe. The first true step to a personalized multi-agent workflow.
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <View className="flex-row items-center border border-border/50 bg-surface/50 rounded-xl px-4 py-3">
              <Mail size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-zinc-100 ml-3 py-1 font-medium"
                placeholder="Email Address"
                placeholderTextColor="#52525B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View>
            <View className="flex-row items-center border border-border/50 bg-surface/50 rounded-xl px-4 py-3">
              <Lock size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-zinc-100 ml-3 py-1 font-medium"
                placeholder="Password (Min. 6 chars)"
                placeholderTextColor="#52525B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {errorText ? (
            <Text className="text-red-400 text-sm font-medium mt-2">{errorText}</Text>
          ) : null}

          <TouchableOpacity 
            onPress={handleSignup}
            disabled={isLoading}
            className="bg-indigo-600 py-4 rounded-xl items-center flex-row justify-center mt-4 shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">Sign Up Securely</Text>
                <UserPlus size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-zinc-400">Already a member? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text className="text-indigo-400 font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
