-- ============================================================================
-- MIGRACJA: Dodanie nowych kolumn do legal_cases
-- Uruchom ten skrypt JEŚLI tabele już istnieją
-- ============================================================================

-- Dodaj kolumnę case_number jeśli nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'legal_cases' AND column_name = 'case_number') THEN
    ALTER TABLE legal_cases ADD COLUMN case_number TEXT;
  END IF;
END $$;

-- Dodaj kolumnę current_stage jeśli nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'legal_cases' AND column_name = 'current_stage') THEN
    ALTER TABLE legal_cases ADD COLUMN current_stage TEXT
      CHECK (current_stage IS NULL OR current_stage IN (
        'policja', 'prokuratura', 'sad_rejonowy', 'sad_okregowy',
        'sad_apelacyjny', 'sad_najwyzszy', 'organ_administracyjny',
        'wsa', 'nsa', 'komornik', 'mediacja', 'arbitraz', 'inne'
      ));
  END IF;
END $$;

-- Dodaj kolumnę user_role jeśli nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'legal_cases' AND column_name = 'user_role') THEN
    ALTER TABLE legal_cases ADD COLUMN user_role TEXT
      CHECK (user_role IS NULL OR user_role IN (
        'powod', 'pozwany', 'wnioskodawca', 'uczestnik',
        'oskarzyciel', 'oskarzony', 'pokrzywdzony', 'swiadek',
        'biegly', 'interwenient', 'kurator', 'pelnomonik'
      ));
  END IF;
END $$;

-- Wyświetl potwierdzenie
SELECT 'Migracja zakończona! Nowe kolumny: case_number, current_stage, user_role' AS status;
