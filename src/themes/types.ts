// Interfejs kolorów motywu
export interface ThemeColors {
  // Tła główne
  bgPrimary: string;        // Główne tło aplikacji
  bgSecondary: string;      // Tło sekcji/kart
  bgTertiary: string;       // Tło elementów zagnieżdżonych
  bgAccent: string;         // Tło akcentowe (hover, focus)

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarHover: string;
  sidebarActive: string;

  // Header
  headerBg: string;
  headerGradient: string;
  headerText: string;

  // Tekst
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Obramowania
  borderPrimary: string;
  borderSecondary: string;
  borderAccent: string;

  // Akcent/Brand
  accentPrimary: string;
  accentHover: string;
  accentLight: string;

  // Stany
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Efekty specjalne
  shadow: string;
  shadowLg: string;
  overlay: string;
  glassBg?: string;
  blur?: string;

  // Scrollbar
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

// Efekty specjalne motywu
export interface ThemeEffects {
  backdropBlur?: boolean;
  glassmorphism?: boolean;
  gradients?: boolean;
  softShadows?: boolean;
}

// Pełny interfejs motywu
export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  effects?: ThemeEffects;
}

// Typ identyfikatora motywu
export type ThemeId = 'default' | 'dark' | 'glass' | 'minimal' | 'gradient' | 'corporate';
