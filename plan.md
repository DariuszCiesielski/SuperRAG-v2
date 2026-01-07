# Plan Działania - InsightsLM v2

## 1. Przegląd Projektu

**InsightsLM** to open-source'owa alternatywa dla NotebookLM - narzędzie AI do badań, które bazuje wyłącznie na źródłach dostarczonych przez użytkownika.

### Technologie:
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend:** Supabase (baza danych, autentykacja, storage)
- **Automatyzacja:** N8N (workflow automation)
- **AI:** OpenAI, Gemini

---

## 2. Konfiguracja Środowiska

### 2.1. Wymagania Wstępne
- [ ] Konto na Supabase
- [ ] Konto na GitHub
- [ ] Konto na N8N (workflow już skonfigurowane)
- [ ] Klucze API: OpenAI, Gemini

### 2.2. Instalacja Lokalna
- [ ] Sklonować repozytorium
- [ ] Zainstalować zależności: `npm install`
- [ ] Skonfigurować zmienne środowiskowe
- [ ] Uruchomić projekt lokalnie: `npm run dev`

### 2.3. Konfiguracja Supabase
- [ ] Utworzyć projekt w Supabase
- [ ] Zapisać hasło bazy danych
- [ ] Uruchomić migracje bazy danych
- [ ] Skonfigurować Edge Functions
- [ ] Dodać sekrety do Supabase:
  - `NOTEBOOK_CHAT_URL`
  - `NOTEBOOK_GENERATION_URL`
  - `AUDIO_GENERATION_WEBHOOK_URL`
  - `DOCUMENT_PROCESSING_WEBHOOK_URL`
  - `ADDITIONAL_SOURCES_WEBHOOK_URL`
  - `NOTEBOOK_GENERATION_AUTH`
  - `OPENAI_API_KEY`

### 2.4. Weryfikacja N8N
- [x] Workflow są już skonfigurowane i uruchomione
- [ ] Zweryfikować działanie wszystkich workflow:
  - `InsightsLM___Chat` - czat z dokumentami
  - `InsightsLM___Extract_Text` - ekstrakcja tekstu
  - `InsightsLM___Generate_Notebook_Details` - generowanie szczegółów
  - `InsightsLM___Podcast_Generation` - generowanie podcastów
  - `InsightsLM___Process_Additional_Sources` - przetwarzanie źródeł
  - `InsightsLM___Upsert_to_Vector_Store` - zapis do vector store
- [ ] Sprawdzić dostępność webhooków dla Supabase Edge Functions
- [ ] Przetestować integrację N8N ↔ Supabase

---

## 3. Rozwój Funkcjonalności

### 3.1. Frontend (React/TypeScript)

#### Komponenty do Ulepszenia:
- [ ] **Dashboard** (`src/pages/Dashboard.tsx`)
  - Optymalizacja wyświetlania notebooków
  - Dodanie filtrów i sortowania
  - Ulepszenie responsywności

- [ ] **Notebook** (`src/pages/Notebook.tsx`)
  - Ulepszenie interfejsu czatu
  - Optymalizacja wyświetlania źródeł
  - Dodanie funkcji eksportu

- [ ] **Komponenty UI** (`src/components/ui/`)
  - Weryfikacja dostępności (a11y)
  - Optymalizacja wydajności
  - Dodanie animacji

#### Nowe Funkcjonalności:
- [ ] System tagów dla notebooków
- [ ] Wyszukiwarka globalna
- [ ] Eksport do PDF/Markdown
- [ ] Współdzielenie notebooków
- [ ] Historia zmian w notatkach

### 3.2. Backend (Supabase Edge Functions)

#### Funkcje do Przeglądu:
- [ ] `generate-notebook-content` - generowanie treści notebooka
- [ ] `send-chat-message` - obsługa wiadomości czatu
- [ ] `process-document` - przetwarzanie dokumentów
- [ ] `generate-audio-overview` - generowanie audio
- [ ] `process-additional-sources` - przetwarzanie dodatkowych źródeł

#### Optymalizacje:
- [ ] Dodanie cache'owania
- [ ] Optymalizacja zapytań do bazy danych
- [ ] Obsługa błędów i retry logic
- [ ] Logowanie i monitoring

### 3.3. Integracje N8N

#### Monitorowanie i Optymalizacja Workflow:
- [ ] Monitorowanie wydajności istniejących workflow
- [ ] Analiza logów i błędów
- [ ] Optymalizacja przepływu danych
- [ ] Dodanie walidacji danych wejściowych (jeśli brakuje)
- [ ] Ulepszenie obsługi błędów i fallback

#### Potencjalne Rozszerzenia:
- [ ] Dodanie nowych workflow (jeśli potrzebne)
- [ ] Integracja z dodatkowymi serwisami
- [ ] Automatyzacja dodatkowych procesów

---

## 4. Testowanie

### 4.1. Testy Funkcjonalne
- [ ] Testowanie uploadu dokumentów (PDF, TXT, DOC)
- [ ] Testowanie czatu z dokumentami
- [ ] Testowanie generowania audio
- [ ] Testowanie dodawania źródeł
- [ ] Testowanie edycji notatek

### 4.2. Testy Integracyjne
- [ ] Testowanie połączenia Frontend ↔ Supabase
- [ ] Testowanie połączenia Supabase ↔ N8N
- [ ] Testowanie webhooków
- [ ] Testowanie Edge Functions

### 4.3. Testy Wydajnościowe
- [ ] Testowanie czasu odpowiedzi
- [ ] Testowanie obciążenia
- [ ] Optymalizacja zapytań do bazy danych
- [ ] Optymalizacja rozmiaru bundle'a frontend

### 4.4. Testy Bezpieczeństwa
- [ ] Weryfikacja autentykacji
- [ ] Weryfikacja autoryzacji
- [ ] Testowanie walidacji danych
- [ ] Weryfikacja bezpieczeństwa API

---

## 5. Dokumentacja

### 5.1. Dokumentacja Techniczna
- [ ] Aktualizacja README.md
- [ ] Dokumentacja API
- [ ] Dokumentacja architektury
- [ ] Diagramy przepływu danych

### 5.2. Dokumentacja Użytkownika
- [ ] Przewodnik szybkiego startu
- [ ] Instrukcje użytkowania
- [ ] FAQ
- [ ] Przykłady użycia

### 5.3. Dokumentacja Deweloperska
- [ ] Przewodnik dla kontrybutorów
- [ ] Standardy kodu
- [ ] Proces code review
- [ ] Instrukcje deploymentu

---

## 6. Deployment

### 6.1. Przygotowanie do Produkcji
- [ ] Konfiguracja zmiennych środowiskowych
- [ ] Optymalizacja build'a produkcyjnego
- [ ] Konfiguracja CDN
- [ ] Ustawienie monitoring i logowania

### 6.2. Deployment Frontend
- [ ] Build produkcyjny: `npm run build`
- [ ] Wybór platformy hostingowej (Netlify/Vercel/GitHub Pages)
- [ ] Deploy aplikacji
- [ ] Konfiguracja domeny
- [ ] Weryfikacja SSL
- [ ] Konfiguracja zmiennych środowiskowych w produkcji

### 6.3. Deployment Backend
- [ ] Deploy Supabase Edge Functions
- [ ] Weryfikacja działania N8N workflow w produkcji
- [ ] Sprawdzenie konfiguracji webhooków w środowisku produkcyjnym
- [ ] Backup bazy danych
- [ ] Konfiguracja skalowania

---

## 7. Optymalizacje i Ulepszenia

### 7.1. Wydajność
- [ ] Lazy loading komponentów
- [ ] Code splitting
- [ ] Optymalizacja obrazów
- [ ] Cache'owanie zapytań
- [ ] Kompresja odpowiedzi API

### 7.2. UX/UI
- [ ] Ulepszenie responsywności
- [ ] Dodanie dark mode
- [ ] Optymalizacja animacji
- [ ] Ulepszenie dostępności (a11y)
- [ ] Międzynarodowość (i18n)

### 7.3. Funkcjonalności
- [ ] Wsparcie dla większej liczby formatów plików
- [ ] Integracja z zewnętrznymi źródłami
- [ ] Zaawansowane opcje wyszukiwania
- [ ] Eksport w różnych formatach
- [ ] Współpraca w czasie rzeczywistym

---

## 8. Bezpieczeństwo

### 8.1. Audyt Bezpieczeństwa
- [ ] Przegląd kodu pod kątem podatności
- [ ] Weryfikacja sanitizacji danych wejściowych
- [ ] Testowanie SQL injection
- [ ] Weryfikacja CORS
- [ ] Sprawdzenie rate limiting

### 8.2. Compliance
- [ ] Weryfikacja zgodności z RODO
- [ ] Polityka prywatności
- [ ] Warunki użytkowania
- [ ] Zarządzanie danymi użytkowników

---

## 9. Monitoring i Maintenance

### 9.1. Monitoring
- [ ] Konfiguracja error tracking (Sentry)
- [ ] Monitoring wydajności (APM)
- [ ] Logowanie zdarzeń
- [ ] Alerty dla krytycznych błędów

### 9.2. Maintenance
- [ ] Regularne aktualizacje zależności
- [ ] Backup bazy danych
- [ ] Przegląd logów
- [ ] Optymalizacja kosztów

---

## 10. Roadmap

### Krótkoterminowe (1-2 miesiące)
- [ ] Stabilizacja obecnych funkcjonalności
- [ ] Poprawki błędów
- [ ] Optymalizacja wydajności
- [ ] Ulepszenie dokumentacji

### Średnioterminowe (3-6 miesięcy)
- [ ] Nowe funkcjonalności (tagi, wyszukiwarka)
- [ ] Integracje z zewnętrznymi serwisami
- [ ] Ulepszenia UX/UI
- [ ] Rozszerzenie wsparcia formatów

### Długoterminowe (6+ miesięcy)
- [ ] Wersja fully local (Ollama, Qwen3)
- [ ] Współpraca w czasie rzeczywistym
- [ ] Zaawansowane opcje analityki
- [ ] Marketplace rozszerzeń

---

## 11. Priorytety

### Wysokie Priorytety
1. Stabilizacja podstawowych funkcjonalności
2. Poprawki krytycznych błędów
3. Optymalizacja wydajności
4. Bezpieczeństwo i walidacja danych

### Średnie Priorytety
1. Nowe funkcjonalności
2. Ulepszenia UX/UI
3. Dokumentacja
4. Testy

### Niskie Priorytety
1. Integracje zewnętrzne
2. Zaawansowane funkcjonalności
3. Optymalizacje kosztów
4. Marketing i promocja

---

## 12. Zasoby i Linki

- **Repozytorium:** [GitHub](https://github.com/theaiautomators/insights-lm-public)
- **Dokumentacja:** README.md
- **Wideo Tutorial:** [YouTube](https://www.youtube.com/watch?v=IXJEGjfZRBE)
- **Community:** [The AI Automators](https://www.theaiautomators.com/)
- **Fully Local Version:** [InsightsLM Local](https://github.com/theaiautomators/insights-lm-local-package)

---

## Notatki

- Projekt używa licencji MIT
- N8N używa Sustainable Use License (sprawdź zgodność dla komercyjnego użycia)
- Wszystkie zmiany powinny być testowane przed commitem
- Dokumentacja powinna być aktualizowana wraz ze zmianami w kodzie

---

## 13. Usuwanie Konta Użytkownika (v1.4.0)

### Cel
Dodać możliwość całkowitego usunięcia konta użytkownika wraz z wszystkimi powiązanymi danymi z Supabase (baza danych + storage).

### Analiza Obecnego Stanu

**CASCADE działające poprawnie:**
- ✅ `auth.users` → `profiles` (ON DELETE CASCADE)
- ✅ `profiles` → `notebooks` (ON DELETE CASCADE)
- ✅ `notebooks` → `sources` (ON DELETE CASCADE)
- ✅ `notebooks` → `notes` (ON DELETE CASCADE)

**Krytyczne luki:**
- ❌ Tabela `documents`: Brak `user_id`, więc NIE jest usuwana kaskadowo
- ❌ Tabela `n8n_chat_histories`: Ma `session_id` ale brak bezpośredniej relacji CASCADE z użytkownikiem
- ❌ Pliki w Storage: Pozostają osierocone w bucketach ('sources', 'audio', 'public-images')

### Implementacja

#### Faza 1: Migracja Bazy Danych
**Plik:** `supabase/migrations/20260106000000_add_account_deletion_support.sql`

**Zmiany:**
1. Dodanie kolumny `user_id` do tabeli `documents` z CASCADE
2. Dodanie kolumny `user_id` do tabeli `n8n_chat_histories` z CASCADE
3. Backfill istniejących rekordów user_id na podstawie notebooks
4. Utworzenie funkcji pomocniczej `get_user_storage_files(user_id)` do pobierania listy plików przed usunięciem
5. Aktualizacja polityk RLS dla documents i chat_histories
6. Dodanie triggerów do automatycznego ustawiania user_id przy INSERT

**Dlaczego ta kolejność:**
- CASCADE zapewnia atomowość (wszystko lub nic)
- Funkcja pomocnicza pozwala pobrać listę plików PRZED usunięciem rekordów z bazy
- Triggery zapobiegają przyszłym rekordom bez user_id

#### Faza 2: Edge Function
**Plik:** `supabase/functions/delete-user-account/index.ts`

**Logika:**
1. Weryfikacja JWT tokenu użytkownika (tylko zalogowany użytkownik może usunąć swoje konto)
2. Pobranie listy wszystkich plików storage (przez RPC `get_user_storage_files`)
3. Usunięcie wszystkich plików z bucketów (sources, audio, public-images)
4. Usunięcie użytkownika z `auth.users` (używając service role)
5. CASCADE automatycznie usuwa wszystkie powiązane rekordy

**Dlaczego Edge Function:**
- Wymaga uprawnień service role (tylko service role może usuwać auth.users)
- Zapewnia atomowość operacji
- Może czyścić storage z uprawnieniami service role
- Bezpieczeństwo: weryfikacja JWT, użytkownik może usunąć tylko swoje konto

**Config:** `supabase/config.toml` - dodać `[functions.delete-user-account]` z `verify_jwt = true`

#### Faza 3: Frontend Hook
**Plik:** `src/hooks/useAccountDelete.tsx`

**Funkcjonalność:**
- Hook React Query z mutacją wywołującą Edge Function
- Przekazuje JWT token w nagłówku Authorization
- Po sukcesie: wylogowanie użytkownika i przekierowanie do strony głównej
- Obsługa błędów z przejrzystymi komunikatami
- Stan ładowania (isDeleting) dla UI

#### Faza 4: Komponent UI
**Plik:** `src/components/profile/DeleteAccountDialog.tsx`

**Funkcjonalność:**
- AlertDialog z potwierdzeniem
- Wymaga wpisania tekstu "DELETE MY ACCOUNT" (zabezpieczenie przed przypadkowym usunięciem)
- Lista wszystkich danych, które zostaną usunięte
- Ostrzeżenie: "This action cannot be undone"
- Przycisk wyłączony dopóki użytkownik nie wpisze poprawnego tekstu
- Stan ładowania podczas usuwania

#### Faza 5: Aktualizacja Strony Profile
**Plik:** `src/pages/Profile.tsx`

**Zmiany:**
- Import `DeleteAccountDialog`
- Dodanie sekcji "Danger Zone" na końcu strony (po "Account Information")
- Card z czerwoną ramką zawierający DeleteAccountDialog
- Separator przed sekcją

### Kolejność Wykonania (KRYTYCZNA!)

**Deployment:**
1. **Najpierw:** Zastosować migrację bazy danych (`supabase db push`)
2. **Potem:** Wdrożyć Edge Function (`supabase functions deploy delete-user-account`)
3. **Na końcu:** Wdrożyć zmiany frontend (build + deploy do Vercel)

**Kolejność operacji w Edge Function:**
1. Weryfikacja JWT (kto wywołuje?)
2. Pobranie listy plików storage (PRZED usunięciem z bazy!)
3. Usunięcie wszystkich plików storage
4. Usunięcie użytkownika z auth.users (CASCADE usuwa resztę)

**Dlaczego ta kolejność?**
- Pliki muszą być pobrane PRZED usunięciem rekordów z bazy (inaczej stracimy ścieżki do plików)
- Storage przed bazą zapobiega osieroconymi plikom
- Usunięcie użytkownika OSTATNIE uruchamia CASCADE dla wszystkich tabel

### Bezpieczeństwo

- ✅ Wymaga autentykacji (JWT token)
- ✅ Użytkownik może usunąć tylko swoje konto (user_id z JWT)
- ✅ Service role tylko w Edge Function (nie w kliencie)
- ✅ Wymagane potwierdzenie w UI (wpisanie tekstu)
- ✅ Polityki RLS na wszystkich tabelach
- ✅ Logi w Edge Function do audytu

### Pliki do Zmiany

**Backend:**
- `supabase/migrations/20260106000000_add_account_deletion_support.sql` - Migracja CASCADE + funkcja pomocnicza
- `supabase/functions/delete-user-account/index.ts` - Edge Function do usuwania konta
- `supabase/config.toml` - Konfiguracja Edge Function

**Frontend:**
- `src/hooks/useAccountDelete.tsx` - Hook do usuwania konta
- `src/components/profile/DeleteAccountDialog.tsx` - Komponent dialog potwierdzenia
- `src/pages/Profile.tsx` - Dodanie sekcji Danger Zone

### Co Zostanie Usunięte

Po wywołaniu delete account, następujące dane zostaną PERMANENTNIE usunięte:

**Baza danych:**
- Użytkownik z auth.users
- Profil z profiles
- Wszystkie notebooki (notebooks)
- Wszystkie źródła (sources)
- Wszystkie notatki (notes)
- Wszystkie dokumenty (documents)
- Wszystkie historie czatu (n8n_chat_histories)

**Storage:**
- Wszystkie pliki z bucketa 'sources' (uploaded documents)
- Wszystkie pliki z bucketa 'audio' (generated audio overviews)
- Wszystkie pliki z bucketa 'public-images' (user images)

**Suma: 100% danych użytkownika** - żadne osierocone dane nie pozostaną w systemie.

### Test Plan

1. Utworzyć testowe konto
2. Dodać notebooki, źródła, uploady plików
3. Wygenerować audio overviews
4. Utworzyć notatki i wiadomości czatu
5. Przejść do Profile → Danger Zone
6. Kliknąć "Delete Account"
7. Wpisać niepoprawny tekst (przycisk powinien być disabled)
8. Wpisać "DELETE MY ACCOUNT"
9. Kliknąć "Delete My Account"
10. Sprawdzić toast sukcesu
11. Sprawdzić przekierowanie do strony głównej
12. Spróbować zalogować się na usunięte konto (powinno się nie udać)
13. Sprawdzić w Supabase Studio:
    - Użytkownik usunięty z auth.users
    - Wszystkie tabele puste dla tego użytkownika
    - Wszystkie pliki usunięte z bucketów

### Podsumowanie

Implementacja zapewnia:
- ✅ Kompletne usunięcie konta i wszystkich danych
- ✅ Bezpieczeństwo (JWT + RLS + confirmation dialog)
- ✅ UX zgodny z najlepszymi praktykami (potwierdzenie tekstu)
- ✅ Obsługę błędów
- ✅ Atomowość operacji (wszystko lub nic)
- ✅ Brak osierocononych danych (baza + storage)

**Żadnych danych użytkownika nie pozostanie w systemie Supabase.**

---

*Ostatnia aktualizacja: 2026-01-06*
*Wersja: 2.0*

