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
- `STRIPE_SECRET_KEY` - klucz API Stripe (sk_live_... lub sk_test_...)
- `STRIPE_WEBHOOK_SECRET` - secret do weryfikacji webhooków Stripe (whsec_...)

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
- Subscription: `useSubscription` - zarządzanie subskrypcjami Stripe (isPro, isFree, createCheckoutSession)
- UI: `use-mobile`, `useIsDesktop`

**i18n:**
- Pliki w `src/locales/{en,pl}/` (auth.json, common.json, dashboard.json, notebook.json, profile.json, errors.json, toasts.json, landing.json, pricing.json)
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
12. `create-checkout-session` - verify_jwt: **false** - tworzenie sesji płatności Stripe
13. `stripe-webhook` - verify_jwt: **false** - obsługa webhooków Stripe (aktualizacja subskrypcji)

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
├── hooks/          # Custom hooks (useNotebooks, useChatMessages, useSubscription, etc.)
├── pages/          # Dashboard, Notebook, Auth, Profile, Landing, Pricing, NotFound
├── integrations/   # supabase/client.ts, supabase/types.ts
├── lib/            # utils.ts (cn), i18n-dates.ts
├── locales/        # en/, pl/ (JSON files)
└── services/       # authService.ts

supabase/
├── functions/      # Edge Functions (w tym create-checkout-session, stripe-webhook)
├── migrations/     # SQL migrations (w tym tabela subscriptions)
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
- Feature flag: `ENABLE_AUDIO_OVERVIEW = false`
- Jak włączyć: Zmień `ENABLE_AUDIO_OVERVIEW` na `true`

## Znane problemy

**Problem z cache'owaniem tłumaczeń i18next:**
- Tłumaczenia są importowane **statycznie** w `src/i18n/config.ts`
- Vite HMR nie odświeża automatycznie zmienionych plików JSON
- **Workaround**: `rm -rf node_modules/.vite && npm run dev` lub hard refresh `Ctrl + Shift + R`

## System Płatności Stripe

### Przegląd
Projekt używa Stripe do obsługi subskrypcji. Dostępne są dwa plany:
- **Free** - darmowy, podstawowe funkcjonalności
- **Pro** - 1 PLN/miesiąc, priorytetowe wsparcie

### Konfiguracja Stripe

**Wymagane sekrety w Supabase:**
- `STRIPE_SECRET_KEY` - klucz API Stripe
- `STRIPE_WEBHOOK_SECRET` - secret do weryfikacji webhooków

**Price ID:**
- Pro plan: `price_1SqZvp9tEVOvn6llJo0AKA4o`

### Architektura

**Tabela bazy danych: `subscriptions`**
```sql
- id: uuid
- user_id: uuid (FK do auth.users)
- stripe_customer_id: text
- stripe_subscription_id: text
- plan_id: 'free' | 'pro'
- status: 'active' | 'canceled' | 'past_due' | 'trialing' | etc.
- current_period_start: timestamp
- current_period_end: timestamp
- cancel_at_period_end: boolean
- created_at, updated_at: timestamp
```

**Edge Functions:**
1. `create-checkout-session` - tworzy sesję płatności Stripe Checkout
2. `stripe-webhook` - obsługuje eventy z Stripe (checkout.session.completed, customer.subscription.updated, etc.)

**Hook: `useSubscription`**
- `subscription` - dane subskrypcji użytkownika
- `isPro` - czy użytkownik ma aktywny plan Pro
- `isFree` - czy użytkownik ma plan Free
- `createCheckoutSession(priceId)` - rozpoczyna proces płatności
- `isCreatingCheckout` - stan ładowania

### Flow płatności
1. Użytkownik klika "Upgrade to Pro" na stronie `/pricing` lub `/` (Landing)
2. `createCheckoutSession` wywołuje Edge Function `create-checkout-session`
3. Edge Function tworzy sesję Stripe Checkout i zwraca URL
4. Użytkownik jest przekierowywany do Stripe Checkout
5. Po płatności, Stripe wywołuje webhook `stripe-webhook`
6. Webhook aktualizuje tabelę `subscriptions`
7. Użytkownik jest przekierowywany do `/dashboard?subscription=success`

### Strony związane z płatnościami
- `/` - Landing page z sekcją pricing
- `/pricing` - Dedykowana strona z planami cenowymi
