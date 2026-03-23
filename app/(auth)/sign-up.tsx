import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Sparkles, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = useCallback((text: string) => {
    setEmail(text);
    setErrorText('');
    if (text.length > 0 && !EMAIL_REGEX.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, []);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Too short', color: '#EF4444' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 2, label: 'Weak', color: '#F59E0B' };
    if (score <= 2) return { level: 3, label: 'Good', color: '#3B82F6' };
    return { level: 4, label: 'Strong', color: '#22C55E' };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSignup = async () => {
    setErrorText('');
    setSuccessText('');
    if (!EMAIL_REGEX.test(email)) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorText('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }
    try {
      await signup(email, password);
    } catch (err: any) {
      const msg = err.message || 'Signup failed.';
      if (msg.includes('check your email') || msg.includes('verify')) {
        setSuccessText(msg);
      } else {
        setErrorText(msg);
      }
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
          
          {/* Logo & Title */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-[24px] bg-indigo-600 items-center justify-center mb-6" style={{ shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 }}>
              <Sparkles size={36} color="#fff" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
            <Text className="text-zinc-500 text-center text-base">
              Start your personalized AI assistant journey
            </Text>
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

          {/* Password Input */}
          <View className="mb-4">
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${password.length > 0 && password.length < 6 ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
              <Lock size={20} color={password.length > 0 && password.length < 6 ? '#EF4444' : '#71717A'} />
              <TextInput
                className="flex-1 text-zinc-100 ml-3 py-0.5 text-base"
                placeholder="Password (Min. 6 characters)"
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
            {/* Password Strength Meter */}
            {password.length > 0 && (
              <View className="mt-2">
                <View className="flex-row space-x-1">
                  {[1, 2, 3, 4].map(i => (
                    <View key={i} className="flex-1 h-1 rounded-full mx-0.5" style={{ backgroundColor: i <= passwordStrength.level ? passwordStrength.color : '#27272A' }} />
                  ))}
                </View>
                <View className="flex-row items-center mt-1">
                  <Shield size={12} color={passwordStrength.color} />
                  <Text className="text-xs ml-1" style={{ color: passwordStrength.color }}>{passwordStrength.label}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${passwordsMismatch ? 'border-red-500/50 bg-red-500/5' : passwordsMatch ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
              <Lock size={20} color={passwordsMismatch ? '#EF4444' : passwordsMatch ? '#22C55E' : '#71717A'} />
              <TextInput
                className="flex-1 text-zinc-100 ml-3 py-0.5 text-base"
                placeholder="Confirm Password"
                placeholderTextColor="#52525B"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setErrorText(''); }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showConfirm ? <EyeOff size={20} color="#71717A" /> : <Eye size={20} color="#71717A" />}
              </TouchableOpacity>
            </View>
            {passwordsMismatch && (
              <View className="flex-row items-center mt-1.5 ml-1">
                <AlertCircle size={12} color="#EF4444" />
                <Text className="text-red-400 text-xs ml-1">Passwords do not match</Text>
              </View>
            )}
            {passwordsMatch && (
              <View className="flex-row items-center mt-1.5 ml-1">
                <CheckCircle size={12} color="#22C55E" />
                <Text className="text-green-400 text-xs ml-1">Passwords match</Text>
              </View>
            )}
          </View>

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

          {/* Sign Up Button */}
          <TouchableOpacity 
            onPress={handleSignup}
            disabled={isLoading}
            className="py-4 rounded-xl items-center flex-row justify-center mb-4"
            style={{ backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">Create Account</Text>
                <UserPlus size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-zinc-600 text-xs text-center mb-6">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Text>

          {/* Sign In Link */}
          <View className="flex-row justify-center">
            <Text className="text-zinc-500">Already a member? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
              <Text className="text-indigo-400 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
