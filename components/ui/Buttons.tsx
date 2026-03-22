import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ title, onPress, isLoading, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`bg-primary w-full py-4 rounded-2xl items-center justify-center flex-row ${disabled ? 'opacity-50' : 'opacity-100'} active:opacity-80`}
    >
      {isLoading ? (
        <ActivityIndicator color="white" className="mr-2" />
      ) : null}
      <Text className="text-white font-semibold text-lg">{title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, isLoading, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`bg-surface border border-border w-full py-4 rounded-2xl items-center justify-center flex-row ${disabled ? 'opacity-50' : 'opacity-100'} active:opacity-80`}
    >
      {isLoading ? (
        <ActivityIndicator color="white" className="mr-2" />
      ) : null}
      <Text className="text-text font-semibold text-lg">{title}</Text>
    </TouchableOpacity>
  );
}
