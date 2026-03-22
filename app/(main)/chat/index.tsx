import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { AppShell } from '../../../components/ui/AppShell';
import { SectionHeader } from '../../../components/ui/DataDisplay';
import { ChatListItem } from '../../../components/chat/ChatListItem';
import { LoadingState } from '../../../components/ui/States';
import { Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useRouter } from 'expo-router';

export default function ChatListScreen() {
  const router = useRouter();
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.chats.list(),
  });

  const handleNewChat = () => {
    router.push(`/(main)/chat/new_${Date.now()}`);
  };

  return (
    <AppShell className="px-0">
      <View className="px-4">
        <SectionHeader 
          title="Recent Chats" 
          action={
            <TouchableOpacity onPress={handleNewChat} className="bg-primary/20 p-2.5 rounded-full">
              <Plus size={20} color="#3b82f6" />
            </TouchableOpacity>
          } 
        />
      </View>
      
      {isLoading ? (
        <LoadingState message="Loading history..." />
      ) : chats?.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-center text-xl font-bold mb-2">No conversations yet</Text>
          <Text className="text-muted text-center mb-6">Start a new chat to let MyMe help you.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </AppShell>
  );
}
