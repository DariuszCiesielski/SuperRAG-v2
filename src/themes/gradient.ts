import { Theme } from './types';

export const gradientTheme: Theme = {
  id: 'gradient',
  name: 'Gradientowy',
  description: 'Żywe kolory z płynnymi przejściami',
  colors: {
    // Tła główne
    bgPrimary: '#fdf4ff',       // fuchsia-50
    bgSecondary: '#ffffff',
    bgTertiary: '#fae8ff',      // fuchsia-100
    bgAccent: '#f5d0fe',        // fuchsia-200

    // Sidebar - gradient jako solid color (gradient w CSS)
    sidebarBg: '#4c1d95',       // violet-900 (będzie gradient)
    sidebarText: '#e9d5ff',     // purple-200
    sidebarHover: 'rgba(255, 255, 255, 0.1)',
    sidebarActive: '#ffffff',

    // Header
    headerBg: '#7c3aed',        // violet-600
    headerGradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)',
    headerText: '#ffffff',

    // Tekst
    textPrimary: '#1e1b4b',     // indigo-950
    textSecondary: '#4c1d95',   // violet-900
    textMuted: '#7c3aed',       // violet-600
    textInverse: '#ffffff',

    // Obramowania
    borderPrimary: '#e9d5ff',   // purple-200
    borderSecondary: '#d8b4fe', // purple-300
    borderAccent: '#a855f7',    // purple-500

    // Akcent/Brand
    accentPrimary: '#a855f7',   // purple-500
    accentHover: '#9333ea',     // purple-600
    accentLight: '#f3e8ff',     // purple-100

    // Stany
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',
    info: '#8b5cf6',
    infoLight: '#ede9fe',

    // Efekty
    shadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
    shadowLg: '0 20px 40px rgba(168, 85, 247, 0.4)',
    overlay: 'rgba(76, 29, 149, 0.7)',

    // Scrollbar
    scrollbarTrack: '#fae8ff',
    scrollbarThumb: '#d8b4fe',
    scrollbarThumbHover: '#c084fc',
  },
  effects: {
    gradients: true,
  }
};
