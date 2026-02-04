import { Theme } from './types';

export const glassTheme: Theme = {
  id: 'glass',
  name: 'Szkło',
  description: 'Nowoczesny efekt szkła z przezroczystościami',
  colors: {
    // Tła główne
    bgPrimary: '#0f172a',
    bgSecondary: 'rgba(255, 255, 255, 0.1)',
    bgTertiary: 'rgba(255, 255, 255, 0.05)',
    bgAccent: 'rgba(255, 255, 255, 0.15)',

    // Sidebar
    sidebarBg: 'rgba(15, 23, 42, 0.8)',
    sidebarText: '#e2e8f0',
    sidebarHover: 'rgba(255, 255, 255, 0.1)',
    sidebarActive: 'rgba(59, 130, 246, 0.8)',

    // Header
    headerBg: 'rgba(15, 23, 42, 0.9)',
    headerGradient: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
    headerText: '#ffffff',

    // Tekst
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',

    // Obramowania
    borderPrimary: 'rgba(255, 255, 255, 0.2)',
    borderSecondary: 'rgba(255, 255, 255, 0.1)',
    borderAccent: 'rgba(96, 165, 250, 0.6)',

    // Akcent/Brand
    accentPrimary: '#3b82f6',
    accentHover: '#60a5fa',
    accentLight: 'rgba(59, 130, 246, 0.2)',

    // Stany
    success: '#34d399',
    successLight: 'rgba(52, 211, 153, 0.2)',
    warning: '#fbbf24',
    warningLight: 'rgba(251, 191, 36, 0.2)',
    error: '#f87171',
    errorLight: 'rgba(248, 113, 113, 0.2)',
    info: '#60a5fa',
    infoLight: 'rgba(96, 165, 250, 0.2)',

    // Efekty
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    shadowLg: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    glassBg: 'rgba(255, 255, 255, 0.1)',
    blur: '12px',

    // Scrollbar
    scrollbarTrack: 'rgba(255, 255, 255, 0.05)',
    scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
    scrollbarThumbHover: 'rgba(255, 255, 255, 0.3)',
  },
  effects: {
    backdropBlur: true,
    glassmorphism: true,
  }
};
