import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Crown, Settings2, Bell, Blocks, Database, Archive, ShieldCheck, Languages, Palette, Bug, HelpCircle, FileText, Lock, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { supabase } from '../../../utils/supabase';

function SettingsRow({ icon: Icon, title, value = '', onPress, danger = false }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border/50"
    >
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-lg items-center justify-center bg-surface border border-border/50">
          <Icon size={18} color={danger ? "#EF4444" : "#A1A1AA"} />
        </View>
        <Text className={`font-medium ml-3 text-base ${danger ? 'text-red-500' : 'text-zinc-200'}`}>
          {title}
        </Text>
      </View>
      <View className="flex-row items-center space-x-2">
        {value ? <Text className="text-zinc-500 mr-2">{value}</Text> : null}
        <ChevronRight size={16} color="#52525B" />
      </View>
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }: any) {
  return (
    <View className="mb-6">
      <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">{title}</Text>
      <View className="bg-surface/30 rounded-2xl px-4 border border-border/30">
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { userId, checkAuth } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    checkAuth();
  };

  return (
    <View className="flex-1 bg-[#09090B]">
      <Stack.Screen 
        options={{ 
          headerTitle: 'Profile & Settings', 
          headerStyle: { backgroundColor: '#09090B' }, 
          headerTintColor: '#fff',
          headerShadowVisible: false 
        }} 
      />
      
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View className="flex-row items-center bg-surface/80 rounded-2xl p-4 mb-8 border border-border/50">
          <View className="w-16 h-16 rounded-full bg-indigo-600 items-center justify-center border-2 border-indigo-400">
            <Text className="text-white font-bold text-2xl">M</Text>
          </View>
          <View className="ml-4 justify-center">
            <Text className="text-zinc-100 font-bold text-xl">MyMe User</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-zinc-400 font-medium">Online</Text>
            </View>
          </View>
        </View>

        <SettingsSection title="Account">
          <SettingsRow icon={Crown} title="Subscription" value="Pro+" onPress={() => router.push('/(main)/settings/subscription')} />
          <SettingsRow icon={Settings2} title="Personalization" onPress={() => router.push('/(main)/settings/personalization')} />
          <SettingsRow icon={Bell} title="Notifications" onPress={() => {}} />
          <SettingsRow icon={Blocks} title="Apps & Connections" onPress={() => router.push('/(main)/connections')} />
        </SettingsSection>

        <SettingsSection title="Data & Privacy">
          <SettingsRow icon={Database} title="Data Control" onPress={() => {}} />
          <SettingsRow icon={Archive} title="Archived Chats" onPress={() => {}} />
          <SettingsRow icon={ShieldCheck} title="Security" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="App Settings">
          <SettingsRow icon={Languages} title="Language" value="English" onPress={() => {}} />
          <SettingsRow icon={Palette} title="Appearance" value="Dark" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon={Bug} title="Report a Bug" onPress={() => {}} />
          <SettingsRow icon={HelpCircle} title="Help Center" onPress={() => {}} />
          <SettingsRow icon={FileText} title="Terms of Service" onPress={() => {}} />
          <SettingsRow icon={Lock} title="Privacy Policy" onPress={() => {}} />
          <SettingsRow icon={Settings2} title="Version" value="2.0.1" onPress={() => {}} />
        </SettingsSection>

        <View className="mb-20 mt-4 px-4">
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center py-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
