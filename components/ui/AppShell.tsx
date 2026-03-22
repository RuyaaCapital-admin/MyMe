import React, { ReactNode } from 'react';
import { View, SafeAreaView, Platform, StatusBar } from 'react-native';

export function AppShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-background pt-8">
      <View className={`flex-1 px-4 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
