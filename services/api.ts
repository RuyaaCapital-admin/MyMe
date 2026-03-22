import { Chat, Integration, Message, User } from '../types';
import { MOCK_CHATS, MOCK_INTEGRATIONS, MOCK_MESSAGES, MOCK_USER } from './mocks';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (): Promise<{ user: User; token: string }> => {
      await delay(1000);
      return { user: MOCK_USER, token: 'mock_jwt_token_123' };
    },
    register: async (): Promise<{ user: User; token: string }> => {
      await delay(1000);
      return { user: MOCK_USER, token: 'mock_jwt_token_123' };
    },
  },
  user: {
    getMe: async (): Promise<User> => {
      await delay(500);
      return MOCK_USER;
    },
  },
  chats: {
    list: async (): Promise<Chat[]> => {
      await delay(600);
      return MOCK_CHATS;
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
      await delay(500);
      return MOCK_MESSAGES[chatId] || [];
    },
    sendMessage: async (chatId: string, content: string): Promise<Message> => {
      await delay(800);
      return {
        id: `msg_${Date.now()}`,
        chatId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
    },
  },
  integrations: {
    list: async (): Promise<Integration[]> => {
      await delay(800);
      return MOCK_INTEGRATIONS;
    },
    toggleConnection: async (id: string, currentStatus: string): Promise<Integration> => {
      await delay(1200); // Simulate OAuth flow delay
      const integration = MOCK_INTEGRATIONS.find(i => i.id === id);
      if (!integration) throw new Error('Not found');
      
      const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
      return { ...integration, status: newStatus as any };
    }
  }
};
