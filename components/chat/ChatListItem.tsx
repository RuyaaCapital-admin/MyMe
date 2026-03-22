import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bot } from 'lucide-react-native';
import { Chat } from '../../types';
import { useRouter } from 'expo-router';

export function ChatListItem({ chat }: { chat: Chat }) {
  const router = useRouter();
  
  return (
    <TouchableOpacity
      className="flex-row items-center bg-surface px-4 py-4 rounded-[24px] mb-3 border border-border"
      onPress={() => router.push(`/(main)/chat/${chat.id}`)}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
        <Bot size={24} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{chat.title}</Text>
        <Text className="text-muted text-sm" numberOfLines={1}>{chat.previewMessage || 'No messages yet'}</Text>
      </View>
    </TouchableOpacity>
  );
}
