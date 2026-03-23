import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Search, Image as ImageIcon, Blocks, FolderPlus, Folder, MessageSquarePlus, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

export function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { userId } = useAuthStore();

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: api.chats.list,
  });

  return (
    <View className="flex-1 bg-[#09090B]">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
        
        {/* Search */}
        <TouchableOpacity className="mx-4 mb-6 flex-row items-center bg-surface border border-border rounded-xl px-3 py-3">
          <Search size={18} color="#A1A1AA" />
          <Text className="text-zinc-400 ml-3 font-medium">Search chats...</Text>
        </TouchableOpacity>

        {/* Quick Links */}
        <View className="px-4 mb-6 space-y-2">
          <TouchableOpacity className="flex-row items-center py-2" onPress={() => router.push('/(main)/chat')}>
            <MessageSquarePlus size={20} color="#FAFAFA" />
            <Text className="text-zinc-100 ml-3 font-semibold text-base">New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2">
            <ImageIcon size={20} color="#A1A1AA" />
            <Text className="text-zinc-300 ml-3 font-medium text-base">Images Workspace</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-2" onPress={() => router.push('/(main)/connections')}>
            <Blocks size={20} color="#A1A1AA" />
            <Text className="text-zinc-300 ml-3 font-medium text-base">Apps & Connections</Text>
          </TouchableOpacity>
        </View>

        {/* Projects */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Projects</Text>
            <TouchableOpacity>
              <FolderPlus size={16} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-row items-center py-2">
            <Folder size={18} color="#4F46E5" />
            <Text className="text-zinc-300 ml-3 font-medium">Work Projects</Text>
          </TouchableOpacity>
        </View>

        {/* Conversations */}
        <View className="px-4 mb-6">
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">All Conversations</Text>
          {chats?.map(chat => (
            <TouchableOpacity 
              key={chat.id} 
              className="py-3 mt-1 flex-row items-center rounded-lg bg-surface/40 px-3 border border-border/50" 
              onPress={() => router.push(`/(main)/chat/${chat.id}`)}
            >
              <Text className="text-zinc-300 font-medium truncate" numberOfLines={1}>
                {chat.title || 'New Chat'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </DrawerContentScrollView>

      {/* Bottom Profile Area */}
      <View className="p-4 border-t border-border bg-[#111115]">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => router.push('/(main)/settings')}
        >
          <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm shadow-primary/30">
            <Text className="text-white font-bold text-lg">M</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold">MyMe User</Text>
            <Text className="text-emerald-400 font-medium text-xs tracking-wide" numberOfLines={1}>Pro+ Subscription</Text>
          </View>
          <Settings size={20} color="#A1A1AA" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
