import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, ArrowUp, Paperclip } from 'lucide-react-native';

export function ChatComposer({ onSend, isLoading }: { onSend: (text: string) => void, isLoading?: boolean }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View className="px-4 py-4 bg-background border-t border-border/50">
      <View className="flex-row items-end bg-surface border border-border rounded-[28px] p-2 shadow-sm">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-background/50 border border-border/50" disabled={isLoading}>
          <Paperclip size={20} color="#A1A1AA" />
        </TouchableOpacity>
        
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message MyMe..."
          placeholderTextColor="#71717A"
          multiline
          maxLength={1000}
          className="flex-1 text-white text-base max-h-32 min-h-[40px] py-2 px-3 mx-1 font-medium"
          selectionColor="#4F46E5"
        />

        <TouchableOpacity 
          onPress={handleSend}
          disabled={!text.trim() || isLoading}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            text.trim() && !isLoading ? 'bg-primary shadow-md shadow-primary/30' : 'bg-background/50 border border-border/50'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <ArrowUp size={20} color={text.trim() ? '#ffffff' : '#A1A1AA'} strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
