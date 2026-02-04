import { Theme } from './types';

export const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Minimalistyczny',
  description: 'Czysty, prosty interfejs z dużą ilością bieli',
  colors: {
    // Tła główne
    bgPrimary: '#ffffff',
    bgSecondary: '#ffffff',
    bgTertiary: '#fafafa',
    bgAccent: '#f5f5f5',

    // Sidebar
    sidebarBg: '#ffffff',
    sidebarText: '#525252',
    sidebarHover: '#f5f5f5',
    sidebarActive: '#0a0a0a',

    // Header
    headerBg: '#ffffff',
    headerGradient: 'none',
    headerText: '#0a0a0a',

    // Tekst
    textPrimary: '#0a0a0a',
    textSecondary: '#525252',
    textMuted: '#a3a3a3',
    textInverse: '#ffffff',

    // Obramowania
    borderPrimary: '#e5e5e5',
    borderSecondary: '#d4d4d4',
    borderAccent: '#0a0a0a',

    // Akcent/Brand
    accentPrimary: '#0a0a0a',
    accentHover: '#262626',
    accentLight: '#f5f5f5',

    // Stany
    success: '#22c55e',
    successLight: '#f0fdf4',
    warning: '#eab308',
    warningLight: '#fefce8',
    error: '#ef4444',
    errorLight: '#fef2f2',
    info: '#0a0a0a',
    infoLight: '#f5f5f5',

    // Efekty
    shadow: '0 1px 2px rgba(0,0,0,0.05)',
    shadowLg: '0 4px 6px -1px rgba(0,0,0,0.05)',
    overlay: 'rgba(10, 10, 10, 0.5)',

    // Scrollbar
    scrollbarTrack: '#fafafa',
    scrollbarThumb: '#d4d4d4',
    scrollbarThumbHover: '#a3a3a3',
  },
  effects: {
    softShadows: true,
  }
};
