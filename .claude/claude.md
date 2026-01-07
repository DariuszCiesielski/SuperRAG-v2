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
