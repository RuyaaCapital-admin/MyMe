import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ isAuthenticated: !!data.session, user: data.user, session: data.session, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
        set({ isAuthenticated: true, user: data.user, session: data.session, isLoading: false });
      } else {
        set({ isLoading: false });
        throw new Error("Please check your email to verify your account.");
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, session: null });
  },

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ isAuthenticated: !!session, session, user: session?.user || null, isLoading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ isAuthenticated: !!session, session, user: session?.user || null, isLoading: false });
      });
    } catch (error) {
      console.error('Session check failed:', error);
      set({ isLoading: false });
    }
  },
}));
