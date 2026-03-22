import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SettingRowProps {
  icon: any;
  title: string;
  subtitle?: string;
  type?: 'link' | 'toggle' | 'danger';
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  onPress?: () => void;
}

export function SettingRow({ icon: Icon, title, subtitle, type = 'link', value, onValueChange, onPress }: SettingRowProps) {
  const isDanger = type === 'danger';

  return (
    <TouchableOpacity 
      activeOpacity={type === 'link' || type === 'danger' ? 0.7 : 1}
      onPress={type !== 'toggle' ? onPress : undefined}
      className={`flex-row items-center bg-surface p-4 rounded-3xl mb-3 border ${isDanger ? 'border-rose-500/30' : 'border-border'}`}
    >
      <View className={`w-12 h-12 rounded-[20px] items-center justify-center mr-4 ${isDanger ? 'bg-rose-500/10' : 'bg-primary/20'}`}>
        <Icon size={24} color={isDanger ? '#ef4444' : '#3b82f6'} />
      </View>
      <View className="flex-1 mr-4 cursor-pointer">
        <Text className={`font-bold text-lg mb-0.5 ${isDanger ? 'text-rose-400' : 'text-white'}`}>{title}</Text>
        {subtitle && <Text className="text-muted text-sm">{subtitle}</Text>}
      </View>
      
      {type === 'link' && <ChevronRight size={20} color="#a3a3a3" />}
      {type === 'toggle' && (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: '#262626', true: '#3b82f6' }}
          thumbColor="#ffffff"
        />
      )}
    </TouchableOpacity>
  );
}
