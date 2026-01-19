# Schemat bazy danych - Moduł Pomocy Prawnej

## Diagram ERD

```
┌──────────────────────┐     ┌────────────────────────┐
│   legal_regulations  │     │     legal_rulings      │
├──────────────────────┤     ├────────────────────────┤
│ id (uuid) PK         │     │ id (uuid) PK           │
│ title                │     │ court_name             │
│ short_name           │     │ case_number            │
│ document_type        │     │ ruling_date            │
│ category[]           │     │ category[]             │
│ content              │     │ summary                │
│ source_url           │     │ content                │
│ is_active            │     │ keywords[]             │
└──────────────────────┘     └────────────────────────┘
           │                            │
           └─────────────┬──────────────┘
                         ↓
┌────────────────────────────────────────────────────┐
│            legal_documents_embeddings              │
├────────────────────────────────────────────────────┤
│ id (bigserial) PK                                  │
│ source_type ('regulation', 'ruling', 'template')  │
│ source_id (uuid)                                   │
│ chunk_index                                        │
│ content                                            │
│ embedding vector(1536)                             │
└────────────────────────────────────────────────────┘

┌──────────────────────┐
│    legal_templates   │
├──────────────────────┤
│ id (uuid) PK         │
│ title                │
│ document_type        │
│ category[]           │
│ template_content     │
│ template_fields      │
│ is_premium           │
└──────────────────────┘

                    DANE UŻYTKOWNIKA
                    ================

┌──────────────────────┐      ┌────────────────────────┐
│     legal_cases      │──1:N─│   case_proceedings     │
├──────────────────────┤      ├────────────────────────┤
│ id (uuid) PK         │      │ id (uuid) PK           │
│ user_id (FK)         │      │ case_id (FK)           │
│ title                │      │ stage_type             │
│ category             │      │ institution_name       │
│ status               │      │ case_number (sygnatura)│
│ opponent_name        │      │ started_at             │
│ deadline_date        │      │ ended_at               │
│ parent_case_id       │      │ outcome                │
└──────────────────────┘      │ previous_proceeding_id │
         │                    │ merged_from_case_ids[] │
         │                    └────────────────────────┘
         │
         ├──1:N──┐
         │       │
         ↓       ↓
┌──────────────────────┐      ┌────────────────────────┐
│    case_documents    │      │     case_parties       │
├──────────────────────┤      ├────────────────────────┤
│ id (uuid) PK         │      │ id (uuid) PK           │
│ case_id (FK)         │      │ case_id (FK)           │
│ title                │      │ party_type             │
│ document_type        │      │ name                   │
│ file_path            │      │ address                │
│ content              │      │ pesel_or_nip           │
│ processing_status    │      │ is_user                │
└──────────────────────┘      └────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────┐
│            case_documents_embeddings               │
├────────────────────────────────────────────────────┤
│ id (bigserial) PK                                  │
│ case_id (uuid) FK                                  │
│ document_id (uuid) FK                              │
│ chunk_index                                        │
│ content                                            │
│ embedding vector(1536)                             │
└────────────────────────────────────────────────────┘
```

## Tabele - szczegóły

### legal_cases (sprawy użytkownika)

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | uuid | Klucz główny |
| user_id | uuid | FK do profiles |
| title | text | Nazwa sprawy |
| description | text | Opis |
| category | legal_category | Kategoria (cywilne, administracyjne, etc.) |
| status | case_status | Status (active, archived, won, lost, settled) |
| opponent_name | text | Nazwa przeciwnika |
| opponent_type | text | Typ (osoba, firma, urząd) |
| parent_case_id | uuid | FK do połączonej sprawy |
| deadline_date | date | Termin |
| icon | text | Emoji |
| color | text | Kolor karty |

### case_proceedings (etapy postępowania)

| Kolumna | Typ | Opis |
|---------|-----|------|
| id | uuid | Klucz główny |
| case_id | uuid | FK do legal_cases |
| stage_type | proceeding_stage_type | Typ etapu |
| institution_name | text | Nazwa instytucji |
| case_number | text | **Sygnatura akt** |
| started_at | date | Data rozpoczęcia |
| ended_at | date | Data zakończenia |
| outcome | proceeding_outcome | Wynik (w_toku, przekazano, wyrok, etc.) |
| previous_proceeding_id | uuid | FK do poprzedniego etapu |
| merged_from_case_ids | uuid[] | Sprawy połączone |

### Typy ENUM

```sql
-- stage_type
'policja', 'prokuratura', 'sad_rejonowy', 'sad_okregowy',
'sad_apelacyjny', 'sad_najwyzszy', 'organ_administracyjny',
'wsa', 'nsa', 'komornik', 'mediacja', 'arbitraz', 'inne'

-- outcome
'w_toku', 'przekazano', 'umorzono', 'wyrok_korzystny',
'wyrok_niekorzystny', 'ugoda', 'apelacja', 'kasacja', 'zakonczone'

-- party_type
'powod', 'pozwany', 'wnioskodawca', 'uczestnik', 'oskarzyciel',
'oskarzony', 'pokrzywdzony', 'swiadek', 'biegly', 'interwenient'
```

## Funkcje SQL

### hybrid_legal_search

Hybrydowe wyszukiwanie RAG łączące:
1. Wspólną bazę prawną (legal_documents_embeddings)
2. Dokumenty sprawy użytkownika (case_documents_embeddings)

```sql
SELECT * FROM hybrid_legal_search(
    query_embedding := <vector>,
    case_id_param := '<uuid>',
    categories := ARRAY['cywilne'],
    include_regulations := true,
    include_rulings := true,
    include_case_docs := true
);
```

### check_legal_limits

Sprawdza limity użytkownika dla planu Free/Pro.

```sql
SELECT * FROM check_legal_limits('<user_uuid>');
-- Zwraca: plan_id, cases_count, can_create_case, documents_this_month, etc.
```

## Polityki RLS

- **Wspólna baza prawna**: SELECT dla wszystkich zalogowanych, zarządzanie tylko dla admins
- **Dane użytkownika**: CRUD tylko dla właściciela (user_id = auth.uid())
- **Etapy i dokumenty**: CRUD tylko gdy is_case_owner(case_id) = true
