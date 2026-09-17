import { create } from 'zustand';
import { PlaygroundTab, ModelExportPayload } from '../types/playground';
import { Locale } from '../utils/i18n';

export type ThemeMode = 'dark' | 'light';

interface PlaygroundState {
  activeTab: PlaygroundTab;
  isExportModalOpen: boolean;
  exportPayload: ModelExportPayload | null;
  isImportModalOpen: boolean;
  importTarget: PlaygroundTab;
  theme: ThemeMode;
  locale: Locale;
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
  } | null;

  setActiveTab: (tab: PlaygroundTab) => void;
  openExportModal: (payload?: ModelExportPayload) => void;
  closeExportModal: () => void;
  openImportModal: (target?: PlaygroundTab) => void;
  closeImportModal: () => void;
  setNotification: (notif: { title: string; message: string; type: 'info' | 'warning' | 'error' | 'success' } | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('ml_theme') as ThemeMode;
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light'; // Default light theme (white)
};

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('ml_lang') as Locale;
  if (saved === 'en' || saved === 'th') return saved;
  return 'en'; // Default English
};

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  activeTab: 'regression',
  isExportModalOpen: false,
  exportPayload: null,
  isImportModalOpen: false,
  importTarget: 'regression',
  theme: getInitialTheme(),
  locale: getInitialLocale(),
  notification: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  openExportModal: (payload) => set({ isExportModalOpen: true, exportPayload: payload || null }),
  closeExportModal: () => set({ isExportModalOpen: false }),
  openImportModal: (target) => set({ isImportModalOpen: true, importTarget: target || get().activeTab }),
  closeImportModal: () => set({ isImportModalOpen: false }),
  setNotification: (notif) =>
    set({
      notification: notif ? { ...notif, id: Math.random().toString() } : null,
    }),

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('ml_theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    }
    set({ theme: nextTheme });
  },

  setTheme: (theme: ThemeMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ml_theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  toggleLocale: () => {
    const nextLocale: Locale = get().locale === 'en' ? 'th' : 'en';
    if (typeof window !== 'undefined') {
      localStorage.setItem('ml_lang', nextLocale);
    }
    set({ locale: nextLocale });
  },

  setLocale: (locale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ml_lang', locale);
    }
    set({ locale });
  },
}));
