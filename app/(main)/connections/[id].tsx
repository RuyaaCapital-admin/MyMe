import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { AppShell } from '../../../components/ui/AppShell';
import { LoadingState, ErrorState } from '../../../components/ui/States';
import { StatusBadge } from '../../../components/ui/DataDisplay';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Buttons';
import { Link2, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';

export default function ConnectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { session } = useAuthStore();
  const [actionError, setActionError] = useState('');

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.integrations.list(),
  });

  const integration = integrations?.find(i => i.id === id);

  const toggleMutation = useMutation({
    mutationFn: () => {
      if (!session) {
        throw new Error('REQUIRES_AUTH');
      }
      return api.integrations.toggleConnection(id || '', integration?.status || 'disconnected');
    },
    onSuccess: (newIntegration) => {
      setActionError('');
      queryClient.setQueryData(['integrations'], (old: any) => 
        old?.map((i: any) => i.id === id ? newIntegration : i)
      );
    },
    onError: (err: Error) => {
      if (err.message === 'REQUIRES_AUTH') {
        Alert.alert(
          'Sign In Required',
          'You need to sign in to connect apps. Would you like to sign in now?',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in' as any) },
          ]
        );
      } else {
        setActionError(err.message || 'Failed to connect. Please try again.');
      }
    }
  });

  if (isLoading) return <AppShell><LoadingState /></AppShell>;
  if (!integration) return <AppShell><ErrorState message="Integration not found" /></AppShell>;

  const isConnected = integration.status === 'connected';
  const initial = (integration.name || '?').charAt(0).toUpperCase();

  return (
    <AppShell>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: '',
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerBackTitle: 'Back'
        }} 
      />

      <View className="items-center mt-6 mb-10">
        <View className="w-24 h-24 bg-surface rounded-[32px] items-center justify-center mb-6 shadow-md border border-border">
          {integration.iconUrl ? (
            <Link2 size={32} color="#3b82f6" />
          ) : (
            <Text className="text-3xl font-bold text-indigo-400">{initial}</Text>
          )}
        </View>
        <Text className="text-white text-3xl font-extrabold mb-4 tracking-tight">{integration.name}</Text>
        <StatusBadge status={integration.status} />
      </View>

      <View className="bg-surface p-6 rounded-3xl mb-8 border border-border">
        <Text className="text-white font-bold text-lg mb-2">About</Text>
        <Text className="text-muted text-base leading-relaxed">{integration.description}</Text>
        
        <View className="h-[1px] bg-border my-5" />
        
        <Text className="text-white font-bold text-lg mb-2">Category</Text>
        <Text className="text-muted text-base">{integration.category}</Text>
      </View>

      {/* Error Message */}
      {actionError ? (
        <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} color="#EF4444" />
          <Text className="text-red-400 text-sm ml-2 flex-1">{actionError}</Text>
        </View>
      ) : null}

      {/* Auth Required Notice for Anonymous */}
      {!session ? (
        <View className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
          <Text className="text-amber-400 text-sm font-medium">
            Sign in required to connect or disconnect apps.
          </Text>
        </View>
      ) : null}

      <View className="space-y-4">
        {isConnected ? (
          <SecondaryButton 
             title="Disconnect App" 
             onPress={() => toggleMutation.mutate()} 
             isLoading={toggleMutation.isPending} 
          />
        ) : (
          <PrimaryButton 
             title={session ? "Connect App" : "Sign In to Connect"} 
             onPress={() => toggleMutation.mutate()} 
             isLoading={toggleMutation.isPending} 
          />
        )}
      </View>
    </AppShell>
  );
}
