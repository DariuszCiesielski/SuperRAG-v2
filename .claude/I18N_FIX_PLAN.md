# Plan naprawy problemu i18n - wyswietlanie kluczy zamiast tlumaczen

## Data: 2026-01-08

## Problem

Komponenty dialogow wyswietlaja klucze tlumaczen (np. `dialogs.multipleWebsites.title`) zamiast przetlumaczonych tekstow.

## Przyczyna

**Nieprawidlowa skladnia kluczy tlumaczen** w komponentach dialogow.

### Jak dziala i18next:

```typescript
const { t } = useTranslation(['dialogs', 'common']);
```

- Pierwszy element tablicy (`'dialogs'`) staje sie **domyslnym namespace'em**
- `t('multipleWebsites.title')` -> szuka `multipleWebsites.title` w namespace `dialogs` (POPRAWNE)
- `t('common:buttons.cancel')` -> explicytny namespace z dwukropkiem (POPRAWNE)
- `t('dialogs.multipleWebsites.title')` -> szuka `dialogs.multipleWebsites.title` w namespace `dialogs` (BLEDNE)

### Blad w kodzie:

**Bledne wywolanie:**
```typescript
t('dialogs.multipleWebsites.title')
```

**i18next szuka tej struktury w dialogs.json:**
```json
{
  "dialogs": {
    "multipleWebsites": {
      "title": "..."
    }
  }
}
```

**Ale w pliku jest:**
```json
{
  "multipleWebsites": {
    "title": "..."
  }
}
```

## Pliki do naprawy

| Plik | Liczba blednych wywolan |
|------|-------------------------|
| `src/components/notebook/MultipleWebsiteUrlsDialog.tsx` | 6 |
| `src/components/notebook/CopiedTextDialog.tsx` | 10 |
| `src/components/notebook/WebsiteUrlInput.tsx` | 6 |
| `src/components/notebook/YouTubeUrlInput.tsx` | 6 |
| `src/components/notebook/RenameSourceDialog.tsx` | 4 |

**Lacznie: 32 bledne wywolania t()**

## Rozwiazanie (Opcja A)

Usunac prefix `'dialogs.'` ze wszystkich wywolan t() w komponentach dialogow.

**Przed:**
```typescript
t('dialogs.multipleWebsites.title')
```

**Po:**
```typescript
t('multipleWebsites.title')
```

## Dlaczego to jest poprawne rozwiazanie

1. Zgodne z konwencja i18next
2. Nie wymaga zmian w plikach JSON
3. Spojne z pozostalymi komponentami w projekcie (np. AuthForm.tsx, useNotebookGeneration.tsx)

## Status

- [x] Analiza problemu
- [x] Identyfikacja plikow do naprawy
- [ ] Implementacja poprawek
- [ ] Testowanie
