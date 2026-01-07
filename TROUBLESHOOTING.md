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




