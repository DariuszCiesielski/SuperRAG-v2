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
5. `process-additional-sources` - verify_jwt: **false**
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

### Powiększenie logo i poprawa favicon (v1.7.21 - 2026-01-09)

**Zmiana:** Zwiększono rozmiary logo w aplikacji i naprawiono zniekształcony favicon.

**Pliki zmodyfikowane:**
- `src/components/ui/Logo.tsx` - zmieniono rozmiary z kwadratowych na proporcjonalne (h-6, h-10, h-16 z w-auto)
- `index.html` - favicon używa teraz `logo-icon.png` zamiast `logo.png`
- `public/logo.png` - zaktualizowany plik z lepszymi proporcjami (17KB)
- `public/logo-icon.png` - nowy plik dla faviconu (21KB)

**Efekt:**
- Logo w headerach jest teraz większe i czytelniejsze (md: 40px, lg: 64px wysokości)
- Favicon nie jest zniekształcony dzięki użyciu dedykowanej ikony
- Logo zachowuje naturalne proporcje (szerokość automatyczna)
- Social media preview używa pełnego logo

### Implementacja nowego logo i brandingu (v1.7.20 - 2026-01-09)

**Zmiana:** Dodano nowe logo marki "AI w BIZNESIE" i zaktualizowano branding aplikacji.

**Pliki zmodyfikowane:**
- `public/logo.png` - nowy plik logo (21KB)
- `src/components/ui/Logo.tsx` - zaktualizowano komponent do używania obrazu zamiast SVG
- `index.html` - dodano favicon i meta tagi OpenGraph/Twitter z logo
- `public/favicon.ico` - usunięto stary favicon

**Efekt:**
- Nowe profesjonalne logo "AI w BIZNESIE" widoczne w całej aplikacji
- Favicon w przeglądarce pokazuje nowe logo
- Meta tagi social media (OpenGraph/Twitter) używają nowego logo
- Komponent Logo jest prostszy i łatwiejszy w utrzymaniu

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

## Znane problemy

**Problem z cache'owaniem tłumaczeń i18next:**
- Tłumaczenia są importowane **statycznie** w `src/i18n/config.ts`
- Vite HMR nie odświeża automatycznie zmienionych plików JSON
- **Workaround**: `rm -rf node_modules/.vite && npm run dev` lub hard refresh `Ctrl + Shift + R`
