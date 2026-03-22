import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { AppShell } from '../../../components/ui/AppShell';
import { SectionHeader } from '../../../components/ui/DataDisplay';
import { SettingRow } from '../../../components/ui/SettingRow';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, LogOut, Moon, Zap } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/onboarding');
  };

  return (
    <AppShell className="px-0">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Settings" />
        
        <View className="items-center mt-4 mb-10">
          <View className="w-28 h-28 rounded-[36px] bg-surface border border-border items-center justify-center mb-5 overflow-hidden shadow-sm">
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <User size={48} color="#3b82f6" />
            )}
          </View>
          <Text className="text-white text-3xl font-extrabold tracking-tight">{user?.name || 'User'}</Text>
          <Text className="text-muted text-lg mt-1">{user?.email || 'user@example.com'}</Text>
          
          <View className="bg-primary/10 px-4 py-2 rounded-full mt-4 flex-row items-center border border-primary/20 cursor-pointer">
            <Zap size={16} color="#3b82f6" className="mr-2" />
            <Text className="text-primary font-extrabold text-xs uppercase tracking-widest">Pro Member</Text>
          </View>
        </View>

        <Text className="text-muted font-black text-xs uppercase tracking-widest mb-4 ml-2 mt-4 opacity-70">Preferences</Text>
        <SettingRow 
          icon={Moon} 
          title="Dark Mode" 
          subtitle="Premium dark aesthetic"
          type="toggle"
          value={isDark}
          onValueChange={toggleTheme}
        />
        <SettingRow 
          icon={Bell} 
          title="Notifications" 
          subtitle="Updates and intelligence alerts"
          type="toggle"
          value={true}
        />

        <Text className="text-muted font-black text-xs uppercase tracking-widest mb-4 ml-2 mt-8 opacity-70">Account</Text>
        <SettingRow icon={User} title="Edit Profile" />
        <SettingRow icon={Shield} title="Privacy & Security" />
        
        <View className="mt-8">
          <SettingRow icon={LogOut} title="Sign Out" type="danger" onPress={handleLogout} />
        </View>

        <Text className="text-center text-muted text-xs mt-12 mb-6 tracking-wide">MyMe Assistant v1.0.0</Text>
      </ScrollView>
    </AppShell>
  );
}
