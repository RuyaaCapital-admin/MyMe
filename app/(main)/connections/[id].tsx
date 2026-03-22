import React from 'react';
import { View, Text, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { AppShell } from '../../../components/ui/AppShell';
import { LoadingState, ErrorState } from '../../../components/ui/States';
import { StatusBadge } from '../../../components/ui/DataDisplay';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Buttons';
import { Link2 } from 'lucide-react-native';

export default function ConnectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.integrations.list(),
  });

  const integration = integrations?.find(i => i.id === id);

  const toggleMutation = useMutation({
    mutationFn: () => api.integrations.toggleConnection(id || '', integration?.status || 'disconnected'),
    onSuccess: (newIntegration) => {
      queryClient.setQueryData(['integrations'], (old: any) => 
        old?.map((i: any) => i.id === id ? newIntegration : i)
      );
    }
  });

  if (isLoading) return <AppShell><LoadingState /></AppShell>;
  if (!integration) return <AppShell><ErrorState message="Integration not found" /></AppShell>;

  const isConnected = integration.status === 'connected';

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
             <Image source={{ uri: integration.iconUrl }} className="w-12 h-12" resizeMode="contain" />
          ) : (
            <Link2 size={32} color="#3b82f6" />
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

      <View className="space-y-4">
        {isConnected ? (
          <SecondaryButton 
             title="Disconnect App" 
             onPress={() => toggleMutation.mutate()} 
             isLoading={toggleMutation.isPending} 
          />
        ) : (
          <PrimaryButton 
             title="Connect App" 
             onPress={() => toggleMutation.mutate()} 
             isLoading={toggleMutation.isPending} 
          />
        )}
      </View>
    </AppShell>
  );
}
