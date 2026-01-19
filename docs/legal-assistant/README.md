# Pomoc Prawna (Legal Assistant)

Moduł pomocy prawnej dla osób, które nie stać na profesjonalnego prawnika. Rozszerzenie projektu SuperRAG_v3 (InsightsLM).

## Opis

Narzędzie umożliwia:
- Tworzenie i zarządzanie sprawami prawnymi
- Śledzenie etapów postępowania (policja → prokuratura → sąd I → sąd II)
- Przechowywanie dokumentów związanych ze sprawą
- Zadawanie pytań AI opartych na przepisach prawnych i dokumentach użytkownika (RAG)
- Generowanie pism prawnych z eksportem do .docx

## Architektura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  /legal (dashboard) → /legal/case/:id → /legal/library          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL + Edge Functions)             │
│  legal_cases, case_proceedings, case_documents, legal_*         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              N8N WORKFLOWS + LLM (RAG Pipeline)                 │
│  hybrid_legal_search → OpenAI/Gemini → cytowania artykułów     │
└─────────────────────────────────────────────────────────────────┘
```

## Struktura plików

```
src/
├── components/legal/       # Komponenty React
├── hooks/legal/           # Custom hooks
├── pages/                 # Legal.tsx, LegalCase.tsx
├── types/legal.ts         # Typy TypeScript
└── locales/*/legal.json   # Tłumaczenia

supabase/
├── migrations/            # Migracje SQL
└── functions/             # Edge Functions

docs/legal-assistant/      # Dokumentacja
```

## Szybki start

1. Zastosuj migracje bazy danych:
   ```bash
   supabase db push --project-ref <ref>
   ```

2. Uruchom dev server:
   ```bash
   npm run dev
   ```

3. Otwórz `/legal` w przeglądarce

## Dokumentacja

- [SETUP.md](./SETUP.md) - Instrukcja instalacji
- [DATABASE.md](./DATABASE.md) - Schemat bazy danych
- [USER_GUIDE.md](./USER_GUIDE.md) - Instrukcja dla użytkowników

## Model płatności (Freemium)

| Plan | Cena | Sprawy | Dokumenty/mies. | Eksport .docx |
|------|------|--------|-----------------|---------------|
| Free | 0 zł | 2 | 3 | ❌ |
| Pro Legal | 29.99 zł/mies. | ∞ | ∞ | ✅ |

## Licencja

Ten moduł jest częścią projektu InsightsLM i podlega tej samej licencji.
