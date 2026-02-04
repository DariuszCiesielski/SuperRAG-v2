import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getThemeById } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = 'SUPERRAG_THEME';

// Helper: camelCase -> kebab-case
const camelToKebab = (str: string): string =>
  str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Aplikuje kolory motywu jako CSS custom properties
const applyThemeToDOM = (theme: Theme) => {
  const root = document.documentElement;
  const colors = theme.colors;

  // Ustaw wszystkie kolory jako CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    if (value !== undefined) {
      root.style.setProperty(`--${camelToKebab(key)}`, value);
    }
  });

  // Usuń poprzednie klasy efektów
  root.classList.remove('theme-glass', 'theme-gradient', 'theme-minimal', 'theme-dark');

  // Dodaj klasę dla efektów specjalnych
  if (theme.effects?.glassmorphism) {
    root.classList.add('theme-glass');
  }
  if (theme.effects?.gradients) {
    root.classList.add('theme-gradient');
  }
  if (theme.effects?.softShadows) {
    root.classList.add('theme-minimal');
  }
  if (theme.id === 'dark') {
    root.classList.add('theme-dark');
  }

  // Aktualizuj scrollbar (przez meta tag lub bezpośrednio)
  updateScrollbarStyles(theme);
};

// Aktualizuje style scrollbara
const updateScrollbarStyles = (theme: Theme) => {
  const styleId = 'theme-scrollbar-styles';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: ${theme.colors.scrollbarTrack}; }
    ::-webkit-scrollbar-thumb { background: ${theme.colors.scrollbarThumb}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${theme.colors.scrollbarThumbHover}; }
  `;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Odczytaj zapisany motyw z localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        return getThemeById(saved);
      }
    }
    return getThemeById('glass'); // domyślny motyw: Szkło
  });

  // Aplikuj motyw przy zmianie
  useEffect(() => {
    applyThemeToDOM(currentTheme);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme.id);
  }, [currentTheme]);

  // Aplikuj motyw przy pierwszym renderze
  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, []);

  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
