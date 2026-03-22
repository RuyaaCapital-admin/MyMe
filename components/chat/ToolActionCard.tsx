import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ToolExecution } from '../../types';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react-native';

export function ToolActionCard({ tool }: { tool: ToolExecution }) {
  const getStatusIcon = () => {
    switch (tool.status) {
      case 'completed': return <CheckCircle2 size={16} color="#10b981" />;
      case 'failed': return <XCircle size={16} color="#ef4444" />;
      case 'thinking':
      case 'calling': return <Loader2 size={16} color="#3b82f6" />;
      case 'requires_action': return <Play size={16} color="#f59e0b" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (tool.status) {
      case 'completed': return 'border-emerald-500/30 bg-emerald-500/10';
      case 'failed': return 'border-rose-500/30 bg-rose-500/10';
      case 'thinking':
      case 'calling': return 'border-blue-500/30 bg-blue-500/10';
      case 'requires_action': return 'border-amber-500/30 bg-amber-500/10';
      default: return 'border-border bg-surface';
    }
  };

  return (
    <View className={`rounded-xl border p-3 mt-3 mb-1 flex-row items-center ${getStatusColor()}`}>
      <View className="mr-3">
        {getStatusIcon()}
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">{tool.appName} Action</Text>
        {tool.actionPrompt ? (
          <Text className="text-muted text-xs mt-0.5">{tool.actionPrompt}</Text>
        ) : null}
      </View>
      {tool.status === 'requires_action' && (
        <TouchableOpacity className="bg-amber-500/20 px-3 py-1.5 rounded-full ml-2">
          <Text className="text-amber-500 font-bold text-xs uppercase tracking-wider">Approve</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
