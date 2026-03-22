import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { IntegrationStatus } from '../../types';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between mb-4 mt-6">
      <Text className="text-white text-xl font-bold tracking-tight">{title}</Text>
      {action}
    </View>
  );
}

export function StatusBadge({ status }: { status: IntegrationStatus | 'pending' | 'success' | 'error' | string }) {
  let bg = 'bg-surface';
  let text = 'text-muted';
  let label = status;

  if (status === 'connected' || status === 'success') {
    bg = 'bg-emerald-500/20';
    text = 'text-emerald-400';
    label = 'Connected';
  } else if (status === 'needs_reconnect' || status === 'error') {
    bg = 'bg-rose-500/20';
    text = 'text-rose-400';
    label = 'Action Required';
  } else if (status === 'disconnected') {
    bg = 'bg-surface';
    text = 'text-muted';
    label = 'Not Connected';
  }

  return (
    <View className={`${bg} px-3 py-1 rounded-full self-start`}>
      <Text className={`${text} text-[10px] font-bold tracking-wider uppercase`}>{label}</Text>
    </View>
  );
}

export function SearchInput({ value, onChangeText, placeholder = 'Search...' }: { value: string; onChangeText: (text: string) => void; placeholder?: string }) {
  return (
    <View className="bg-surface flex-row items-center px-4 py-3.5 rounded-2xl border border-border focus:border-primary">
      <Search size={20} color="#a3a3a3" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        className="flex-1 ml-3 text-white text-base"
        selectionColor="#3b82f6"
      />
    </View>
  );
}
