# Instrukcja użytkownika - Pomoc Prawna

## Wprowadzenie

Pomoc Prawna to narzędzie zaprojektowane dla osób, które potrzebują pomocy w sprawach prawnych, ale nie stać ich na profesjonalnego prawnika. Narzędzie pozwala:

- Organizować dokumenty związane ze sprawą
- Śledzić etapy postępowania (od policji do sądu)
- Zadawać pytania i otrzymywać odpowiedzi oparte na przepisach prawa
- Generować pisma prawne

## Rozpoczęcie pracy

### 1. Logowanie

Przejdź do `/legal` i zaloguj się swoim kontem. Jeśli nie masz konta, zarejestruj się.

### 2. Tworzenie sprawy

1. Kliknij **"Nowa sprawa"**
2. Wypełnij formularz:
   - **Nazwa sprawy** - np. "Sprawa o zapłatę czynszu"
   - **Kategoria** - wybierz odpowiednią (cywilne, administracyjne, pracownicze, etc.)
   - **Opis** (opcjonalnie) - krótki opis sytuacji
   - **Przeciwnik** (opcjonalnie) - druga strona sprawy
   - **Termin** (opcjonalnie) - ważna data (np. termin rozprawy)
3. Kliknij **"Utwórz sprawę"**

### 3. Dodawanie etapów postępowania

Sprawy prawne często przechodzą przez różne instytucje. Każda z nich nadaje własną sygnaturę.

**Przykład:**
```
1. Policja: RSD-123/24
2. Prokuratura: Ds. 456/24
3. Sąd Rejonowy: II K 789/24
4. Sąd Okręgowy (apelacja): IV Ka 012/25
```

Aby dodać etap:
1. Otwórz sprawę
2. W panelu **"Etapy postępowania"** kliknij **"+"**
3. Wybierz typ etapu (policja, prokuratura, sąd, etc.)
4. Podaj nazwę instytucji (np. "Sąd Rejonowy w Krakowie, II Wydział Karny")
5. Wpisz sygnaturę akt (np. "II K 789/24")
6. Ustaw daty i status
7. Kliknij **"Dodaj etap"**

### 4. Dodawanie dokumentów

W panelu **"Dokumenty"**:
1. Kliknij **"+"** lub **"Dodaj dokument"**
2. Wybierz plik (PDF, Word, obraz) lub wklej tekst
3. Podaj tytuł i typ dokumentu (umowa, korespondencja, dowód, etc.)
4. Poczekaj na przetworzenie - tekst zostanie wyekstrahowany do analizy AI

### 5. Zadawanie pytań (Chat z AI)

W centralnym panelu **"Asystent prawny"**:
1. Wpisz pytanie, np.:
   - "Jakie mam prawa jako najemca w tej sprawie?"
   - "Jak przygotować pozew o zapłatę?"
   - "Jaki jest termin na wniesienie apelacji?"
2. Asystent przeszuka:
   - Przepisy prawne (Kodeks cywilny, KPC, etc.)
   - Orzecznictwa sądów
   - Twoje dokumenty
3. Odpowiedź zawiera cytowania ze źródeł (kliknij, aby zobaczyć pełny fragment)

### 6. Generowanie pism (płatne)

W planie **Pro Legal**:
1. Wybierz szablon pisma (pozew, odwołanie, wezwanie, etc.)
2. Wypełnij formularz danymi
3. Podgląd wygenerowanego pisma
4. Pobierz jako plik .docx

## Limity (plan Free)

| Funkcja | Limit |
|---------|-------|
| Aktywne sprawy | 2 |
| Generowanie pism | 3 / miesiąc |
| Eksport .docx | ❌ |
| Pełny dostęp do RAG | ❌ |

Aby usunąć limity, wykup plan **Pro Legal** (29.99 zł/mies.).

## FAQ

**P: Czy moje dokumenty są bezpieczne?**
O: Tak, wszystkie dane są szyfrowane i dostępne tylko dla Ciebie (RLS w bazie danych).

**P: Czy asystent AI może zastąpić prawnika?**
O: Nie. Narzędzie ma charakter informacyjny i edukacyjny. W poważnych sprawach konsultuj się z prawnikiem.

**P: Jak łączyć sprawy?**
O: Podczas tworzenia nowej sprawy możesz wskazać "sprawę nadrzędną". Etapy mogą też zawierać informację o połączeniu (merged_from_case_ids).

**P: Czy mogę eksportować dane?**
O: Tak, dokumenty można pobierać, a wygenerowane pisma eksportować do .docx.

## Kontakt

W razie problemów skontaktuj się przez stronę profilu lub napisz na support@example.com.
