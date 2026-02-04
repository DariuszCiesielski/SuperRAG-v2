import { Theme } from './types';

export const corporateTheme: Theme = {
  id: 'corporate',
  name: 'Korporacyjny',
  description: 'Profesjonalny motyw dla środowiska biznesowego',
  colors: {
    // Tła główne
    bgPrimary: '#f0f4f8',
    bgSecondary: '#ffffff',
    bgTertiary: '#e1e8ef',
    bgAccent: '#d1dce5',

    // Sidebar
    sidebarBg: '#1a365d',       // Navy blue
    sidebarText: '#a0aec0',
    sidebarHover: '#2a4365',
    sidebarActive: '#4299e1',

    // Header
    headerBg: '#1a365d',
    headerGradient: 'linear-gradient(90deg, #1a365d 0%, #2c5282 100%)',
    headerText: '#ffffff',

    // Tekst
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    textInverse: '#ffffff',

    // Obramowania
    borderPrimary: '#cbd5e0',
    borderSecondary: '#a0aec0',
    borderAccent: '#3182ce',

    // Akcent/Brand
    accentPrimary: '#3182ce',
    accentHover: '#2b6cb0',
    accentLight: '#bee3f8',

    // Stany
    success: '#38a169',
    successLight: '#c6f6d5',
    warning: '#d69e2e',
    warningLight: '#faf089',
    error: '#c53030',
    errorLight: '#fed7d7',
    info: '#3182ce',
    infoLight: '#bee3f8',

    // Efekty
    shadow: '0 2px 4px rgba(0,0,0,0.1)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    overlay: 'rgba(26, 54, 93, 0.6)',

    // Scrollbar
    scrollbarTrack: '#e1e8ef',
    scrollbarThumb: '#a0aec0',
    scrollbarThumbHover: '#718096',
  }
};
