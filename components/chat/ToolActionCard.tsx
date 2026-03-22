import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ToolExecution } from '../../types';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react-native';

export function ToolActionCard({ tool }: { tool: ToolExecution }) {
  const getStatusIcon = () => {
    switch (tool.status) {
      case 'completed': return <CheckCircle2 size={18} color="#10b981" />;
      case 'failed': return <XCircle size={18} color="#ef4444" />;
      case 'thinking':
      case 'calling': return <Loader2 size={18} color="#818CF8" />;
      case 'requires_action': return <Play size={18} color="#F59E0B" fill="#F59E0B" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (tool.status) {
      case 'completed': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'failed': return 'border-rose-500/20 bg-rose-500/5';
      case 'thinking':
      case 'calling': return 'border-indigo-500/20 bg-indigo-500/5';
      case 'requires_action': return 'border-amber-500/20 bg-amber-500/5 shadow-sm shadow-amber-500/10';
      default: return 'border-border bg-surface';
    }
  };

  return (
    <View className={`rounded-2xl border p-3 mt-3 mb-1 flex-row items-center w-full ${getStatusColor()}`}>
      <View className="mr-3 ml-1">
        {getStatusIcon()}
      </View>
      <View className="flex-1">
        <Text className="text-zinc-100 font-bold text-sm tracking-wide">{tool.appName} Action</Text>
        {tool.actionPrompt ? (
          <Text className="text-zinc-400 text-xs mt-1 font-medium">{tool.actionPrompt}</Text>
        ) : null}
      </View>
      {tool.status === 'requires_action' && (
        <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-xl ml-2 shadow-sm shadow-amber-500/30">
          <Text className="text-zinc-950 font-black text-xs uppercase tracking-widest">Approve</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
