import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Search, Blocks, MessageSquarePlus, Settings, LogIn, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

export function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { user, session } = useAuthStore();
  const isLoggedIn = !!session;

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: api.chats.list,
    enabled: isLoggedIn, // Only fetch chats when logged in
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
          <TouchableOpacity className="flex-row items-center py-2" onPress={() => router.push('/(main)/connections')}>
            <Blocks size={20} color="#A1A1AA" />
            <Text className="text-zinc-300 ml-3 font-medium text-base">Apps & Connections</Text>
          </TouchableOpacity>
        </View>

        {/* Conversations (only show when logged in) */}
        {isLoggedIn && chats && chats.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Conversations</Text>
            {chats.map(chat => (
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
        )}

        {/* Sign-in prompt for anonymous users */}
        {!isLoggedIn && (
          <View className="px-4 mb-6">
            <View className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-4">
              <Text className="text-white font-bold text-base mb-1">Sign in for more</Text>
              <Text className="text-zinc-400 text-sm mb-3">
                Unlock integrations, saved chats, and personalization.
              </Text>
              <TouchableOpacity 
                className="bg-indigo-600 py-2.5 rounded-xl items-center flex-row justify-center"
                onPress={() => router.push('/(auth)/sign-in' as any)}
              >
                <LogIn size={16} color="#fff" />
                <Text className="text-white font-bold text-sm ml-2">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </DrawerContentScrollView>

      {/* Bottom Profile Area */}
      <View className="p-4 border-t border-border bg-[#111115]">
        {isLoggedIn ? (
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => router.push('/(main)/settings')}
          >
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-sm shadow-primary/30">
              <Text className="text-white font-bold text-lg">{user?.email?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View className="ml-3 flex-1 flex-col">
              <Text className="text-white font-bold truncate text-sm" numberOfLines={1}>{user?.email || 'User'}</Text>
              <Text className="text-zinc-500 text-xs">Signed in</Text>
            </View>
            <Settings size={20} color="#A1A1AA" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => router.push('/(auth)/sign-in' as any)}
          >
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center border border-zinc-700">
              <UserIcon size={20} color="#71717A" />
            </View>
            <View className="ml-3 flex-1 flex-col">
              <Text className="text-zinc-300 font-bold text-sm">Guest User</Text>
              <Text className="text-zinc-500 text-xs">Tap to sign in</Text>
            </View>
            <LogIn size={18} color="#6366F1" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
