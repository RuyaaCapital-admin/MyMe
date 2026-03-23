import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../utils/supabase';
// Simple cross-platform storage for remember-email
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {}
  },
};
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, Wand2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBERED_EMAIL_KEY = '@myme_remembered_email';

export default function SignInScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [emailError, setEmailError] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkCooldown, setMagicLinkCooldown] = useState(0);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [rememberEmail, setRememberEmail] = useState(true);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load remembered email on mount
  useEffect(() => {
    storage.getItem(REMEMBERED_EMAIL_KEY).then((saved: string | null) => {
      if (saved) setEmail(saved);
    }).catch(() => {});
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const validateEmail = useCallback((text: string) => {
    setEmail(text);
    setErrorText('');
    if (text.length > 0 && !EMAIL_REGEX.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, []);

  const saveEmail = async () => {
    if (rememberEmail && EMAIL_REGEX.test(email)) {
      await storage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      await storage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };

  const handleLogin = async () => {
    setErrorText('');
    setSuccessText('');
    if (!EMAIL_REGEX.test(email)) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorText('Password must be at least 6 characters.');
      return;
    }
    try {
      await saveEmail();
      await login(email, password);
      router.replace('/(main)/chat' as any);
    } catch (err: any) {
      setErrorText(err.message || 'Login failed. Check your credentials.');
    }
  };

  const startCooldown = (seconds: number) => {
    setMagicLinkCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setMagicLinkCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMagicLink = async () => {
    setErrorText('');
    setSuccessText('');
    if (magicLinkCooldown > 0) {
      setErrorText(`Please wait ${magicLinkCooldown}s before requesting another magic link.`);
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrorText('Please enter a valid email address first.');
      return;
    }
    setMagicLinkLoading(true);
    try {
      await saveEmail();
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://my-me-xi.vercel.app',
        }
      });
      if (error) throw error;
      setSuccessText('✨ Magic link sent! Check your inbox.');
      startCooldown(60); // 60s cooldown to prevent 429
    } catch (err: any) {
      if (err.message?.includes('rate') || err.status === 429) {
        setErrorText('Too many requests. Please wait a minute before trying again.');
        startCooldown(60);
      } else {
        setErrorText(err.message || 'Failed to send magic link.');
      }
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorText('');
    setSuccessText('');
    if (!EMAIL_REGEX.test(email)) {
      setErrorText('Enter your email address first, then tap Forgot Password.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/(auth)/reset-password` : 'https://my-me-xi.vercel.app/(auth)/reset-password',
      });
      if (error) throw error;
      setSuccessText('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setErrorText(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#09090B]"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          
          {/* Back to app (skip login) */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="flex-row items-center mb-6"
          >
            <ArrowLeft size={20} color="#71717A" />
            <Text className="text-zinc-500 ml-2 text-sm">Back to app</Text>
          </TouchableOpacity>

          {/* Logo & Title */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-[24px] bg-indigo-600 items-center justify-center mb-6" style={{ shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 }}>
              <Sparkles size={36} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
            <Text className="text-zinc-500 text-center text-base">
              Sign in to unlock integrations & personalization
            </Text>
          </View>

          {/* Mode Switcher */}
          <View className="flex-row bg-zinc-900 rounded-xl p-1 mb-6">
            <TouchableOpacity
              onPress={() => { setMode('password'); setErrorText(''); setSuccessText(''); }}
              className={`flex-1 py-3 rounded-lg items-center ${mode === 'password' ? 'bg-zinc-800' : ''}`}
            >
              <Text className={`font-semibold ${mode === 'password' ? 'text-white' : 'text-zinc-500'}`}>Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode('magic'); setErrorText(''); setSuccessText(''); }}
              className={`flex-1 py-3 rounded-lg items-center ${mode === 'magic' ? 'bg-zinc-800' : ''}`}
            >
              <Text className={`font-semibold ${mode === 'magic' ? 'text-white' : 'text-zinc-500'}`}>Magic Link</Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${emailError ? 'border-red-500/50 bg-red-500/5' : email && EMAIL_REGEX.test(email) ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
              <Mail size={20} color={emailError ? '#EF4444' : email && EMAIL_REGEX.test(email) ? '#22C55E' : '#71717A'} />
              <TextInput
                className="flex-1 text-zinc-100 ml-3 py-0.5 text-base"
                placeholder="Email Address"
                placeholderTextColor="#52525B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={validateEmail}
              />
              {email.length > 0 && EMAIL_REGEX.test(email) && (
                <CheckCircle size={18} color="#22C55E" />
              )}
            </View>
            {emailError ? (
              <View className="flex-row items-center mt-1.5 ml-1">
                <AlertCircle size={12} color="#EF4444" />
                <Text className="text-red-400 text-xs ml-1">{emailError}</Text>
              </View>
            ) : null}
          </View>

          {/* Remember Email Toggle */}
          <TouchableOpacity 
            onPress={() => setRememberEmail(!rememberEmail)}
            className="flex-row items-center mb-4"
          >
            <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${rememberEmail ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-600'}`}>
              {rememberEmail && <CheckCircle size={14} color="#fff" />}
            </View>
            <Text className="text-zinc-400 text-sm">Remember my email</Text>
          </TouchableOpacity>

          {/* Password Input (only in password mode) */}
          {mode === 'password' && (
            <View className="mb-4">
              <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${password.length > 0 && password.length < 6 ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
                <Lock size={20} color={password.length > 0 && password.length < 6 ? '#F59E0B' : '#71717A'} />
                <TextInput
                  className="flex-1 text-zinc-100 ml-3 py-0.5 text-base"
                  placeholder="Password"
                  placeholderTextColor="#52525B"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrorText(''); }}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {showPassword ? <EyeOff size={20} color="#71717A" /> : <Eye size={20} color="#71717A" />}
                </TouchableOpacity>
              </View>
              {password.length > 0 && password.length < 6 && (
                <View className="flex-row items-center mt-1.5 ml-1">
                  <AlertCircle size={12} color="#F59E0B" />
                  <Text className="text-amber-400 text-xs ml-1">Password must be 6+ characters</Text>
                </View>
              )}
            </View>
          )}

          {/* Error / Success Messages */}
          {errorText ? (
            <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={16} color="#EF4444" />
              <Text className="text-red-400 text-sm ml-2 flex-1">{errorText}</Text>
            </View>
          ) : null}
          {successText ? (
            <View className="flex-row items-center bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 mb-4">
              <CheckCircle size={16} color="#22C55E" />
              <Text className="text-green-400 text-sm ml-2 flex-1">{successText}</Text>
            </View>
          ) : null}

          {/* Forgot Password (password mode) */}
          {mode === 'password' && (
            <View className="flex-row justify-end mb-5">
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-indigo-400 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          {mode === 'password' ? (
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={isLoading}
              className="py-4 rounded-xl items-center flex-row justify-center mb-4"
              style={{ backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">Sign In</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleMagicLink}
              disabled={magicLinkLoading || magicLinkCooldown > 0}
              className="py-4 rounded-xl items-center flex-row justify-center mb-4"
              style={{ 
                backgroundColor: magicLinkCooldown > 0 ? '#3F3F46' : '#7C3AED', 
                shadowColor: '#7C3AED', 
                shadowOffset: { width: 0, height: 4 }, 
                shadowOpacity: magicLinkCooldown > 0 ? 0 : 0.3, 
                shadowRadius: 12, 
                elevation: magicLinkCooldown > 0 ? 0 : 8 
              }}
            >
              {magicLinkLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Wand2 size={18} color="#fff" />
                  <Text className="text-white font-bold text-base ml-2">
                    {magicLinkCooldown > 0 ? `Resend in ${magicLinkCooldown}s` : 'Send Magic Link'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-zinc-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up' as any)}>
              <Text className="text-indigo-400 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
