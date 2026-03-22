import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true, // Default to premium dark theme
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setTheme: (isDark) => set({ isDark }),
}));
