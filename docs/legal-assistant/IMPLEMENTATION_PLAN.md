# Plan implementacji - Moduł Pomocy Prawnej (Fazy 2-6)

## Status projektu

**Branch:** `feature/legal-assistant`
**Ukończone:** Faza 1 (Fundament)
**Pozostało:** Fazy 2-6

---

## Faza 2: RAG prawny

### Cel
Implementacja chatu AI z hybrydowym wyszukiwaniem w bazie prawnej i dokumentach użytkownika.

### Zadania

#### 2.1 Edge Function `legal-chat-message`
**Plik:** `supabase/functions/legal-chat-message/index.ts`

```typescript
// Wzoruj się na: supabase/functions/send-chat-message/index.ts
// Różnice:
// - Wysyła do innego webhook N8N (LEGAL_CHAT_WEBHOOK_URL)
// - Przekazuje case_id i kategorie prawne
// - Obsługuje cytowania artykułów prawa
```

**Parametry wejściowe:**
```json
{
  "session_id": "case_id",
  "message": "treść pytania",
  "user_id": "uuid",
  "case_id": "uuid",
  "categories": ["cywilne"],
  "include_regulations": true,
  "include_rulings": true,
  "include_case_docs": true
}
```

#### 2.2 N8N Workflow `InsightsLM___Legal_Chat.json`
**Plik:** `n8n/InsightsLM___Legal_Chat.json`

**Flow:**
1. Webhook trigger
2. Embed pytania (OpenAI Embeddings)
3. Wywołaj funkcję SQL `hybrid_legal_search` via Supabase
4. Zbuduj prompt z kontekstem:
   - Przepisy prawne z cytowaniami (artykuły, paragrafy)
   - Orzeczenia z sygnaturami
   - Dokumenty użytkownika
5. Wywołaj LLM (OpenAI/Gemini) z system prompt dla prawnika
6. Parsuj cytowania (JSON mode)
7. Zapisz do `legal_chat_histories`
8. Zwróć odpowiedź

**System prompt:**
```
Jesteś asystentem prawnym pomagającym osobom w sprawach prawnych.
Odpowiadaj na podstawie polskiego prawa.
Zawsze cytuj konkretne artykuły i paragrafy przepisów.
Format cytowania: [Art. X § Y KC] lub [Wyrok SN z dnia... sygn. ...]
Jeśli nie jesteś pewien, poinformuj użytkownika.
NIE udzielaj porad prawnych - jedynie informuj o przepisach.
```

#### 2.3 Hook `useLegalChat.tsx`
**Plik:** `src/hooks/legal/useLegalChat.tsx`

```typescript
// Wzoruj się na: src/hooks/useChatMessages.tsx
// Różnice:
// - Wywołuje legal-chat-message zamiast send-chat-message
// - Parsuje cytowania prawne (LegalCitation)
// - Subskrypcja na legal_chat_histories
```

#### 2.4 Komponent `LegalChatArea.tsx`
**Plik:** `src/components/legal/LegalChatArea.tsx` (rozbudowa istniejącego)

Dodać:
- Checkboxy do wyboru źródeł (przepisy, orzeczenia, dokumenty)
- Renderowanie cytowań z linkami do artykułów
- Podgląd źródła po kliknięciu cytowania
- Loading state z informacją "Przeszukuję przepisy..."

#### 2.5 Konfiguracja Supabase
**Plik:** `supabase/config.toml`

Dodać:
```toml
[functions.legal-chat-message]
verify_jwt = true
```

**Sekrety (Supabase Dashboard):**
- `LEGAL_CHAT_WEBHOOK_URL` - URL webhook N8N

#### 2.6 Import przykładowych przepisów
Utworzyć skrypt lub N8N workflow do importu przykładowych danych:
- 5-10 artykułów z Kodeksu Cywilnego
- 3-5 orzeczeń SN
- Wygenerować embeddingi

---

## Faza 3: Baza prawna i panel admin

### Cel
Panel administracyjny do zarządzania bazą przepisów + strona przeglądania bazy prawnej.

### Zadania

#### 3.1 Strona `/legal/library`
**Plik:** `src/pages/LegalLibrary.tsx`

Layout:
- Tabs: Przepisy | Orzecznictwa | Wzory pism
- Filtry: kategoria, typ dokumentu, data
- Wyszukiwarka (full-text + semantic)
- Lista wyników z podglądem

#### 3.2 Komponenty biblioteki
**Pliki w `src/components/legal/LegalLibrary/`:**
- `LegalLibraryBrowser.tsx` - główny kontener
- `RegulationsTab.tsx` - lista przepisów
- `RulingsTab.tsx` - lista orzeczeń
- `TemplatesTab.tsx` - galeria wzorów
- `LegalSearchBar.tsx` - wyszukiwarka
- `RegulationViewer.tsx` - podgląd przepisu z artykułami

#### 3.3 Hook `useLegalLibrary.tsx`
**Plik:** `src/hooks/legal/useLegalLibrary.tsx`

```typescript
// Funkcje:
// - searchRegulations(query, filters)
// - searchRulings(query, filters)
// - getTemplates(category, isPremium)
// - getRegulationById(id)
// - getRulingById(id)
```

#### 3.4 Strona `/legal/admin`
**Plik:** `src/pages/LegalAdmin.tsx`

Dostęp tylko dla użytkowników w `legal_admins`.

Tabs:
- Przepisy (CRUD)
- Orzecznictwa (CRUD)
- Szablony (CRUD)
- Import
- Statystyki

#### 3.5 Komponenty admin
**Pliki w `src/components/legal/admin/`:**
- `LegalAdminDashboard.tsx`
- `RegulationsManager.tsx` - tabela + formularz
- `RulingsManager.tsx`
- `TemplatesManager.tsx` - edytor z polami formularza
- `ImporterPanel.tsx` - import z ISAP
- `EmbeddingsManager.tsx` - regeneracja embeddingów

#### 3.6 Edge Function `import-legal-content`
**Plik:** `supabase/functions/import-legal-content/index.ts`

```typescript
// Obsługuje:
// - Import z ISAP API (https://api.sejm.gov.pl)
// - Web scraping orzeczenia.ms.gov.pl
// - Upload JSON/CSV
// - Generowanie embeddingów
```

#### 3.7 N8N Workflow `InsightsLM___Import_ISAP.json`
**Plik:** `n8n/InsightsLM___Import_ISAP.json`

Flow:
1. HTTP Request do ISAP API
2. Transform danych do formatu `legal_regulations`
3. Upsert do Supabase
4. Chunk tekst
5. Generuj embeddingi (OpenAI)
6. Upsert do `legal_documents_embeddings`
7. Log do `legal_import_logs`

#### 3.8 Routing
Dodać do `App.tsx`:
```tsx
<Route path="/legal/library" element={<ProtectedRoute><LegalLibrary /></ProtectedRoute>} />
<Route path="/legal/admin" element={<ProtectedRoute><LegalAdmin /></ProtectedRoute>} />
```

#### 3.9 Tłumaczenia
Rozszerzyć `legal.json` o:
- `library.*` - teksty biblioteki
- `admin.*` - teksty panelu admin

---

## Faza 4: Generator dokumentów

### Cel
Kreator pism prawnych z eksportem do .docx.

### Zadania

#### 4.1 Komponenty generatora
**Pliki w `src/components/legal/DocumentGenerator/`:**
- `DocumentWizard.tsx` - główny kreator (stepper)
- `TemplateSelector.tsx` - wybór szablonu
- `FormFiller.tsx` - dynamiczny formularz z pól `template_fields`
- `DocumentPreview.tsx` - podgląd wygenerowanego pisma
- `DocumentExporter.tsx` - przyciski eksportu

#### 4.2 Hook `useDocumentGenerator.tsx`
**Plik:** `src/hooks/legal/useDocumentGenerator.tsx`

```typescript
interface UseDocumentGenerator {
  templates: LegalTemplate[];
  selectedTemplate: LegalTemplate | null;
  formData: Record<string, any>;
  generatedContent: string;

  selectTemplate(id: string): void;
  updateFormField(name: string, value: any): void;
  generatePreview(): Promise<string>;
  exportToDocx(): Promise<string>; // returns download URL
  saveDocument(caseId?: string): Promise<GeneratedLegalDocument>;
}
```

#### 4.3 Edge Function `generate-legal-document`
**Plik:** `supabase/functions/generate-legal-document/index.ts`

```typescript
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';

// 1. Pobierz szablon z DB
// 2. Zamień placeholdery {{field}} na wartości
// 3. Parsuj markdown na strukturę docx
// 4. Zastosuj formatowanie prawnicze:
//    - Nagłówek z datą i miejscowością (wyrównanie prawe)
//    - Numeracja paragrafów
//    - Stopka z numerem strony
//    - Podpisy stron
// 5. Packer.toBlob() → upload do storage
// 6. Zapisz rekord w generated_legal_documents
// 7. Zwróć URL do pobrania
```

**Zależności (deno):**
```typescript
import { Document, Packer, Paragraph } from "https://esm.sh/docx@8.5.0";
```

#### 4.4 Storage bucket
Bucket `generated-documents` już istnieje (z migracji).

Struktura plików:
```
generated-documents/
└── {user_id}/
    └── {document_id}.docx
```

#### 4.5 Hook `useLegalTemplates.tsx`
**Plik:** `src/hooks/legal/useLegalTemplates.tsx`

```typescript
// Pobieranie szablonów z filtrowaniem
// - getTemplates(category?, isPremium?)
// - getTemplateById(id)
// - incrementPopularity(id)
```

#### 4.6 Widok wygenerowanych dokumentów
Dodać do `LegalCase.tsx` panel z historią wygenerowanych pism:
- Lista dokumentów
- Podgląd
- Ponowne pobranie
- Edycja (nowa wersja)

#### 4.7 Tłumaczenia
Rozszerzyć `legal.json` o:
- `generator.*` - teksty kreatora
- `templates.*` - opisy szablonów

---

## Faza 5: Monetyzacja

### Cel
Integracja z Stripe dla planów prawnych (Free/Pro Legal).

### Zadania

#### 5.1 Stripe - nowe produkty
W Stripe Dashboard utworzyć:
- Produkt: "Legal Assistant Pro"
- Price: 29.99 PLN/miesiąc (recurring)
- Zapisać `price_id`

#### 5.2 Hook `useLegalSubscription.tsx`
**Plik:** `src/hooks/legal/useLegalSubscription.tsx`

```typescript
// Rozszerzenie useSubscription o:
// - legalPlan: 'free' | 'pro_legal'
// - legalLimits: UserLegalLimits (z check_legal_limits)
// - canCreateCase: boolean
// - canGenerateDocument: boolean
// - canExportDocx: boolean
// - createLegalCheckout(priceId): Promise<string>
```

#### 5.3 Edge Function `legal-checkout-session`
**Plik:** `supabase/functions/legal-checkout-session/index.ts`

```typescript
// Podobne do create-checkout-session
// Różnice:
// - Obsługuje price_id dla pro_legal
// - Success URL: /legal?subscription=success
// - Metadata: { product: 'legal_assistant' }
```

#### 5.4 Edge Function `legal-stripe-webhook`
**Plik:** `supabase/functions/legal-stripe-webhook/index.ts`

```typescript
// Obsługa eventów:
// - checkout.session.completed → update subscriptions.legal_plan_id
// - customer.subscription.updated
// - customer.subscription.deleted → reset to 'free'
// - invoice.payment_failed
```

#### 5.5 Komponenty paywall
**Pliki:**
- `LegalUpgradeDialog.tsx` - dialog zachęcający do upgrade
- `LegalPricingCard.tsx` - karta planu na stronie pricing

#### 5.6 Sprawdzanie limitów w UI
Dodać sprawdzanie limitów przed:
- Tworzeniem nowej sprawy (`CreateCaseDialog`)
- Generowaniem dokumentu (`DocumentWizard`)
- Eksportem do .docx

```tsx
const { canCreateCase, legalLimits } = useLegalSubscription();

if (!canCreateCase) {
  return <LegalUpgradeDialog reason="cases_limit" />;
}
```

#### 5.7 Strona pricing
Dodać do `Pricing.tsx` sekcję z planami Legal Assistant.

---

## Faza 6: Automatyzacja i polish

### Cel
Automatyczny import danych, testy, responsywność.

### Zadania

#### 6.1 Automatyczny import ISAP
N8N Workflow z Schedule Trigger:
- Codziennie o 3:00
- Sprawdź nowe akty prawne
- Import + embeddingi

#### 6.2 Responsywność mobile
Przejrzeć i poprawić:
- `Legal.tsx` - mobile grid
- `LegalCase.tsx` - mobile tabs (już zaimplementowane)
- `LegalLibrary.tsx` - mobile filters

#### 6.3 Testy E2E
**Plik:** `tests/legal/` (Playwright lub Cypress)

Scenariusze:
1. Tworzenie sprawy
2. Dodawanie etapu postępowania
3. Chat z AI
4. Generowanie pisma
5. Upgrade do Pro

#### 6.4 Error boundaries
Dodać obsługę błędów:
- `LegalErrorBoundary.tsx`
- Fallback UI dla błędów ładowania

#### 6.5 Optymalizacja
- Code splitting dla komponentów legal
- Lazy loading stron
- Optymalizacja zapytań (React Query)

#### 6.6 Monitoring
- Dodać logi do Edge Functions
- Alerty na błędy (Sentry lub podobne)

---

## Sekwencja realizacji

```
Faza 2 (RAG) ──────────────────────────────────────────────┐
  │                                                         │
  ├─ 2.1 Edge Function legal-chat-message                   │
  ├─ 2.2 N8N Workflow Legal_Chat                            │
  ├─ 2.3 Hook useLegalChat                                  │
  ├─ 2.4 Rozbudowa LegalChatArea                            │
  └─ 2.5-2.6 Konfiguracja + przykładowe dane                │
                                                            │
Faza 3 (Baza prawna) ──────────────────────────────────────┤
  │                                                         │
  ├─ 3.1 Strona LegalLibrary                                │
  ├─ 3.2-3.3 Komponenty + hook                              │
  ├─ 3.4-3.5 Panel admin                                    │
  └─ 3.6-3.7 Import z ISAP                                  │
                                                            │
Faza 4 (Generator) ────────────────────────────────────────┤
  │                                                         │
  ├─ 4.1-4.2 Komponenty + hook                              │
  ├─ 4.3 Edge Function generate-legal-document              │
  └─ 4.4-4.7 Storage + UI + tłumaczenia                     │
                                                            │
Faza 5 (Monetyzacja) ──────────────────────────────────────┤
  │                                                         │
  ├─ 5.1 Stripe produkty                                    │
  ├─ 5.2-5.4 Hooki + Edge Functions                         │
  └─ 5.5-5.7 UI paywall                                     │
                                                            │
Faza 6 (Polish) ───────────────────────────────────────────┘
  │
  ├─ 6.1 Auto-import ISAP
  ├─ 6.2 Responsywność
  ├─ 6.3 Testy E2E
  └─ 6.4-6.6 Error handling + optymalizacja
```

---

## Checklist dla agenta

Przed rozpoczęciem każdej fazy:
- [ ] Przeczytaj istniejący kod (hooki, komponenty, Edge Functions)
- [ ] Sprawdź typy w `src/types/legal.ts`
- [ ] Sprawdź tłumaczenia w `src/locales/*/legal.json`
- [ ] Upewnij się, że branch to `feature/legal-assistant`

Po zakończeniu każdej fazy:
- [ ] Uruchom `npm run build` (sprawdź błędy TypeScript)
- [ ] Przetestuj ręcznie w przeglądarce
- [ ] Dodaj tłumaczenia dla nowych tekstów
- [ ] Commit z konwencją: `feat(legal): opis zmian`

---

## Zmienne środowiskowe do dodania

```env
# Supabase Secrets (Dashboard → Edge Functions → Secrets)
LEGAL_CHAT_WEBHOOK_URL=https://n8n.example.com/webhook/legal-chat
STRIPE_LEGAL_PRICE_ID=price_xxx
```

---

## Pliki wzorcowe

| Nowy plik | Wzorzec |
|-----------|---------|
| `legal-chat-message` | `send-chat-message` |
| `useLegalChat` | `useChatMessages` |
| `useLegalSubscription` | `useSubscription` |
| `legal-checkout-session` | `create-checkout-session` |
| `Legal_Chat.json` (N8N) | `InsightsLM___Chat.json` |
