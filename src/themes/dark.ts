import { Theme } from './types';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Ciemny',
  description: 'Elegancki ciemny motyw redukujący zmęczenie oczu',
  colors: {
    // Tła główne
    bgPrimary: '#0f172a',       // slate-900
    bgSecondary: '#1e293b',     // slate-800
    bgTertiary: '#334155',      // slate-700
    bgAccent: '#475569',        // slate-600

    // Sidebar
    sidebarBg: '#020617',       // slate-950
    sidebarText: '#94a3b8',     // slate-400
    sidebarHover: '#1e293b',    // slate-800
    sidebarActive: '#3b82f6',   // blue-500

    // Header
    headerBg: '#020617',
    headerGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #172554 100%)',
    headerText: '#f1f5f9',

    // Tekst
    textPrimary: '#f1f5f9',     // slate-100
    textSecondary: '#cbd5e1',   // slate-300
    textMuted: '#64748b',       // slate-500
    textInverse: '#0f172a',

    // Obramowania
    borderPrimary: '#334155',   // slate-700
    borderSecondary: '#475569', // slate-600
    borderAccent: '#60a5fa',    // blue-400

    // Akcent/Brand
    accentPrimary: '#3b82f6',   // blue-500
    accentHover: '#60a5fa',     // blue-400
    accentLight: '#1e3a8a',     // blue-900

    // Stany
    success: '#34d399',         // emerald-400
    successLight: '#064e3b',    // emerald-900
    warning: '#fbbf24',         // amber-400
    warningLight: '#78350f',    // amber-900
    error: '#f87171',           // red-400
    errorLight: '#7f1d1d',      // red-900
    info: '#60a5fa',            // blue-400
    infoLight: '#1e3a8a',       // blue-900

    // Efekty
    shadow: '0 4px 12px rgba(0,0,0,0.4)',
    shadowLg: '0 20px 25px -5px rgba(0,0,0,0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Scrollbar
    scrollbarTrack: '#1e293b',
    scrollbarThumb: '#475569',
    scrollbarThumbHover: '#64748b',
  }
};
