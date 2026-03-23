import React, { useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useNavigation, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { MessageBubble } from '../../../components/chat/MessageBubble';
import { ChatComposer } from '../../../components/chat/ChatComposer';
import { LoadingState } from '../../../components/ui/States';
import { Message } from '../../../types';
import { Menu, MoreVertical, Blocks } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const router = useRouter();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => api.chats.getMessages(id || ''),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => api.chats.sendMessage(id || '', content),
    onMutate: async (newContent) => {
      const optimisticMessage: Message = {
        id: `optimistic_${Date.now()}`,
        chatId: id!,
        role: 'user',
        content: newContent,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, optimisticMessage]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      setLocalMessages([]); 
    }
  });

  const handleSend = (text: string) => sendMessageMutation.mutate(text);
  const displayMessages = [...(messages || []), ...localMessages];

  return (
    <View className="flex-1 bg-[#09090B]">
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: 'MyMe Assistant',
          headerStyle: { backgroundColor: '#09090B' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginLeft: 8, marginRight: 12 }}>
              <Menu size={24} color="#FAFAFA" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row items-center mr-2">
              <TouchableOpacity onPress={() => router.push('/(main)/connections' as any)} className="mr-5">
                <Blocks size={20} color="#A1A1AA" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Chat Options', 'Manage this conversation', [
                { text: 'Rename', onPress: () => {} },
                { text: 'Archive', onPress: () => {} },
                { text: 'Delete', onPress: () => {}, style: 'destructive' },
                { text: 'Cancel', style: 'cancel' }
              ])}>
                <MoreVertical size={24} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      {isLoading ? (
        <LoadingState message="Loading conversation..." />
      ) : (
        <FlatList
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatComposer onSend={handleSend} isLoading={sendMessageMutation.isPending} />
      </KeyboardAvoidingView>
    </View>
  );
}
