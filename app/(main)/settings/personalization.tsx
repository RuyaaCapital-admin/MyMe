import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';
import { supabase } from '../../../utils/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { useQuery, useMutation } from '@tanstack/react-query';

export default function PersonalizationScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [tone, setTone] = useState('');
  const [instructions, setInstructions] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['user_settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (data) {
        setTone(data.tone || '');
        setInstructions(data.instructions || '');
      }
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('user_settings').update({ tone, instructions }).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      Alert.alert("Success", "Personalization settings saved.");
      router.back();
    }
  });

  return (
    <View className="flex-1 bg-[#09090B]">
      <Stack.Screen 
        options={{ 
          headerTitle: 'Personalization', 
          headerStyle: { backgroundColor: '#09090B' }, 
          headerTintColor: '#fff',
          headerShadowVisible: false 
        }} 
      />
      <ScrollView className="flex-1 px-4 pt-6" keyboardDismissMode="on-drag">
        {isLoading ? <ActivityIndicator color="#4F46E5" /> : (
          <>
            <View className="mb-8 items-center">
              <View className="w-16 h-16 rounded-full bg-indigo-500/20 items-center justify-center mb-4">
                <Sparkles size={28} color="#818CF8" />
              </View>
              <Text className="text-zinc-100 font-bold text-2xl mb-2 text-center">Shape Your Agent</Text>
              <Text className="text-zinc-400 text-center px-4">
                Define how MyMe responds to you. This acts as the core system instruction for every conversation.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-zinc-300 font-semibold mb-2 ml-1">Tone & Personality</Text>
              <View className="bg-surface/50 border border-border/50 rounded-2xl px-4 py-1">
                <TextInput
                  value={tone}
                  onChangeText={setTone}
                  placeholder="e.g. Professional, Snarky, Encouraging..."
                  placeholderTextColor="#52525B"
                  className="text-zinc-100 py-4 text-base"
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-zinc-300 font-semibold mb-2 ml-1">Custom Instructions</Text>
              <View className="bg-surface/50 border border-border/50 rounded-2xl px-4 py-1">
                <TextInput
                  value={instructions}
                  onChangeText={setInstructions}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholder="Write any explicit rules. e.g. Always respond in French, never use emojis..."
                  placeholderTextColor="#52525B"
                  className="text-zinc-100 py-4 text-base h-32"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-primary rounded-xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
            >
              {saveMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text className="text-white font-bold ml-2 text-base">Save Preferences</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
