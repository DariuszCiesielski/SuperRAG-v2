# Plan implementacji - Moduł Pomocy Prawnej (Fazy 2-6)

## Status projektu

**Branch:** `feature/legal-assistant`
**Ukończone:** Faza 1 (Fundament), Faza 2 (RAG prawny), Faza 3.1-3.3 (Biblioteka prawna), Faza 4 (Generator dokumentów), Faza 5 (Monetyzacja)
**W trakcie:** Faza 3.4-3.5 (Panel admin) - opcjonalnie
**Pozostało:** Faza 6 (Automatyzacja i polish)
**N8N:** Odłożone na koniec (wszystkie workflow N8N będą implementowane po zakończeniu UI)

---

## Faza 2: RAG prawny ✅ UKOŃCZONA

### Cel
Implementacja chatu AI z hybrydowym wyszukiwaniem w bazie prawnej i dokumentach użytkownika.

### Zadania

#### 2.1 Edge Function `legal-chat-message` ✅
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

#### 2.2 N8N Workflow `InsightsLM___Legal_Chat.json` 📋 (Przygotowane, wdrożenie na końcu)
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

#### 2.3 Hook `useLegalChat.tsx` ✅
**Plik:** `src/hooks/legal/useLegalChat.tsx`

```typescript
// Wrapper nad useUnifiedChat z obsługą:
// - Parametrów prawnych (categories, includeRegulations, etc.)
// - Backward compatibility dla SendLegalMessageParams
```

#### 2.4 Komponent `LegalChatArea.tsx` ✅
**Plik:** `src/components/legal/LegalChatArea.tsx`

Zaimplementowane:
- ✅ Checkboxy do wyboru źródeł (przepisy, orzeczenia, dokumenty)
- ✅ Renderowanie cytowań z linkami do artykułów
- ✅ Podgląd źródła po kliknięciu cytowania (rozwijane karty)
- ✅ Loading state z informacją "Przeszukuję przepisy..."
- ✅ Możliwość czyszczenia historii chatu

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

## Faza 3: Baza prawna i panel admin (częściowo ukończona)

### Cel
Panel administracyjny do zarządzania bazą przepisów + strona przeglądania bazy prawnej.

### Zadania

#### 3.1 Strona `/legal/library` ✅
**Plik:** `src/pages/LegalLibrary.tsx`

Zaimplementowane:
- ✅ Tabs: Przepisy | Orzecznictwa | Wzory pism
- ✅ Filtry: kategoria (multi-select)
- ✅ Wyszukiwarka (full-text)
- ✅ Lista wyników z podglądem w dialogu
- ✅ Paginacja

#### 3.2 Komponenty biblioteki ✅
**Pliki w `src/components/legal/LegalLibrary/`:**
- ✅ `LegalLibraryBrowser.tsx` - główny kontener z zakładkami
- ✅ `RegulationsTab.tsx` - lista przepisów z paginacją
- ✅ `RulingsTab.tsx` - lista orzeczeń z paginacją
- ✅ `TemplatesTab.tsx` - galeria szablonów (grid) z oznaczeniem Premium
- ✅ `LegalSearchBar.tsx` - wyszukiwarka z popover filtrów kategorii
- ✅ `RegulationViewer.tsx` - podgląd przepisu z artykułami (JSON)
- ✅ `index.ts` - eksporty

#### 3.3 Hook `useLegalLibrary.tsx` ✅
**Plik:** `src/hooks/legal/useLegalLibrary.tsx`

Zaimplementowane funkcje:
- ✅ `useRegulations(filters, page, pageSize)` - lista przepisów z paginacją
- ✅ `useRegulationById(id)` - pojedynczy przepis
- ✅ `useRulings(filters, page, pageSize)` - lista orzeczeń
- ✅ `useRulingById(id)` - pojedyncze orzeczenie
- ✅ `useTemplates(filters, page, pageSize)` - lista szablonów
- ✅ `useTemplateById(id)` - pojedynczy szablon
- ✅ `useIncrementTemplatePopularity()` - zwiększanie popularności

#### 3.8 Routing ✅
Dodano do `App.tsx`:
```tsx
<Route path="/legal/library" element={<ProtectedRoute><LegalLibrary /></ProtectedRoute>} />
```

#### 3.9 Tłumaczenia ✅ (częściowo)
Rozszerzono `legal.json` (PL i EN) o:
- ✅ `library.*` - teksty biblioteki (tabs, search, pagination)
- ✅ `library.regulations.*` - teksty przepisów
- ✅ `library.rulings.*` - teksty orzeczeń
- ✅ `library.templates.*` - teksty szablonów

#### 3.4 Strona `/legal/admin` ⏳ (opcjonalnie)
**Plik:** `src/pages/LegalAdmin.tsx`

Dostęp tylko dla użytkowników w `legal_admins`.

Tabs:
- Przepisy (CRUD)
- Orzecznictwa (CRUD)
- Szablony (CRUD)
- Import
- Statystyki

#### 3.5 Komponenty admin ⏳ (opcjonalnie)
**Pliki w `src/components/legal/admin/`:**
- `LegalAdminDashboard.tsx`
- `RegulationsManager.tsx` - tabela + formularz
- `RulingsManager.tsx`
- `TemplatesManager.tsx` - edytor z polami formularza
- `ImporterPanel.tsx` - import z ISAP
- `EmbeddingsManager.tsx` - regeneracja embeddingów

#### 3.6 Edge Function `import-legal-content` 📋 (odłożone - N8N na końcu)
**Plik:** `supabase/functions/import-legal-content/index.ts`

```typescript
// Obsługuje:
// - Import z ISAP API (https://api.sejm.gov.pl)
// - Web scraping orzeczenia.ms.gov.pl
// - Upload JSON/CSV
// - Generowanie embeddingów
```

#### 3.7 N8N Workflow `InsightsLM___Import_ISAP.json` 📋 (odłożone - N8N na końcu)
**Plik:** `n8n/InsightsLM___Import_ISAP.json`

Flow:
1. HTTP Request do ISAP API
2. Transform danych do formatu `legal_regulations`
3. Upsert do Supabase
4. Chunk tekst
5. Generuj embeddingi (OpenAI)
6. Upsert do `legal_documents_embeddings`
7. Log do `legal_import_logs`

---

## Faza 4: Generator dokumentów ✅ UKOŃCZONA

### Cel
Kreator pism prawnych z eksportem do .docx.

### Zadania

#### 4.1 Komponenty generatora ✅
**Pliki w `src/components/legal/DocumentGenerator/`:**
- ✅ `DocumentWizard.tsx` - główny kreator (stepper)
- ✅ `TemplateSelector.tsx` - wybór szablonu
- ✅ `FormFiller.tsx` - dynamiczny formularz z pól `template_fields`
- ✅ `DocumentPreview.tsx` - podgląd wygenerowanego pisma
- ✅ `DocumentExporter.tsx` - przyciski eksportu
- ✅ `index.ts` - eksporty

#### 4.2 Hook `useDocumentGenerator.tsx` ✅
**Plik:** `src/hooks/legal/useDocumentGenerator.tsx`

Zaimplementowane funkcje:
- ✅ `selectTemplate(template)` - wybór szablonu
- ✅ `updateFormField(name, value)` - aktualizacja pól formularza
- ✅ `generatePreview()` - generowanie podglądu
- ✅ `saveDocument(caseId?)` - zapisywanie dokumentu
- ✅ `exportToDocx()` - eksport do DOCX

#### 4.3 Edge Function `generate-legal-document` ✅
**Plik:** `supabase/functions/generate-legal-document/index.ts`

Zaimplementowane:
- ✅ Parsowanie treści dokumentu (nagłówki, wyrównanie, podpisy)
- ✅ Generowanie DOCX z biblioteką docx
- ✅ Upload do Supabase Storage
- ✅ Aktualizacja rekordu w bazie danych

#### 4.4 Storage bucket ✅
Bucket `generated-documents` już istnieje (z migracji).

#### 4.5 Hook `useLegalTemplates.tsx` ✅
**Plik:** `src/hooks/legal/useLegalTemplates.tsx`

Zaimplementowane funkcje:
- ✅ `getTemplates(filters, page, pageSize)` - lista szablonów
- ✅ `getTemplateById(id)` - pojedynczy szablon
- ✅ `incrementPopularity` - zwiększanie popularności
- ✅ `useGeneratedDocuments(caseId?)` - lista wygenerowanych dokumentów
- ✅ `useDeleteGeneratedDocument()` - usuwanie dokumentu

#### 4.6 Widok wygenerowanych dokumentów ✅
**Plik:** `src/components/legal/GeneratedDocumentsList.tsx`

Zaimplementowane:
- ✅ Lista dokumentów z podglądem
- ✅ Dialog podglądu treści
- ✅ Pobieranie pliku DOCX
- ✅ Usuwanie dokumentu z potwierdzeniem
- ✅ Zakładka "Pisma" w LegalCase.tsx

#### 4.7 Tłumaczenia ✅
Rozszerzono `legal.json` (PL i EN) o:
- ✅ `generator.steps.*` - kroki kreatora
- ✅ `generator.selectTemplate*` - wybór szablonu
- ✅ `generator.requiredFields*` - pola formularza
- ✅ `generator.preview*` - podgląd
- ✅ `generator.export*` - eksport
- ✅ `generator.delete*` - usuwanie

#### 4.8 Routing ✅
Dodano trasę `/legal/generator` w `App.tsx`

---

## Faza 5: Monetyzacja ✅ UKOŃCZONA

### Cel
Integracja z Stripe dla planów prawnych (Free/Pro Legal).

### Zadania

#### 5.1 Stripe - nowe produkty ⏳
W Stripe Dashboard utworzyć:
- Produkt: "Legal Assistant Pro"
- Price: 29.99 PLN/miesiąc (recurring)
- Zapisać `price_id` i zaktualizować stałą `STRIPE_PRICE_ID_LEGAL_PRO` w `useLegalSubscription.tsx`

#### 5.2 Hook `useLegalSubscription.tsx` ✅
**Plik:** `src/hooks/legal/useLegalSubscription.tsx`

Zaimplementowane:
- ✅ Pobieranie limitów z funkcji SQL `check_legal_limits`
- ✅ Flagi: `canCreateCase`, `canGenerateDocument`, `canExportDocx`, `fullRagAccess`
- ✅ Liczniki: `casesCount`, `casesLimit`, `documentsThisMonth`, `documentsLimit`
- ✅ Mutacja `createLegalCheckout(priceId)` do tworzenia sesji Stripe
- ✅ Hook pomocniczy `useLegalLimitsDisplay()` do wyświetlania

#### 5.3 Edge Function `legal-checkout-session` ✅
**Plik:** `supabase/functions/legal-checkout-session/index.ts`

Zaimplementowane:
- ✅ Weryfikacja JWT i pobieranie użytkownika
- ✅ Tworzenie/pobieranie Stripe Customer
- ✅ Tworzenie sesji checkout z metadata `{ product: 'legal_assistant', plan_type }`
- ✅ Success URL: `/legal?subscription=success`

#### 5.4 Rozszerzenie `stripe-webhook` o obsługę Legal ✅
**Plik:** `supabase/functions/stripe-webhook/index.ts`

Zaimplementowane:
- ✅ Funkcja `isLegalProduct()` do rozpoznawania subskrypcji Legal
- ✅ Obsługa `checkout.session.completed` - aktualizacja `legal_plan_id`, `legal_cases_limit`, `legal_documents_limit`
- ✅ Obsługa `customer.subscription.updated` - aktualizacja statusu
- ✅ Obsługa `customer.subscription.deleted` - powrót do planu free
- ✅ Obsługa `invoice.payment_failed`

#### 5.5 Komponenty paywall ✅
**Pliki:**
- ✅ `LegalUpgradeDialog.tsx` - dialog zachęcający do upgrade z wyświetlaniem limitów
- ✅ `LegalPricingCard.tsx` - karty planów (Free, Pro Legal, Business Legal)
- ✅ `LegalPricingBanner` - baner do embedowania na stronach

#### 5.6 Sprawdzanie limitów w UI ✅
Dodane sprawdzanie limitów:
- ✅ `CreateCaseDialog` - sprawdzanie `canCreateCase`, wyświetlanie postępu i dialog upgrade
- ✅ `DocumentWizard` - sprawdzanie `canGenerateDocument` i `canExportDocx`

#### 5.7 Strona pricing ✅
- ✅ Dodano sekcję "Asystent Prawny" z `LegalPricingCards` do `Pricing.tsx`

#### 5.8 Tłumaczenia ✅
- ✅ Dodano `subscription.*` i `pricing.*` do `legal.json` (PL i EN)

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
Faza 2 (RAG) ✅ UKOŃCZONA ─────────────────────────────────┐
  │                                                         │
  ├─ ✅ 2.1 Edge Function legal-chat-message                │
  ├─ 📋 2.2 N8N Workflow Legal_Chat (odłożone)              │
  ├─ ✅ 2.3 Hook useLegalChat                               │
  ├─ ✅ 2.4 Rozbudowa LegalChatArea                         │
  └─ ⏳ 2.5-2.6 Konfiguracja + przykładowe dane             │
                                                            │
Faza 3 (Baza prawna) ✅ CZĘŚCIOWO ─────────────────────────┤
  │                                                         │
  ├─ ✅ 3.1 Strona LegalLibrary                             │
  ├─ ✅ 3.2-3.3 Komponenty + hook                           │
  ├─ ⏳ 3.4-3.5 Panel admin (opcjonalnie)                   │
  └─ 📋 3.6-3.7 Import z ISAP (odłożone)                    │
                                                            │
Faza 4 (Generator) ✅ UKOŃCZONA ───────────────────────────┤
  │                                                         │
  ├─ ✅ 4.1-4.2 Komponenty + hooki                          │
  ├─ ✅ 4.3 Edge Function generate-legal-document           │
  └─ ✅ 4.4-4.8 Storage + UI + tłumaczenia + routing        │
                                                            │
Faza 5 (Monetyzacja) ──────────────────────────────────────┤
  │                                                         │
  ├─ ⏳ 5.1 Stripe produkty                                 │
  ├─ ⏳ 5.2-5.4 Hooki + Edge Functions                      │
  └─ ⏳ 5.5-5.7 UI paywall                                  │
                                                            │
Faza 6 (Polish + N8N) ─────────────────────────────────────┘
  │
  ├─ 📋 6.1 Auto-import ISAP (N8N)
  ├─ ⏳ 6.2 Responsywność
  ├─ ⏳ 6.3 Testy E2E
  ├─ ⏳ 6.4-6.6 Error handling + optymalizacja
  └─ 📋 Wszystkie workflow N8N (Legal_Chat, Import_ISAP)
```

**Legenda:**
- ✅ Ukończone
- ⏳ Do zrobienia
- 📋 Odłożone (N8N na końcu)

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

---

## Utworzone pliki (Faza 2 + 3.1-3.3)

### Faza 2 - RAG prawny
| Plik | Opis |
|------|------|
| `supabase/functions/legal-chat-message/index.ts` | Edge Function do wysyłania wiadomości do N8N |
| `src/hooks/legal/useLegalChat.tsx` | Hook do obsługi chatu prawnego |
| `src/components/legal/LegalChatArea.tsx` | Komponent obszaru czatu z cytowaniami |

### Faza 3.1-3.3 - Biblioteka prawna
| Plik | Opis |
|------|------|
| `src/pages/LegalLibrary.tsx` | Strona biblioteki prawnej `/legal/library` |
| `src/hooks/legal/useLegalLibrary.tsx` | Hook z funkcjami useRegulations, useRulings, useTemplates |
| `src/components/legal/LegalLibrary/LegalLibraryBrowser.tsx` | Główny kontener z zakładkami |
| `src/components/legal/LegalLibrary/LegalSearchBar.tsx` | Wyszukiwarka z filtrami kategorii |
| `src/components/legal/LegalLibrary/RegulationsTab.tsx` | Lista przepisów z paginacją |
| `src/components/legal/LegalLibrary/RulingsTab.tsx` | Lista orzeczeń z paginacją |
| `src/components/legal/LegalLibrary/TemplatesTab.tsx` | Galeria szablonów pism |
| `src/components/legal/LegalLibrary/RegulationViewer.tsx` | Podgląd przepisu z artykułami |
| `src/components/legal/LegalLibrary/index.ts` | Eksporty komponentów |

### Zmodyfikowane pliki (Faza 3)
| Plik | Zmiana |
|------|--------|
| `src/App.tsx` | Dodana trasa `/legal/library` |
| `src/locales/pl/legal.json` | Dodane tłumaczenia `library.*` |
| `src/locales/en/legal.json` | Dodane tłumaczenia angielskie |

### Faza 4 - Generator dokumentów
| Plik | Opis |
|------|------|
| `src/components/legal/DocumentGenerator/index.ts` | Eksporty komponentów generatora |
| `src/components/legal/DocumentGenerator/DocumentWizard.tsx` | Główny kreator ze stepper'em |
| `src/components/legal/DocumentGenerator/TemplateSelector.tsx` | Wybór szablonu dokumentu |
| `src/components/legal/DocumentGenerator/FormFiller.tsx` | Dynamiczny formularz z polami szablonu |
| `src/components/legal/DocumentGenerator/DocumentPreview.tsx` | Podgląd wygenerowanego dokumentu |
| `src/components/legal/DocumentGenerator/DocumentExporter.tsx` | Opcje eksportu (DOCX, druk, kopiowanie) |
| `src/components/legal/GeneratedDocumentsList.tsx` | Lista wygenerowanych dokumentów w sprawie |
| `src/hooks/legal/useDocumentGenerator.tsx` | Hook do zarządzania procesem generowania |
| `src/hooks/legal/useLegalTemplates.tsx` | Hook do obsługi szablonów i wygenerowanych dokumentów |
| `src/pages/LegalDocumentGenerator.tsx` | Strona generatora `/legal/generator` |
| `supabase/functions/generate-legal-document/index.ts` | Edge Function do generowania DOCX |

### Zmodyfikowane pliki (Faza 4)
| Plik | Zmiana |
|------|--------|
| `src/App.tsx` | Dodana trasa `/legal/generator` |
| `src/pages/LegalCase.tsx` | Dodana zakładka "Pisma" z GeneratedDocumentsList |
| `src/locales/pl/legal.json` | Dodane tłumaczenia `generator.*` |
| `src/locales/en/legal.json` | Dodane tłumaczenia angielskie dla generatora |

### Faza 5 - Monetyzacja
| Plik | Opis |
|------|------|
| `src/hooks/legal/useLegalSubscription.tsx` | Hook do obsługi subskrypcji i limitów Legal |
| `src/components/legal/LegalUpgradeDialog.tsx` | Dialog zachęcający do upgrade z wyświetlaniem limitów |
| `src/components/legal/LegalPricingCard.tsx` | Karty planów + banner do embedowania |
| `supabase/functions/legal-checkout-session/index.ts` | Edge Function do tworzenia sesji checkout Stripe |

### Zmodyfikowane pliki (Faza 5)
| Plik | Zmiana |
|------|--------|
| `supabase/functions/stripe-webhook/index.ts` | Dodana obsługa subskrypcji Legal (isLegalProduct, getLegalPlanType) |
| `src/components/legal/CreateCaseDialog.tsx` | Sprawdzanie limitu spraw, wyświetlanie postępu, dialog upgrade |
| `src/components/legal/DocumentGenerator/DocumentWizard.tsx` | Sprawdzanie limitów dokumentów i eksportu DOCX |
| `src/pages/Pricing.tsx` | Dodana sekcja "Asystent Prawny" z LegalPricingCards |
| `src/locales/pl/legal.json` | Dodane tłumaczenia `subscription.*`, `pricing.*` |
| `src/locales/en/legal.json` | Dodane tłumaczenia angielskie dla monetyzacji |
| `supabase/config.toml` | Dodana konfiguracja `legal-checkout-session`|
