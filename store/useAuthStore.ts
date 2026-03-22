import { create } from 'zustand';
import { User } from '../types';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (user, token) => {
    await SecureStore.setItemAsync('myme_user_token', token);
    await SecureStore.setItemAsync('myme_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('myme_user_token');
    await SecureStore.deleteItemAsync('myme_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('myme_user_token');
      const userStr = await SecureStore.getItemAsync('myme_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));
