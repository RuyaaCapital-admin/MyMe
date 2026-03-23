import { create } from 'zustand';
import { supabase } from '../utils/supabase';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ isAuthenticated: true, userId: session.user.id, isLoading: false });
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (data?.user) {
          set({ isAuthenticated: true, userId: data.user.id, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
          console.error('Anonymous Auth Failed. Please enable Anonymous Sign-Ins in Supabase Auth Providers.');
        }
      }
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
    }
  }
}));
