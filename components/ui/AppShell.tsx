import React, { ReactNode } from 'react';
import { View, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AppShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-[#09090B]">
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.12)', 'rgba(9, 9, 11, 1)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        className="absolute top-0 left-0 right-0 bottom-0"
      />
      <View className={`flex-1 px-4 pt-10 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
