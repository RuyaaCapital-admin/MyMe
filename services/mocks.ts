import { Chat, Integration, Message, User } from '../types';

export const MOCK_USER: User = {
  id: 'usr_123',
  name: 'Alex Developer',
  email: 'alex@example.com',
  avatar: 'https://i.pravatar.cc/150?u=alex',
};

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'int_gmail',
    name: 'Gmail',
    category: 'Communication',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    status: 'connected',
    description: 'Read, send, and manage your emails automatically.',
  },
  {
    id: 'int_calendar',
    name: 'Google Calendar',
    category: 'Productivity',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    status: 'connected',
    description: 'Schedule meetings and manage your agenda.',
  },
  {
    id: 'int_slack',
    name: 'Slack',
    category: 'Communication',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    status: 'disconnected',
    description: 'Send messages and monitor channels.',
  },
  {
    id: 'int_github',
    name: 'GitHub',
    category: 'Developer Tools',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    status: 'needs_reconnect',
    description: 'Manage PRs, issues, and repositories.',
  },
  {
    id: 'int_notion',
    name: 'Notion',
    category: 'Productivity',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    status: 'disconnected',
    description: 'Read and write to your Notion workspace.',
  }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    title: 'Morning Briefing',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    previewMessage: 'Here is your summary for today.',
  },
  {
    id: 'chat_2',
    title: 'Draft Client Email',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    previewMessage: 'The draft has been saved to your Gmail drafts.',
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat_1': [
    {
      id: 'msg_1',
      chatId: 'chat_1',
      role: 'user',
      content: 'What do I have on my calendar today?',
      createdAt: new Date(Date.now() - 4000000).toISOString(),
    },
    {
      id: 'msg_2',
      chatId: 'chat_1',
      role: 'assistant',
      content: 'Let me check your calendar for today.',
      createdAt: new Date(Date.now() - 3950000).toISOString(),
      toolExecutions: [
        {
          id: 'tool_1',
          messageId: 'msg_2',
          toolName: 'google_calendar_list_events',
          appName: 'Google Calendar',
          status: 'completed',
          actionPrompt: "Checking today's events",
          result: 'Found 2 events',
        }
      ]
    },
    {
      id: 'msg_3',
      chatId: 'chat_1',
      role: 'assistant',
      content: 'You have a design review at 2 PM and a sync with the marketing team at 4 PM.',
      createdAt: new Date(Date.now() - 3900000).toISOString(),
    }
  ]
};
