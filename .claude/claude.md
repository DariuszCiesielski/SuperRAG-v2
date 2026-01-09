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

## Deployment

**Frontend (Vercel):**
- Hosting: Vercel (połączony z GitHub repo)
- Auto-deploy: Każdy push do `main` triggeuruje automatyczny deploy
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Manual deploy: Vercel automatycznie deployuje lub trigger ręcznie w Vercel Dashboard

**Backend (Supabase Edge Functions):**
- Deploy pojedynczej funkcji: `supabase functions deploy <nazwa-funkcji> --project-ref sfqsuysimebkdeayxmmi`
- Deploy wszystkich: `supabase functions deploy --project-ref sfqsuysimebkdeayxmmi`
- Config w `supabase/config.toml` definiuje ustawienia JWT dla każdej funkcji

**Workflow deploymentu:**
1. Commit i push zmian do GitHub
2. Frontend: Vercel auto-deploy z `main` branch
3. Backend: Ręczny deploy Edge Functions przez Supabase CLI (jeśli zmiany w functions/)
4. Migracje DB: `supabase db push --project-ref sfqsuysimebkdeayxmmi` (jeśli zmiany w migrations/)

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

## Ostatnie zmiany i poprawki

### Usunięcie odniesień do Lovable (v1.7.19 - 2026-01-09)

**Zmiana:** Usunięto wszystkie odniesienia do Lovable z projektu.

**Pliki zmodyfikowane:**
- `index.html` - zmieniono autora na "SuperRAG", usunięto obrazy OpenGraph/Twitter lovable.dev, usunięto skrypt gptengineer.js
- `vite.config.ts` - usunięto import i użycie `lovable-tagger`
- `package.json` - usunięto `lovable-tagger` z devDependencies
- `package-lock.json` - zaktualizowany automatycznie (usunięto 9 pakietów)

**Efekt:**
- Aplikacja całkowicie niezależna od Lovable
- Czystsze meta tagi w HTML
- Mniejszy bundle (9 pakietów mniej)
- Uproszczona konfiguracja Vite

### Rozszerzenie uprawnień Claude Code dla deploymentu (v1.7.18 - 2026-01-09)

**Zmiana:** Dodano uprawnienie dla Claude Code do automatycznego deployowania Supabase Edge Functions.

**Plik zmodyfikowany:**
- `.claude/settings.local.json` - dodano `Bash(npx supabase functions deploy:*)` do listy `preApproved`

**Efekt:**
- Claude Code może teraz bezpośrednio deployować Edge Functions bez proszenia o pozwolenie
- Usprawnia workflow przy zmianach w Edge Functions
- Bezpieczne - ograniczone tylko do komendy `npx supabase functions deploy`

---

## Historia zmian (2026-01-07 - 2026-01-09)

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

### Naprawienie błędu 401 przy dodawaniu stron www (v1.7.1)

**Problem:** Edge Function `process-additional-sources` zwracał błąd 401 Unauthorized przy dodawaniu stron www.

**Przyczyna:**
- Funkcja miała `verify_jwt = true` w `supabase/config.toml`
- NIE wykorzystywała JWT wewnętrznie (nie odczytuje user_id)
- Frontend nie sprawdzał sesji przed wywołaniem
- Funkcja używa tylko env vars (`ADDITIONAL_SOURCES_WEBHOOK_URL`, `NOTEBOOK_GENERATION_AUTH`)

**Rozwiązanie:**
- Zmieniono `verify_jwt = true` → `verify_jwt = false` w `supabase/config.toml` (linia 63)
- Zdeployowano Edge Function do Supabase
- Funkcja teraz spójna z innymi webhook functions (`generate-notebook-content`, `process-document`)

**Pliki zmodyfikowane:**
- `supabase/config.toml` - zmiana konfiguracji JWT
- `.claude/settings.local.json` - dodano uprawnienia dla `supabase functions deploy`

### Naprawienie usuwania chunków przy usunięciu źródła (v1.7.2)

**Problem:** Po usunięciu źródła (strony www, PDF, etc.) chunki pozostawały w tabeli `documents` jako "zombie data".

**Przyczyna:**
- Hook `useSourceDelete` usuwał tylko:
  1. Plik ze storage
  2. Rekord z tabeli `sources`
- NIE usuwał powiązanych chunków z tabeli `documents`

**Rozwiązanie:**
- Dodano explicite usuwanie documents/chunks w `src/hooks/useSourceDelete.tsx` (linie 30-42)
- Chunki usuwane na podstawie `metadata->>'source_id'`
- Logowanie liczby usuniętych chunków w konsoli
- Nie blokuje usunięcia źródła jeśli czyszczenie chunków się nie powiedzie

**Kod:**
```typescript
const { error: documentsError, count: deletedCount } = await supabase
  .from('documents')
  .delete({ count: 'exact' })
  .filter('metadata->>source_id', 'eq', sourceId);
```

**Efekt:**
- Usunięcie źródła automatycznie czyści wszystkie powiązane chunki
- Działa dla wszystkich typów źródeł (PDF, websites, text, audio)
- Konsola pokazuje: `Successfully deleted X document chunks`

### Znane problemy

**Problem z cache'owaniem tłumaczeń i18next:**
- Tłumaczenia są importowane **statycznie** w `src/i18n/config.ts` (linie 6-20)
- Vite HMR nie odświeża automatycznie zmienionych plików JSON
- **Workaround**:
  - Dodanie komentarza do `config.ts` wymusza rebuild (linia 6)
  - Alternatywnie: `rm -rf node_modules/.vite && npm run dev`
  - Lub hard refresh przeglądarki: `Ctrl + Shift + R`
  - localStorage może cache'ować tłumaczenia (klucz `i18nextLng`)
