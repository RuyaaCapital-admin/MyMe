import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Integration } from '../../types';
import { StatusBadge } from '../ui/DataDisplay';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function IntegrationCard({ integration }: { integration: Integration }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/connections/${integration.id}`)}
      className="bg-surface rounded-3xl p-4 mb-3 border border-border flex-row items-center"
    >
      <View className="w-14 h-14 bg-background rounded-2xl items-center justify-center mr-4 border border-border">
        {integration.iconUrl ? (
          <Image source={{ uri: integration.iconUrl }} className="w-8 h-8 rounded-lg" resizeMode="contain" />
        ) : (
          <View className="w-8 h-8 rounded-lg bg-primary/20" />
        )}
      </View>
      
      <View className="flex-1 justify-center">
        <Text className="text-white font-bold text-lg mb-1">{integration.name}</Text>
        <StatusBadge status={integration.status} />
      </View>
      
      <ChevronRight size={20} color="#a3a3a3" />
    </TouchableOpacity>
  );
}
