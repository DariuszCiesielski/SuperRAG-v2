import { Theme } from './types';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Klasyczny',
  description: 'Jasny motyw z niebieskimi akcentami',
  colors: {
    // Tła główne
    bgPrimary: '#f8fafc',      // slate-50
    bgSecondary: '#ffffff',     // white
    bgTertiary: '#f1f5f9',      // slate-100
    bgAccent: '#e2e8f0',        // slate-200

    // Sidebar
    sidebarBg: '#0f172a',       // slate-900
    sidebarText: '#cbd5e1',     // slate-300
    sidebarHover: '#1e293b',    // slate-800
    sidebarActive: '#2563eb',   // blue-600

    // Header
    headerBg: '#0f172a',        // slate-900
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
    headerText: '#ffffff',

    // Tekst
    textPrimary: '#1e293b',     // slate-800
    textSecondary: '#475569',   // slate-600
    textMuted: '#94a3b8',       // slate-400
    textInverse: '#ffffff',

    // Obramowania
    borderPrimary: '#e2e8f0',   // slate-200
    borderSecondary: '#cbd5e1', // slate-300
    borderAccent: '#3b82f6',    // blue-500

    // Akcent/Brand
    accentPrimary: '#3b82f6',   // blue-500
    accentHover: '#2563eb',     // blue-600
    accentLight: '#dbeafe',     // blue-100

    // Stany
    success: '#10b981',         // emerald-500
    successLight: '#d1fae5',    // emerald-100
    warning: '#f59e0b',         // amber-500
    warningLight: '#fef3c7',    // amber-100
    error: '#ef4444',           // red-500
    errorLight: '#fee2e2',      // red-100
    info: '#3b82f6',            // blue-500
    infoLight: '#dbeafe',       // blue-100

    // Efekty
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    overlay: 'rgba(15, 23, 42, 0.6)',

    // Scrollbar
    scrollbarTrack: '#f1f1f1',
    scrollbarThumb: '#cbd5e1',
    scrollbarThumbHover: '#94a3b8',
  }
};
