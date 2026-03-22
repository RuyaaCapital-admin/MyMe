import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-muted mt-4 font-medium">{message}</Text>
    </View>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-6 text-center">
      <AlertCircle size={48} color="#ef4444" />
      <Text className="text-white text-lg font-bold mt-4">Error</Text>
      <Text className="text-muted mt-2 text-center mb-6">{message}</Text>
      {onRetry && (
        <View className="bg-surface px-6 py-3 rounded-xl">
          <Text className="text-primary font-bold" onPress={onRetry}>Try Again</Text>
        </View>
      )}
    </View>
  );
}

export function EmptyState({ title, message, icon: Icon = Inbox }: { title: string; message: string; icon?: any }) {
  return (
    <View className="flex-1 items-center justify-center p-6 text-center">
      <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
        <Icon size={32} color="#a3a3a3" />
      </View>
      <Text className="text-white text-lg font-bold tracking-tight">{title}</Text>
      <Text className="text-muted mt-2 text-center mb-6 text-base">{message}</Text>
    </View>
  );
}
