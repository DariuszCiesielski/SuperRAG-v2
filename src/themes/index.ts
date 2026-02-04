import { Theme, ThemeId } from './types';
import { defaultTheme } from './default';
import { darkTheme } from './dark';
import { glassTheme } from './glass';
import { minimalTheme } from './minimal';
import { gradientTheme } from './gradient';
import { corporateTheme } from './corporate';

// Eksport wszystkich motywów jako tablica
export const themes: Theme[] = [
  defaultTheme,
  darkTheme,
  glassTheme,
  minimalTheme,
  gradientTheme,
  corporateTheme,
];

// Eksport pojedynczych motywów
export {
  defaultTheme,
  darkTheme,
  glassTheme,
  minimalTheme,
  gradientTheme,
  corporateTheme,
};

// Eksport typów
export type { Theme, ThemeId, ThemeColors, ThemeEffects } from './types';

// Helper do znajdowania motywu po ID
export const getThemeById = (id: string): Theme => {
  return themes.find(t => t.id === id) || glassTheme; // domyślny: glass
};
