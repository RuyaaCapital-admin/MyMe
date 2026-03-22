export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type ToolExecutionStatus = 'thinking' | 'calling' | 'requires_action' | 'completed' | 'failed';

export interface ToolExecution {
  id: string;
  messageId: string;
  toolName: string;
  appName: string;
  status: ToolExecutionStatus;
  actionPrompt?: string;
  result?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  toolExecutions?: ToolExecution[];
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  previewMessage?: string;
}

export type IntegrationStatus = 'connected' | 'disconnected' | 'needs_reconnect';

export interface Integration {
  id: string;
  name: string;
  category: string;
  iconUrl: string;
  status: IntegrationStatus;
  description: string;
}
