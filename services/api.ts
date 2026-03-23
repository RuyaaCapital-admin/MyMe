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
        const { data: chatCheck } = await supabase.from('chats').select('id').eq('id', chatId).maybeSingle();
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
      const { data: composioRes, error: edgeError } = await supabase.functions.invoke('myme-agent', {
        body: { action: 'list_apps' }
      });
      if (edgeError) {
        console.error('Edge function error (list_apps):', edgeError);
        return [];
      }

      // Only fetch connections if user is authenticated
      let myConnections: any[] = [];
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const { data: connRes, error: connError } = await supabase.functions.invoke('myme-agent', {
            body: { action: 'get_connections' }
          });
          if (!connError && connRes) {
            myConnections = Array.isArray(connRes) ? connRes : [];
          }
        } catch (_) { /* silently skip */ }
      }

      const allApps = Array.isArray(composioRes) ? composioRes : (composioRes?.items || []);
      const connectedAppNames = myConnections.map((c: any) => (c.appName || c.appUniqueId || '').toLowerCase());

      // Only use logo URLs from known reliable CDN domains; discard broken ones
      const isReliableLogo = (url: string) => {
        if (!url) return false;
        try {
          const hostname = new URL(url).hostname;
          return ['googleapis.com', 'github.com', 'githubusercontent.com', 'composio.dev', 'cdn.composio.dev', 'simpleicons.org'].some(d => hostname.includes(d));
        } catch { return false; }
      };

      return allApps.map((app: any) => {
        const rawLogo = app.logo || app.meta?.logo || '';
        return {
          id: app.key || app.name || app.appId,
          name: app.name || app.key || 'Unknown',
          iconUrl: isReliableLogo(rawLogo) ? rawLogo : '',
          description: app.description || `Integrate with ${app.name || app.key}`,
          status: connectedAppNames.includes((app.key || app.name || '').toLowerCase()) ? 'connected' as const : 'disconnected' as const,
          category: (app.categories && app.categories[0]) || (app.tags && app.tags[0]) || 'productivity'
        };
      });
    },
    toggleConnection: async (id: string, currentStatus: string): Promise<Integration> => {
      if (currentStatus === 'connected') {
         throw new Error("Disconnection via UI not implemented yet.");
      }
      const { data, error } = await supabase.functions.invoke('myme-agent', {
        body: { action: 'connect', appName: id }
      });
      if (error) throw error;
      if (data && data.redirectUrl) {
        if (typeof window !== 'undefined') {
          window.location.href = data.redirectUrl;
        }
      }
      return { id, name: id, description: '', status: 'disconnected', category: '', iconUrl: '' };
    },
  }
};
