-- ============================================================================
-- LEGAL ASSISTANT - SCHEMAT BAZY DANYCH
-- Uruchom ten skrypt w Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. WSPÓLNA BAZA PRAWNA (dostępna dla wszystkich)
-- ============================================================================

-- Przepisy prawne (ustawy, rozporządzenia, kodeksy)
CREATE TABLE IF NOT EXISTS legal_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_name TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('ustawa', 'rozporzadzenie', 'kodeks', 'orzeczenie', 'template', 'umowa', 'pozew', 'wniosek', 'odwolanie', 'wezwanie', 'pismo', 'skarga')),
  category TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_identifier TEXT,
  publication_date DATE,
  effective_date DATE,
  content TEXT NOT NULL,
  content_html TEXT,
  articles_json JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orzecznictwo
CREATE TABLE IF NOT EXISTS legal_rulings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_name TEXT NOT NULL,
  case_number TEXT NOT NULL,
  ruling_date DATE NOT NULL,
  ruling_type TEXT,
  category TEXT[] DEFAULT '{}',
  summary TEXT,
  content TEXT NOT NULL,
  related_regulations TEXT[],
  keywords TEXT[],
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Szablony dokumentów
CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  category TEXT[] DEFAULT '{}',
  template_content TEXT NOT NULL,
  template_fields JSONB NOT NULL DEFAULT '[]',
  example_filled TEXT,
  usage_instructions TEXT,
  legal_basis TEXT,
  related_regulations TEXT[],
  is_premium BOOLEAN DEFAULT false,
  popularity_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. SPRAWY UŻYTKOWNIKÓW
-- ============================================================================

-- Główna tabela spraw
CREATE TABLE IF NOT EXISTS legal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('cywilne', 'administracyjne', 'pracownicze', 'konsumenckie', 'rodzinne', 'spadkowe', 'nieruchomosci', 'umowy', 'karne', 'wykroczenia')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'won', 'lost', 'settled', 'dismissed')),
  case_number TEXT,
  current_stage TEXT CHECK (current_stage IS NULL OR current_stage IN ('policja', 'prokuratura', 'sad_rejonowy', 'sad_okregowy', 'sad_apelacyjny', 'sad_najwyzszy', 'organ_administracyjny', 'wsa', 'nsa', 'komornik', 'mediacja', 'arbitraz', 'inne')),
  user_role TEXT CHECK (user_role IS NULL OR user_role IN ('powod', 'pozwany', 'wnioskodawca', 'uczestnik', 'oskarzyciel', 'oskarzony', 'pokrzywdzony', 'swiadek', 'biegly', 'interwenient', 'kurator', 'pelnomonik')),
  opponent_name TEXT,
  opponent_type TEXT,
  parent_case_id UUID REFERENCES legal_cases(id) ON DELETE SET NULL,
  deadline_date DATE,
  icon TEXT DEFAULT '📋',
  color TEXT DEFAULT '#3B82F6',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Etapy postępowania
CREATE TABLE IF NOT EXISTS case_proceedings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  stage_type TEXT NOT NULL CHECK (stage_type IN ('policja', 'prokuratura', 'sad_rejonowy', 'sad_okregowy', 'sad_apelacyjny', 'sad_najwyzszy', 'organ_administracyjny', 'wsa', 'nsa', 'komornik', 'mediacja', 'arbitraz', 'inne')),
  institution_name TEXT NOT NULL,
  case_number TEXT,
  started_at DATE,
  ended_at DATE,
  outcome TEXT NOT NULL DEFAULT 'w_toku' CHECK (outcome IN ('w_toku', 'przekazano', 'umorzono', 'wyrok_korzystny', 'wyrok_niekorzystny', 'ugoda', 'apelacja', 'kasacja', 'zakonczone')),
  notes TEXT,
  previous_proceeding_id UUID REFERENCES case_proceedings(id) ON DELETE SET NULL,
  merged_from_case_ids UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strony sprawy
CREATE TABLE IF NOT EXISTS case_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  party_type TEXT NOT NULL CHECK (party_type IN ('powod', 'pozwany', 'wnioskodawca', 'uczestnik', 'oskarzyciel', 'oskarzony', 'pokrzywdzony', 'swiadek', 'biegly', 'interwenient', 'kurator', 'pelnomonik')),
  name TEXT NOT NULL,
  address TEXT,
  pesel_or_nip TEXT,
  contact_info TEXT,
  is_user BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dokumenty sprawy (przesłane przez użytkownika)
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT,
  file_path TEXT,
  file_size INTEGER,
  content TEXT,
  summary TEXT,
  processing_status TEXT DEFAULT 'pending',
  document_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wygenerowane dokumenty
CREATE TABLE IF NOT EXISTS generated_legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES legal_cases(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES legal_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT NOT NULL,
  form_data JSONB,
  docx_file_path TEXT,
  pdf_file_path TEXT,
  version INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CHAT I RAG
-- ============================================================================

-- Historia czatu
CREATE TABLE IF NOT EXISTS legal_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES legal_cases(id) ON DELETE CASCADE,
  message JSONB NOT NULL,
  sources_used JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ADMINISTRACJA I LIMITY
-- ============================================================================

-- Administratorzy Legal
CREATE TABLE IF NOT EXISTS legal_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Limity planów
CREATE TABLE IF NOT EXISTS legal_plan_limits (
  plan_id TEXT PRIMARY KEY,
  cases_limit INTEGER,
  documents_per_month INTEGER,
  can_export_docx BOOLEAN DEFAULT false,
  can_access_rulings BOOLEAN DEFAULT false,
  can_generate_documents BOOLEAN DEFAULT false,
  full_rag_access BOOLEAN DEFAULT false,
  price_monthly_pln NUMERIC(10,2) DEFAULT 0,
  features JSONB DEFAULT '{}'
);

-- Logi importów
CREATE TABLE IF NOT EXISTS legal_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL,
  source_url TEXT,
  records_imported INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 5. INDEKSY
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_legal_cases_user_id ON legal_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_cases_status ON legal_cases(status);
CREATE INDEX IF NOT EXISTS idx_legal_cases_category ON legal_cases(category);
CREATE INDEX IF NOT EXISTS idx_legal_cases_updated_at ON legal_cases(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_proceedings_case_id ON case_proceedings(case_id);
CREATE INDEX IF NOT EXISTS idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_docs_case_id ON generated_legal_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_docs_user_id ON generated_legal_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_legal_chat_session ON legal_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_legal_chat_user ON legal_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_chat_case ON legal_chat_messages(case_id);

CREATE INDEX IF NOT EXISTS idx_legal_regulations_type ON legal_regulations(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_regulations_active ON legal_regulations(is_active);
CREATE INDEX IF NOT EXISTS idx_legal_rulings_date ON legal_rulings(ruling_date DESC);
CREATE INDEX IF NOT EXISTS idx_legal_templates_type ON legal_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_templates_premium ON legal_templates(is_premium);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_proceedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_chat_messages ENABLE ROW LEVEL SECURITY;

-- Usuwanie istniejących polityk (jeśli istnieją)
DROP POLICY IF EXISTS "Users can view own cases" ON legal_cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON legal_cases;
DROP POLICY IF EXISTS "Users can update own cases" ON legal_cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON legal_cases;

DROP POLICY IF EXISTS "Users can view own proceedings" ON case_proceedings;
DROP POLICY IF EXISTS "Users can insert own proceedings" ON case_proceedings;
DROP POLICY IF EXISTS "Users can update own proceedings" ON case_proceedings;
DROP POLICY IF EXISTS "Users can delete own proceedings" ON case_proceedings;

DROP POLICY IF EXISTS "Users can view own case parties" ON case_parties;
DROP POLICY IF EXISTS "Users can manage own case parties" ON case_parties;

DROP POLICY IF EXISTS "Users can view own case documents" ON case_documents;
DROP POLICY IF EXISTS "Users can manage own case documents" ON case_documents;

DROP POLICY IF EXISTS "Users can view own generated docs" ON generated_legal_documents;
DROP POLICY IF EXISTS "Users can insert own generated docs" ON generated_legal_documents;
DROP POLICY IF EXISTS "Users can update own generated docs" ON generated_legal_documents;
DROP POLICY IF EXISTS "Users can delete own generated docs" ON generated_legal_documents;

DROP POLICY IF EXISTS "Users can view own chat messages" ON legal_chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON legal_chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON legal_chat_messages;

DROP POLICY IF EXISTS "Anyone can view active regulations" ON legal_regulations;
DROP POLICY IF EXISTS "Anyone can view active rulings" ON legal_rulings;
DROP POLICY IF EXISTS "Anyone can view active templates" ON legal_templates;
DROP POLICY IF EXISTS "Anyone can view plan limits" ON legal_plan_limits;

-- Polityki dla legal_cases
CREATE POLICY "Users can view own cases" ON legal_cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases" ON legal_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases" ON legal_cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases" ON legal_cases
  FOR DELETE USING (auth.uid() = user_id);

-- Polityki dla case_proceedings
CREATE POLICY "Users can view own proceedings" ON case_proceedings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_proceedings.case_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own proceedings" ON case_proceedings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_proceedings.case_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own proceedings" ON case_proceedings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_proceedings.case_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own proceedings" ON case_proceedings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_proceedings.case_id AND user_id = auth.uid())
  );

-- Polityki dla case_parties
CREATE POLICY "Users can view own case parties" ON case_parties
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_parties.case_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own case parties" ON case_parties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_parties.case_id AND user_id = auth.uid())
  );

-- Polityki dla case_documents
CREATE POLICY "Users can view own case documents" ON case_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_documents.case_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own case documents" ON case_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM legal_cases WHERE id = case_documents.case_id AND user_id = auth.uid())
  );

-- Polityki dla generated_legal_documents
CREATE POLICY "Users can view own generated docs" ON generated_legal_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated docs" ON generated_legal_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated docs" ON generated_legal_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated docs" ON generated_legal_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Polityki dla legal_chat_messages
CREATE POLICY "Users can view own chat messages" ON legal_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON legal_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON legal_chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Publiczny dostęp do wspólnej bazy (tylko SELECT)
ALTER TABLE legal_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_rulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active regulations" ON legal_regulations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active rulings" ON legal_rulings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active templates" ON legal_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view plan limits" ON legal_plan_limits
  FOR SELECT USING (true);

-- ============================================================================
-- 7. FUNKCJE POMOCNICZE
-- ============================================================================

-- Funkcja do zliczania dokumentów i etapów dla sprawy
CREATE OR REPLACE FUNCTION get_case_counts(p_case_id UUID)
RETURNS TABLE(documents_count BIGINT, proceedings_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM case_documents WHERE case_id = p_case_id),
    (SELECT COUNT(*) FROM case_proceedings WHERE case_id = p_case_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja do pobierania limitów użytkownika
CREATE OR REPLACE FUNCTION get_user_legal_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan_id TEXT;
  v_cases_count BIGINT;
  v_docs_this_month BIGINT;
  v_limits RECORD;
BEGIN
  -- Pobierz plan użytkownika (z tabeli subscriptions lub domyślnie 'free')
  SELECT COALESCE(
    (SELECT plan_id FROM subscriptions WHERE user_id = p_user_id AND status = 'active' LIMIT 1),
    'free'
  ) INTO v_plan_id;

  -- Zlicz sprawy użytkownika
  SELECT COUNT(*) INTO v_cases_count FROM legal_cases WHERE user_id = p_user_id AND status = 'active';

  -- Zlicz dokumenty w tym miesiącu
  SELECT COUNT(*) INTO v_docs_this_month
  FROM generated_legal_documents
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

  -- Pobierz limity planu
  SELECT * INTO v_limits FROM legal_plan_limits WHERE plan_id = v_plan_id;

  -- Jeśli nie ma limitów dla planu, użyj domyślnych
  IF NOT FOUND THEN
    v_limits := ROW('free', 2, 3, false, false, true, false, 0, '{}'::JSONB);
  END IF;

  RETURN jsonb_build_object(
    'plan_id', v_plan_id,
    'cases_count', v_cases_count,
    'cases_limit', v_limits.cases_limit,
    'can_create_case', (v_limits.cases_limit IS NULL OR v_cases_count < v_limits.cases_limit),
    'documents_this_month', v_docs_this_month,
    'documents_limit', v_limits.documents_per_month,
    'can_generate_document', (v_limits.documents_per_month IS NULL OR v_docs_this_month < v_limits.documents_per_month),
    'can_export_docx', v_limits.can_export_docx,
    'can_generate_documents', v_limits.can_generate_documents,
    'full_rag_access', v_limits.full_rag_access,
    'features', v_limits.features
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. TRIGGER DO AUTOMATYCZNEJ AKTUALIZACJI updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dodaj triggery do wszystkich tabel z updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['legal_cases', 'case_proceedings', 'case_parties', 'case_documents', 'generated_legal_documents', 'legal_regulations', 'legal_rulings', 'legal_templates'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END;
$$;

-- ============================================================================
-- 9. DANE POCZĄTKOWE - LIMITY PLANÓW
-- ============================================================================

INSERT INTO legal_plan_limits (plan_id, cases_limit, documents_per_month, can_export_docx, can_access_rulings, can_generate_documents, full_rag_access, price_monthly_pln, features)
VALUES
  ('free', 2, 3, false, false, true, false, 0, '{"basic_chat": true}'),
  ('pro_legal', NULL, NULL, true, true, true, true, 29.99, '{"basic_chat": true, "advanced_rag": true, "premium_templates": true}'),
  ('business_legal', NULL, NULL, true, true, true, true, 99.99, '{"basic_chat": true, "advanced_rag": true, "premium_templates": true, "api_access": true, "team_members": 5}')
ON CONFLICT (plan_id) DO UPDATE SET
  cases_limit = EXCLUDED.cases_limit,
  documents_per_month = EXCLUDED.documents_per_month,
  can_export_docx = EXCLUDED.can_export_docx,
  can_access_rulings = EXCLUDED.can_access_rulings,
  can_generate_documents = EXCLUDED.can_generate_documents,
  full_rag_access = EXCLUDED.full_rag_access,
  price_monthly_pln = EXCLUDED.price_monthly_pln,
  features = EXCLUDED.features;

-- ============================================================================
-- 10. PRZYKŁADOWE SZABLONY DOKUMENTÓW
-- ============================================================================

INSERT INTO legal_templates (title, description, document_type, category, template_content, template_fields, usage_instructions, legal_basis, is_premium, popularity_score)
VALUES
(
  'Pozew o zapłatę',
  'Podstawowy wzór pozwu o zapłatę należności pieniężnej',
  'pozew',
  ARRAY['cywilne'],
  E'{{miejscowosc}}, dnia {{data}}\n\n{{sad}}\n{{wydzial}}\n\nPowód: {{powod_imie_nazwisko}}\n{{powod_adres}}\n\nPozwany: {{pozwany_imie_nazwisko}}\n{{pozwany_adres}}\n\nWartość przedmiotu sporu: {{kwota}} PLN\n\nPOZEW\no zapłatę\n\nWnoszę o:\n1. Zasądzenie od pozwanego na rzecz powoda kwoty {{kwota}} PLN (słownie: {{kwota_slownie}}) wraz z odsetkami ustawowymi za opóźnienie od dnia {{data_wymagalnosci}} do dnia zapłaty.\n2. Zasądzenie od pozwanego na rzecz powoda kosztów procesu według norm przepisanych.\n\nUZASADNIENIE\n\n{{uzasadnienie}}\n\nDowody:\n{{dowody}}\n\n{{podpis}}',
  '[
    {"name": "miejscowosc", "label": "Miejscowość", "type": "text", "required": true},
    {"name": "data", "label": "Data", "type": "date", "required": true},
    {"name": "sad", "label": "Sąd", "type": "text", "required": true, "placeholder": "Sąd Rejonowy w..."},
    {"name": "wydzial", "label": "Wydział", "type": "text", "required": true, "placeholder": "I Wydział Cywilny"},
    {"name": "powod_imie_nazwisko", "label": "Imię i nazwisko powoda", "type": "text", "required": true},
    {"name": "powod_adres", "label": "Adres powoda", "type": "address", "required": true},
    {"name": "pozwany_imie_nazwisko", "label": "Imię i nazwisko pozwanego", "type": "text", "required": true},
    {"name": "pozwany_adres", "label": "Adres pozwanego", "type": "address", "required": true},
    {"name": "kwota", "label": "Kwota roszczenia (PLN)", "type": "number", "required": true},
    {"name": "kwota_slownie", "label": "Kwota słownie", "type": "text", "required": true},
    {"name": "data_wymagalnosci", "label": "Data wymagalności", "type": "date", "required": true},
    {"name": "uzasadnienie", "label": "Uzasadnienie", "type": "textarea", "required": true},
    {"name": "dowody", "label": "Lista dowodów", "type": "textarea", "required": false},
    {"name": "podpis", "label": "Podpis", "type": "text", "required": true}
  ]'::JSONB,
  'Wypełnij wszystkie wymagane pola. Kwotę podaj w liczbach i słownie. W uzasadnieniu opisz okoliczności powstania roszczenia.',
  'Art. 187 KPC',
  false,
  100
),
(
  'Wezwanie do zapłaty',
  'Przedsądowe wezwanie do zapłaty należności',
  'wezwanie',
  ARRAY['cywilne'],
  E'{{miejscowosc}}, dnia {{data}}\n\n{{nadawca_dane}}\n\n{{odbiorca_dane}}\n\nWEZWANIE DO ZAPŁATY\n\nNiniejszym wzywam do zapłaty kwoty {{kwota}} PLN (słownie: {{kwota_slownie}}) tytułem {{tytul_naleznosci}}.\n\nTermin płatności: {{termin_platnosci}}\n\nNumer konta: {{numer_konta}}\n\nW przypadku nieuregulowania należności w wyznaczonym terminie, sprawa zostanie skierowana na drogę postępowania sądowego, co narazi Państwa na dodatkowe koszty.\n\nZ poważaniem,\n{{podpis}}',
  '[
    {"name": "miejscowosc", "label": "Miejscowość", "type": "text", "required": true},
    {"name": "data", "label": "Data", "type": "date", "required": true},
    {"name": "nadawca_dane", "label": "Dane nadawcy", "type": "address", "required": true},
    {"name": "odbiorca_dane", "label": "Dane odbiorcy", "type": "address", "required": true},
    {"name": "kwota", "label": "Kwota (PLN)", "type": "number", "required": true},
    {"name": "kwota_slownie", "label": "Kwota słownie", "type": "text", "required": true},
    {"name": "tytul_naleznosci", "label": "Tytuł należności", "type": "text", "required": true, "placeholder": "np. niezapłaconej faktury nr..."},
    {"name": "termin_platnosci", "label": "Termin płatności", "type": "date", "required": true},
    {"name": "numer_konta", "label": "Numer konta bankowego", "type": "text", "required": true},
    {"name": "podpis", "label": "Podpis", "type": "text", "required": true}
  ]'::JSONB,
  'Wezwanie do zapłaty jest pierwszym krokiem przed skierowaniem sprawy do sądu. Daje dłużnikowi ostatnią szansę na dobrowolne uregulowanie należności.',
  'Art. 455 KC',
  false,
  95
),
(
  'Odwołanie od decyzji ZUS',
  'Wzór odwołania od decyzji Zakładu Ubezpieczeń Społecznych',
  'odwolanie',
  ARRAY['administracyjne'],
  E'{{miejscowosc}}, dnia {{data}}\n\nSąd Okręgowy w {{miasto_sadu}}\nWydział Pracy i Ubezpieczeń Społecznych\n\nza pośrednictwem\n\nZakład Ubezpieczeń Społecznych\nOddział w {{miasto_zus}}\n\nOdwołujący się: {{odwolujacy_dane}}\nPESEL: {{pesel}}\n\nOrgan rentowy: Zakład Ubezpieczeń Społecznych Oddział w {{miasto_zus}}\n\nODWOŁANIE\nod decyzji z dnia {{data_decyzji}}, znak: {{znak_decyzji}}\n\nZaskarżam w całości decyzję Zakładu Ubezpieczeń Społecznych Oddział w {{miasto_zus}} z dnia {{data_decyzji}}, znak: {{znak_decyzji}}, doręczoną mi w dniu {{data_doreczenia}}.\n\nDecyzji zarzucam:\n{{zarzuty}}\n\nWnoszę o:\n1. Zmianę zaskarżonej decyzji {{wnioski}}\n2. Zasądzenie od organu rentowego na rzecz odwołującego się kosztów postępowania.\n\nUZASADNIENIE\n\n{{uzasadnienie}}\n\n{{podpis}}',
  '[
    {"name": "miejscowosc", "label": "Miejscowość", "type": "text", "required": true},
    {"name": "data", "label": "Data", "type": "date", "required": true},
    {"name": "miasto_sadu", "label": "Miasto sądu", "type": "text", "required": true},
    {"name": "miasto_zus", "label": "Miasto oddziału ZUS", "type": "text", "required": true},
    {"name": "odwolujacy_dane", "label": "Dane odwołującego", "type": "address", "required": true},
    {"name": "pesel", "label": "PESEL", "type": "text", "required": true},
    {"name": "data_decyzji", "label": "Data decyzji", "type": "date", "required": true},
    {"name": "znak_decyzji", "label": "Znak/numer decyzji", "type": "text", "required": true},
    {"name": "data_doreczenia", "label": "Data doręczenia decyzji", "type": "date", "required": true},
    {"name": "zarzuty", "label": "Zarzuty wobec decyzji", "type": "textarea", "required": true},
    {"name": "wnioski", "label": "Wnioski (czego żądasz)", "type": "textarea", "required": true},
    {"name": "uzasadnienie", "label": "Uzasadnienie", "type": "textarea", "required": true},
    {"name": "podpis", "label": "Podpis", "type": "text", "required": true}
  ]'::JSONB,
  'Odwołanie należy złożyć w terminie miesiąca od dnia doręczenia decyzji. Składa się je za pośrednictwem ZUS do właściwego sądu.',
  'Art. 83 ustawy o systemie ubezpieczeń społecznych',
  false,
  80
),
(
  'Wniosek o zwolnienie z kosztów sądowych',
  'Wniosek o zwolnienie od kosztów sądowych w całości lub części',
  'wniosek',
  ARRAY['cywilne'],
  E'{{miejscowosc}}, dnia {{data}}\n\n{{sad}}\n{{wydzial}}\n\nSygn. akt: {{sygnatura}}\n\nWnioskodawca: {{wnioskodawca_dane}}\n\nWNIOSEK\no zwolnienie od kosztów sądowych\n\nWnoszę o zwolnienie mnie od kosztów sądowych w całości w sprawie {{opis_sprawy}}.\n\nUZASADNIENIE\n\nNie jestem w stanie ponieść kosztów sądowych bez uszczerbku utrzymania koniecznego dla siebie i rodziny.\n\nMoja sytuacja materialna przedstawia się następująco:\n{{sytuacja_materialna}}\n\nMiesięczne dochody: {{dochody}} PLN\nMiesięczne wydatki: {{wydatki}} PLN\nOsoby na utrzymaniu: {{osoby_na_utrzymaniu}}\n\nW załączeniu przedkładam oświadczenie o stanie rodzinnym, majątku, dochodach i źródłach utrzymania.\n\n{{podpis}}\n\nZałączniki:\n1. Oświadczenie o stanie rodzinnym, majątku, dochodach i źródłach utrzymania\n2. {{inne_zalaczniki}}',
  '[
    {"name": "miejscowosc", "label": "Miejscowość", "type": "text", "required": true},
    {"name": "data", "label": "Data", "type": "date", "required": true},
    {"name": "sad", "label": "Sąd", "type": "text", "required": true},
    {"name": "wydzial", "label": "Wydział", "type": "text", "required": true},
    {"name": "sygnatura", "label": "Sygnatura akt (jeśli nadana)", "type": "text", "required": false},
    {"name": "wnioskodawca_dane", "label": "Dane wnioskodawcy", "type": "address", "required": true},
    {"name": "opis_sprawy", "label": "Krótki opis sprawy", "type": "text", "required": true},
    {"name": "sytuacja_materialna", "label": "Opis sytuacji materialnej", "type": "textarea", "required": true},
    {"name": "dochody", "label": "Miesięczne dochody (PLN)", "type": "number", "required": true},
    {"name": "wydatki", "label": "Miesięczne wydatki (PLN)", "type": "number", "required": true},
    {"name": "osoby_na_utrzymaniu", "label": "Liczba osób na utrzymaniu", "type": "number", "required": true},
    {"name": "inne_zalaczniki", "label": "Inne załączniki", "type": "textarea", "required": false},
    {"name": "podpis", "label": "Podpis", "type": "text", "required": true}
  ]'::JSONB,
  'Do wniosku należy obowiązkowo dołączyć oświadczenie o stanie rodzinnym, majątku, dochodach i źródłach utrzymania na urzędowym formularzu.',
  'Art. 102 ustawy o kosztach sądowych w sprawach cywilnych',
  false,
  75
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GOTOWE! Schemat Legal Assistant został utworzony.
-- ============================================================================
