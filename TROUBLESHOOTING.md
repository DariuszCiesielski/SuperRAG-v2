# Rozwiązywanie problemów z aplikacją SuperRAG

## Problem: Błąd 401 przy wywołaniu Edge Functions

### Możliwe przyczyny:

1. **Edge Functions nie są wdrożone w Supabase**
   - Sprawdź w dashboardzie Supabase: Edge Functions → Functions
   - Jeśli funkcje nie są wdrożone, musisz je wdrożyć

2. **Brak konfiguracji JWT w Edge Functions**
   - Edge Functions wymagają `verify_jwt = true` w `supabase/config.toml`
   - Supabase client automatycznie przekazuje token JWT z sesji użytkownika

3. **Sesja użytkownika wygasła**
   - Token JWT jest ważny przez 1 godzinę (domyślnie)
   - Wyloguj się i zaloguj ponownie

4. **Brak secrets w Supabase**
   - Sprawdź czy wszystkie wymagane secrets są ustawione:
     - NOTEBOOK_CHAT_URL
     - NOTEBOOK_GENERATION_AUTH
     - DOCUMENT_PROCESSING_WEBHOOK_URL
     - ADDITIONAL_SOURCES_WEBHOOK_URL
     - AUDIO_GENERATION_WEBHOOK_URL
     - OPENAI_API_KEY

### Rozwiązania:

1. **Wdrożenie Edge Functions:**
   ```bash
   # Zainstaluj Supabase CLI
   npm install -g supabase
   
   # Zaloguj się
   supabase login
   
   # Połącz z projektem
   supabase link --project-ref sfqsuysimebkdeayxmmi
   
   # Wdróż Edge Functions
   supabase functions deploy send-chat-message
   supabase functions deploy generate-notebook-content
   supabase functions deploy process-document
   supabase functions deploy process-additional-sources
   ```

2. **Sprawdzenie logów Edge Functions:**
   - W dashboardzie Supabase: Edge Functions → Logs
   - Sprawdź czy są błędy przy wywołaniu funkcji

3. **Weryfikacja konfiguracji:**
   - Sprawdź czy `supabase/config.toml` ma poprawne ustawienia
   - Sprawdź czy secrets są ustawione w Supabase Dashboard

4. **Testowanie połączenia:**
   - Sprawdź czy aplikacja może połączyć się z Supabase
   - Sprawdź czy użytkownik jest zalogowany
   - Sprawdź konsolę przeglądarki pod kątem błędów

## Problem: Aplikacja w ogóle nie działa

### Możliwe przyczyny:

1. **Serwer deweloperski nie działa**
   - Sprawdź czy proces Node.js działa
   - Sprawdź czy port 8080 jest wolny

2. **Błędy w kodzie**
   - Sprawdź konsolę przeglądarki
   - Sprawdź logi serwera deweloperskiego

3. **Problemy z zależnościami**
   - Uruchom `npm install` ponownie
   - Sprawdź czy wszystkie pakiety są zainstalowane

### Rozwiązania:

1. **Restart serwera:**
   ```bash
   # Zatrzymaj serwer (Ctrl+C)
   # Uruchom ponownie
   npm run dev
   ```

2. **Sprawdzenie błędów:**
   - Otwórz konsolę przeglądarki (F12)
   - Sprawdź zakładkę Console i Network
   - Sprawdź logi serwera w terminalu

3. **Czyszczenie cache:**
   ```bash
   # Usuń node_modules i package-lock.json
   rm -rf node_modules package-lock.json
   # Zainstaluj ponownie
   npm install
   ```

## Problem: Płatności Stripe nie działają

### Możliwe przyczyny:

1. **Brak sekretów Stripe w Supabase**
   - Sprawdź czy `STRIPE_SECRET_KEY` jest ustawiony
   - Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest ustawiony

2. **Edge Functions nie są wdrożone**
   - Sprawdź czy `create-checkout-session` jest wdrożone
   - Sprawdź czy `stripe-webhook` jest wdrożone

3. **Webhook nie jest skonfigurowany w Stripe**
   - Sprawdź Stripe Dashboard → Developers → Webhooks
   - URL webhook powinien być: `https://sfqsuysimebkdeayxmmi.supabase.co/functions/v1/stripe-webhook`

4. **Użytkownik nie jest zalogowany**
   - Sprawdź czy sesja użytkownika jest aktywna
   - Sprawdź konsolę przeglądarki pod kątem błędów

### Rozwiązania:

1. **Dodanie sekretów Stripe:**
   - W Supabase Dashboard: Edge Functions → Secrets
   - Dodaj `STRIPE_SECRET_KEY` (sk_live_... lub sk_test_...)
   - Dodaj `STRIPE_WEBHOOK_SECRET` (whsec_...)

2. **Wdrożenie Edge Functions:**
   ```bash
   supabase functions deploy create-checkout-session --project-ref sfqsuysimebkdeayxmmi
   supabase functions deploy stripe-webhook --project-ref sfqsuysimebkdeayxmmi
   ```

3. **Konfiguracja webhook w Stripe:**
   - Wejdź na https://dashboard.stripe.com/webhooks
   - Kliknij "Add endpoint"
   - URL: `https://sfqsuysimebkdeayxmmi.supabase.co/functions/v1/stripe-webhook`
   - Wybierz eventy:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Skopiuj "Signing secret" i dodaj jako `STRIPE_WEBHOOK_SECRET`

4. **Testowanie z kartą testową:**
   - Użyj karty testowej: `4242 4242 4242 4242`
   - Data: dowolna przyszła data
   - CVC: dowolne 3 cyfry

## Problem: Subskrypcja nie aktualizuje się po płatności

### Możliwe przyczyny:

1. **Webhook nie dociera do Supabase**
   - Sprawdź logi w Stripe Dashboard → Developers → Webhooks → Events
   - Sprawdź logi Edge Function w Supabase

2. **Błędna sygnatura webhook**
   - `STRIPE_WEBHOOK_SECRET` może być nieprawidłowy
   - Użyj secret z Stripe Dashboard, nie z CLI

3. **Brak tabeli subscriptions**
   - Sprawdź czy migracja została zastosowana

### Rozwiązania:

1. **Sprawdzenie logów webhook:**
   - Stripe Dashboard → Developers → Webhooks → Events
   - Sprawdź czy eventy mają status "Succeeded"

2. **Sprawdzenie logów Edge Function:**
   - Supabase Dashboard → Edge Functions → stripe-webhook → Logs
   - Szukaj błędów typu "Invalid signature" lub "Table not found"

3. **Ręczna aktualizacja subskrypcji (tymczasowo):**
   ```sql
   UPDATE subscriptions
   SET plan_id = 'pro', status = 'active'
   WHERE user_id = 'user-uuid-here';
   ```

## Problem: Strona Pricing nie wyświetla aktualnego planu

### Możliwe przyczyny:

1. **Brak rekordu w tabeli subscriptions**
   - Nowi użytkownicy mogą nie mieć jeszcze rekordu

2. **Cache React Query**
   - Dane mogą być cache'owane

### Rozwiązania:

1. **Odśwież stronę:**
   - Hard refresh: `Ctrl + Shift + R`

2. **Sprawdź tabelę subscriptions:**
   ```sql
   SELECT * FROM subscriptions WHERE user_id = 'user-uuid-here';
   ```

3. **Utwórz rekord dla użytkownika (jeśli brakuje):**
   ```sql
   INSERT INTO subscriptions (user_id, plan_id, status)
   VALUES ('user-uuid-here', 'free', 'active');
   ```




