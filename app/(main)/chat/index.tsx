import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import * as Crypto from 'expo-crypto';

export default function ChatIndex() {
  const router = useRouter();
  
  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: api.chats.list,
  });

  useEffect(() => {
    if (!isLoading) {
      if (chats && chats.length > 0) {
        router.replace(`/(main)/chat/${chats[0].id}`);
      } else {
        const newId = Crypto.randomUUID();
        router.replace(`/(main)/chat/${newId}`);
      }
    }
  }, [chats, isLoading]);

  return (
    <View className="flex-1 bg-[#09090B] items-center justify-center">
      <ActivityIndicator color="#4F46E5" />
    </View>
  );
}
