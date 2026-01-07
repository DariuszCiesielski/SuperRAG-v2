# Plan: Dodanie obsługi języka polskiego do interfejsu

## Przegląd

Projekt SuperRAG jest aplikacją React/TypeScript bez obecnej obsługi internacjonalizacji. Plan obejmuje dodanie pełnej obsługi języka polskiego poprzez implementację systemu i18n z użyciem biblioteki `react-i18next`.

## Architektura rozwiązania

### 1. Wybór biblioteki i18n
- **react-i18next** - standardowa biblioteka dla React
- **i18next** - silnik tłumaczeń
- **i18next-browser-languagedetector** - automatyczne wykrywanie języka przeglądarki

### 2. Struktura plików
```
src/
  locales/
    en/
      common.json      # Wspólne teksty (przyciski, etykiety)
      auth.json        # Teksty autentykacji
      dashboard.json   # Teksty dashboardu
      notebook.json    # Teksty notebooków
      profile.json     # Teksty profilu
      errors.json      # Komunikaty błędów
    pl/
      common.json
      auth.json
      dashboard.json
      notebook.json
      profile.json
      errors.json
  i18n/
    config.ts          # Konfiguracja i18next
  components/
    ui/
      LanguageSwitcher.tsx  # Komponent przełącznika języka
```

### 3. Komponenty do modyfikacji

#### Główne pliki:
- `src/App.tsx` - dodanie I18nextProvider
- `src/i18n/config.ts` - nowy plik konfiguracji i18n
- `src/components/ui/LanguageSwitcher.tsx` - nowy komponent

#### Komponenty wymagające tłumaczeń:
- `src/pages/Auth.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Profile.tsx`
- `src/pages/Notebook.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/EmptyDashboard.tsx`
- `src/components/dashboard/NotebookCard.tsx`
- `src/components/dashboard/NotebookGrid.tsx`
- `src/components/notebook/NotebookHeader.tsx`
- `src/components/notebook/ChatArea.tsx`
- `src/components/notebook/SourcesSidebar.tsx`
- `src/components/notebook/StudioSidebar.tsx`
- `src/components/notebook/NoteEditor.tsx`
- `src/components/profile/DeleteAccountDialog.tsx`
- Wszystkie dialogi i komponenty z tekstem użytkownika

## Implementacja

### Krok 1: Instalacja zależności
```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### Krok 2: Konfiguracja i18n
Utworzenie `src/i18n/config.ts` z:
- Konfiguracją i18next
- Wykrywaniem języka z localStorage/przeglądarki
- Fallback na angielski
- Namespace'ami dla różnych sekcji aplikacji

### Krok 3: Utworzenie plików tłumaczeń
- Pliki JSON dla każdego namespace'u w `src/locales/en/` i `src/locales/pl/`
- Klucze tłumaczeń zorganizowane logicznie według funkcjonalności

### Krok 4: Komponent przełącznika języka
- Dropdown z flagami/ikonami języków
- Integracja z DashboardHeader i NotebookHeader
- Zapis preferencji w localStorage

### Krok 5: Refaktoryzacja komponentów
- Zamiana hardcoded stringów na `t('namespace:key')`
- Użycie hooka `useTranslation()` w komponentach
- Obsługa pluralizacji gdzie potrzebne

### Krok 6: Formatowanie dat i liczb
- Konfiguracja formatowania dla polskiego (date-fns locale)
- Tłumaczenie komunikatów błędów i walidacji

## Szczegóły techniczne

### Przykładowa struktura tłumaczeń:
```json
// locales/pl/common.json
{
  "buttons": {
    "save": "Zapisz",
    "cancel": "Anuluj",
    "delete": "Usuń",
    "edit": "Edytuj"
  },
  "navigation": {
    "dashboard": "Panel główny",
    "profile": "Profil",
    "signOut": "Wyloguj"
  }
}
```

### Przykład użycia w komponencie:
```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation('common');
  return <button>{t('buttons.save')}</button>;
};
```

## Zachowanie preferencji języka
- Zapis w `localStorage` pod kluczem `i18nextLng`
- Opcjonalnie: synchronizacja z profilem użytkownika w Supabase (rozszerzenie w przyszłości)

## Zakres tłumaczeń
- Wszystkie teksty interfejsu użytkownika
- Komunikaty błędów i walidacji
- Placeholdery w formularzach
- Tooltips i opisy
- Komunikaty toast/notyfikacji

## Wykluczenia
- Nazwy techniczne (np. "SuperRAG" może pozostać bez zmian)
- Dane użytkownika (tytuły notebooków, notatki)
- Komunikaty z API (jeśli nie są kontrolowane przez frontend)

## Testowanie
- Przełączanie między językami
- Sprawdzenie wszystkich ekranów w obu językach
- Weryfikacja długości tekstów (polski może być dłuższy)
- Testowanie wykrywania języka przeglądarki


