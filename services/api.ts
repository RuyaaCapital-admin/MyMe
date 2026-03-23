import { supabase } from '../utils/supabase';
import { Chat, Integration, Message, User } from '../types';

export const api = {
  auth: {
    login: async (): Promise<{ user: User; token: string }> => {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return { user: { id: data.user!.id, name: 'Anonymous', email: '', avatar: '' }, token: data.session!.access_token };
    },
    register: async (): Promise<{ user: User; token: string }> => {
      return api.auth.login();
    },
  },
  user: {
    getMe: async (): Promise<User> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return { id: user.id, name: 'You', email: user.email || '', avatar: '' };
    },
  },
  chats: {
    list: async (): Promise<Chat[]> => {
      const { data, error } = await supabase.from('chats').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        title: d.title,
        lastMessage: '',
        createdAt: d.created_at,
        updatedAt: d.created_at,
        unread: false
      }));
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
      // Use uuid fallback check if frontend sent a dummy string
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(chatId)) return [];

      const { data, error } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(d => ({
        id: d.id,
        chatId: d.chat_id,
        role: d.role as any,
        content: d.content,
        createdAt: d.created_at,
        toolExecutions: d.tool_executions || []
      }));
    },
    sendMessage: async (chatId: string, content: string): Promise<Message> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let finalChatId = chatId;
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      
      // If frontend generated a non-uuid (like Date.now), let's create a real chat
      if (!uuidRegex.test(chatId)) {
        const { data: newChat, error: chatErr } = await supabase.from('chats').insert({
          title: content.substring(0, 30), 
          user_id: user?.id 
        }).select().single();
        if (chatErr) throw chatErr;
        finalChatId = newChat.id;
      } else {
        // Evaluate if it exists
        const { data: chatCheck } = await supabase.from('chats').select('id').eq('id', chatId).single();
        if (!chatCheck) {
          await supabase.from('chats').insert({ id: chatId, title: content.substring(0, 30), user_id: user?.id });
        }
      }

      // 1. Insert user message
      const { data: userMsg, error: insertError } = await supabase.from('messages').insert({
        chat_id: finalChatId,
        role: 'user',
        content: content,
      }).select().single();
      
      if (insertError) throw insertError;

      // 2. Fetch history for Edge function context
      const { data: history } = await supabase.from('messages').select('*').eq('chat_id', finalChatId).order('created_at', { ascending: true });
      const apiMessages = history?.map(m => ({ role: m.role, content: m.content })) || [{ role: 'user', content }];

      // 3. Call Edge Function
      const { data: agentResponse, error: agentError } = await supabase.functions.invoke('myme-agent', {
        body: { action: 'chat', messages: apiMessages }
      });
      if (agentError) throw agentError;

      if (agentResponse) {
        // 4. Save Assistant Response
        await supabase.from('messages').insert({
          chat_id: finalChatId,
          role: 'assistant',
          content: agentResponse.content || '',
          tool_executions: agentResponse.tool_call ? [agentResponse.tool_call] : null,
        });
      }

      return {
        id: userMsg.id,
        chatId: userMsg.chat_id,
        role: 'user',
        content: userMsg.content,
        createdAt: userMsg.created_at,
      }; 
    },
  },
  integrations: {
    list: async (): Promise<Integration[]> => {
      const { data, error } = await supabase.from('connections').select('*');
      if (error) throw error;
      
      const baseApps: Integration[] = [
        { id: 'gmail', name: 'Gmail', iconUrl: '', description: 'Read and send emails', status: 'disconnected' as any, category: 'productivity' },
        { id: 'github', name: 'GitHub', iconUrl: '', description: 'Manage repositories', status: 'disconnected' as any, category: 'developer' },
        { id: 'slack', name: 'Slack', iconUrl: '', description: 'Send and read messages', status: 'disconnected' as any, category: 'productivity' },
        { id: 'notion', name: 'Notion', iconUrl: '', description: 'Manage workspaces', status: 'disconnected' as any, category: 'productivity' },
        { id: 'googlecalendar', name: 'Google Calendar', iconUrl: '', description: 'Manage events', status: 'disconnected' as any, category: 'productivity' },
      ];

      return baseApps.map(app => {
        const found = data?.find(c => c.app_name === app.id);
        if (found) {
          app.status = 'connected' as any;
        }
        return app;
      });
    },
    toggleConnection: async (id: string, currentStatus: string): Promise<Integration> => {
      throw new Error("Handle Composio OAuth flow manually");
    }
  }
};
