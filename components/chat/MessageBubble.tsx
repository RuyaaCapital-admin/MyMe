import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '../../types';
import { ToolActionCard } from './ToolActionCard';
import { Bot, User as UserIcon, Sparkles } from 'lucide-react-native';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center mr-3 mt-1 border border-primary/30 shadow-sm">
          <Sparkles size={18} color="#818CF8" />
        </View>
      )}
      
      <View className={`w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <View 
          className={`px-5 py-4 rounded-[24px] shadow-sm ${
            isUser 
              ? 'bg-primary rounded-tr-[4px] border border-indigo-500/50' 
              : 'bg-surface border border-border rounded-tl-[4px] w-full'
          }`}
        >
          <Text className={`text-base ${isUser ? 'text-white tracking-wide' : 'text-zinc-200 leading-7 tracking-wide'}`}>
            {message.content}
          </Text>
        </View>
        
        {message.toolExecutions?.map(tool => (
          <ToolActionCard key={tool.id} tool={tool} />
        ))}
        
        <Text className="text-[10px] text-muted mt-2 mx-1 font-medium tracking-widest uppercase">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {isUser && (
        <View className="w-9 h-9 rounded-full bg-surface border border-border items-center justify-center ml-3 mt-1 shadow-sm">
          <UserIcon size={18} color="#A1A1AA" />
        </View>
      )}
    </View>
  );
}
