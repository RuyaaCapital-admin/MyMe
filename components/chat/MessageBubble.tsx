import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '../../types';
import { ToolActionCard } from './ToolActionCard';
import { Bot, User as UserIcon } from 'lucide-react-native';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3 mt-1">
          <Bot size={16} color="#3b82f6" />
        </View>
      )}
      
      <View className={`w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <View 
          className={`px-4 py-3.5 rounded-2xl ${
            isUser ? 'bg-primary rounded-tr-sm' : 'bg-surface border border-border rounded-tl-sm w-full'
          }`}
        >
          <Text className={`text-base ${isUser ? 'text-white' : 'text-white leading-relaxed'}`}>
            {message.content}
          </Text>
        </View>
        
        {message.toolExecutions?.map(tool => (
          <ToolActionCard key={tool.id} tool={tool} />
        ))}
      </View>

      {isUser && (
        <View className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center ml-3 mt-1">
          <UserIcon size={16} color="#a3a3a3" />
        </View>
      )}
    </View>
  );
}
