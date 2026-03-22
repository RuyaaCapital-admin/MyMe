import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, ArrowUp } from 'lucide-react-native';

export function ChatComposer({ onSend, isLoading }: { onSend: (text: string) => void, isLoading?: boolean }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View className="px-4 py-3 bg-background border-t border-border">
      <View className="flex-row items-end bg-surface border border-border rounded-3xl pt-1 pb-1 pl-2 pr-2">
        <TouchableOpacity className="p-3 items-center justify-center" disabled={isLoading}>
          <Plus size={24} color="#a3a3a3" />
        </TouchableOpacity>
        
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message MyMe..."
          placeholderTextColor="#a3a3a3"
          multiline
          maxLength={1000}
          className="flex-1 text-white text-base max-h-32 min-h-[48px] py-3 px-1"
          selectionColor="#3b82f6"
        />

        <TouchableOpacity 
          onPress={handleSend}
          disabled={!text.trim() || isLoading}
          className={`w-10 h-10 rounded-full items-center justify-center mb-1 ml-2 ${
            text.trim() && !isLoading ? 'bg-primary' : 'bg-surface border border-border'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <ArrowUp size={20} color={text.trim() ? '#ffffff' : '#a3a3a3'} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
