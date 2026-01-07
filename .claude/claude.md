# SuperRAG / InsightsLM - Dokumentacja projektu

## Przegląd

Open-source'owa alternatywa dla NotebookLM - narzędzie AI do badań bazujące na RAG (Retrieval-Augmented Generation). Frontend: React + TypeScript + Vite. Backend: Supabase + N8N. AI: OpenAI i Gemini.

## Konfiguracja projektu

**Supabase:**
- Project ID: `sfqsuysimebkdeayxmmi`
- Link: `supabase link --project-ref sfqsuysimebkdeayxmmi`
- Dev server port: `8080` (w `vite.config.ts`)

**Zmienne środowiskowe (.env):**
```env
VITE_SUPABASE_URL=https://sfqsuysimebkdeayxmmi.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Secrets w Supabase (Edge Functions → Secrets):**
- `NOTEBOOK_CHAT_URL` - webhook N8N dla czatu
- `NOTEBOOK_GENERATION_URL` - webhook dla generowania notebooków
- `AUDIO_GENERATION_WEBHOOK_URL` - webhook dla audio
- `DOCUMENT_PROCESSING_WEBHOOK_URL` - webhook dla dokumentów
- `ADDITIONAL_SOURCES_WEBHOOK_URL` - webhook dla dodatkowych źródeł
- `NOTEBOOK_GENERATION_AUTH` - hasło Header Auth dla webhooków N8N
- `OPENAI_API_KEY` - używany w `generate-note-title`

## Kluczowe pliki

**Konfiguracja:**
- `vite.config.ts` - port 8080, aliasy `@/*`, code splitting (react-vendor, supabase-vendor, ui-vendor)
- `supabase/config.toml` - project_id, konfiguracja JWT dla Edge Functions
- `tsconfig.json` - relaksowane strict (`noImplicitAny: false`, `strictNullChecks: false`)

**Integracje:**
- `src/integrations/supabase/client.ts` - klient Supabase
- `src/integrations/supabase/types.ts` - typy TypeScript dla DB

**Hooks (src/hooks/):**
- Notebooks: `useNotebooks`, `useNotebookGeneration`, `useNotebookUpdate`, `useNotebookDelete`
- Sources: `useSources`, `useSourceUpdate`, `useSourceDelete`
- Chat: `useChatMessages`, `useAudioOverview`
- Documents: `useDocumentProcessing`, `useFileUpload`
- User: `useProfile`, `useAccountDelete`, `useNotes`
- UI: `use-mobile`, `useIsDesktop`

**i18n:**
- Pliki w `src/locales/{en,pl}/` (auth.json, common.json, dashboard.json, notebook.json, profile.json, errors.json, toasts.json)
- Formatowanie dat: `src/lib/i18n-dates.ts`

**Kluczowe zależności:**
- UI: Radix UI, Tailwind CSS, shadcn/ui
- State: React Query (@tanstack/react-query)
- i18n: i18next + react-i18next
- Routing: react-router-dom v6

## Edge Functions (supabase/functions/)

**Lista funkcji:**
1. `send-chat-message` - verify_jwt: **true**
2. `generate-notebook-content` - verify_jwt: **false**
3. `process-document` - verify_jwt: **false**
4. `process-document-callback` - verify_jwt: **false**
5. `process-additional-sources` - verify_jwt: **true**
6. `generate-audio-overview`
7. `generate-note-title`
8. `delete-user-account` - verify_jwt: **false**
9. `audio-generation-callback`
10. `refresh-audio-url`
11. `webhook-handler`

**Wdrożenie:**
```bash
supabase functions deploy <nazwa-funkcji>
```

## N8N Workflows

Workflow w katalogu `n8n/`:
- `InsightsLM___Chat` - czat z dokumentami
- `InsightsLM___Extract_Text` - ekstrakcja tekstu
- `InsightsLM___Generate_Notebook_Details` - generowanie szczegółów
- `InsightsLM___Podcast_Generation` - generowanie podcastów
- `InsightsLM___Process_Additional_Sources` - przetwarzanie źródeł
- `InsightsLM___Upsert_to_Vector_Store` - zapis do vector store
- `Import_Insights_LM_Workflows.json` - importer wszystkich workflow

**Uwaga:** Workflow są zależne od siebie. Wszystkie webhooki wymagają Header Auth z `NOTEBOOK_GENERATION_AUTH`.

## Nieoczekiwane zachowania

**Edge Functions:**
- Niektóre mają `verify_jwt = false` (np. `generate-notebook-content`, `process-document`)
- Secrets tylko w Dashboard, nie lokalnie → błędy 500/401 bez nich

**N8N:**
- Wszystkie webhooki wymagają Header Auth (`NOTEBOOK_GENERATION_AUTH`)
- URLs muszą być publicznie dostępne (HTTPS)

**TypeScript & Build:**
- Relaksowane strict: `noImplicitAny: false`, `strictNullChecks: false`
- Aliasy: `@/*` → `./src/*`
- Vite chunks: react-vendor, supabase-vendor, ui-vendor, query-vendor
- Zmienne: tylko prefix `VITE_` w frontendzie

**i18n:**
- Klucze muszą istnieć w en i pl

## Struktura projektu

```
src/
├── components/     # auth/, chat/, dashboard/, notebook/, profile/, ui/
├── contexts/       # AuthContext.tsx
├── hooks/          # Custom hooks (useNotebooks, useChatMessages, etc.)
├── pages/          # Dashboard, Notebook, Auth, Profile, NotFound
├── integrations/   # supabase/client.ts, supabase/types.ts
├── lib/            # utils.ts (cn), i18n-dates.ts
├── locales/        # en/, pl/ (JSON files)
└── services/       # authService.ts

supabase/
├── functions/      # Edge Functions
├── migrations/     # SQL migrations
└── config.toml     # Supabase config
```

## Ważne szczegóły

- **N8N License:** Sustainable Use License - uwaga na komercyjne użycie!
- **Port dev server:** 8080 (nie domyślny 5173)
- **Code splitting:** Manual chunks w `vite.config.ts` dla optymalizacji
- **React Query:** Używany do zarządzania stanem serwera, cache automatyczny

## Funkcjonalności tymczasowo ukryte

**Audio Overview (Studio):**
- Status: Ukryte w wersji produkcyjnej
- Plik: `src/components/notebook/StudioSidebar.tsx`
- Feature flag: `ENABLE_AUDIO_OVERVIEW = false` (linia 24)
- Backend: Edge Functions `generate-audio-overview`, `audio-generation-callback`, `refresh-audio-url` + N8N workflow `InsightsLM___Podcast_Generation`
- Jak włączyć: Zmień `ENABLE_AUDIO_OVERVIEW` na `true` w `StudioSidebar.tsx`
- Planowane uruchomienie: Kolejne wersje aplikacji

## Ostatnie zmiany i poprawki (2026-01-07)

### Naprawienie wykrywania surowych cytowań w czacie

**Problem:** AI czasami nie przestrzegał Structured Output i zwracał surowy JSON z chunk info w tekście odpowiedzi zamiast właściwej struktury cytowań.

**Rozwiązanie zaimplementowane w `src/hooks/useChatMessages.tsx`:**

1. **Nowe funkcje narzędziowe** (linie 43-168):
   - `detectRawCitations()` - wykrywa surowy JSON w tekście (formaty `{...}` i `[...]`)
   - `parseRawCitation()` - parsuje JSON z fallback na regex dla malformed JSON
   - `cleanAndExtractCitations()` - czyści tekst i tworzy Citation objects

2. **Modyfikacje `transformMessage()`**:
   - **Blok success (linie 197-236)**: Merge'uje explicit i extracted citations
   - **Blok catch/fallback (linie 260-291)**: Próbuje wyciągnąć citations przed plain text

3. **Nowe typy w `src/types/message.ts`** (linie 33-50):
   - `RawCitationMatch` - do wykrywania
   - `ParsedRawCitation` - do przechowywania danych
   - `CleanedTextResult` - do zwracania wyniku

**Efekt:**
- Surowy JSON typu `{"chunk_index":2, ...}` jest automatycznie konwertowany na klikalne przyciski cytowań [1], [2], [3]
- Backward compatible - stare wiadomości działają bez zmian
- Obsługa malformed JSON przez regex fallback

### Zmiana stylu przycisku "Dodaj do notatek"

**Zmiany w `src/components/notebook/SaveToNoteButton.tsx` (linia 70-75):**
- Zmiana wariantu z `ghost` na `outline`
- Dodanie obramowania: `border-gray-300`
- Styl hover: `hover:bg-gray-50 hover:border-gray-400`

**Zmiany w tłumaczeniach:**
- PL (`src/locales/pl/notebook.json`): "Dodaj do notatek" (zamiast "Zapisz do notatek")
- EN (`src/locales/en/notebook.json`): "Add to notes" (zamiast "Save to Note")

### Znane problemy

**Problem z cache'owaniem tłumaczeń i18next:**
- Tłumaczenia są importowane **statycznie** w `src/i18n/config.ts` (linie 6-20)
- Vite HMR nie odświeża automatycznie zmienionych plików JSON
- **Workaround**:
  - Dodanie komentarza do `config.ts` wymusza rebuild (linia 6)
  - Alternatywnie: `rm -rf node_modules/.vite && npm run dev`
  - Lub hard refresh przeglądarki: `Ctrl + Shift + R`
  - localStorage może cache'ować tłumaczenia (klucz `i18nextLng`)
