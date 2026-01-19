-- ============================================================================
-- LEGAL MODULE - CORE TABLES MIGRATION
-- Moduł pomocy prawnej dla SuperRAG_v3 (InsightsLM)
-- ============================================================================

-- Enable required extensions (jeśli jeszcze nie włączone)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Typ dokumentu prawnego
DO $$ BEGIN
    CREATE TYPE legal_document_type AS ENUM (
        'ustawa',
        'rozporzadzenie',
        'kodeks',
        'orzeczenie',
        'template',
        'umowa',
        'pozew',
        'wniosek',
        'odwolanie',
        'wezwanie',
        'pismo',
        'skarga'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Kategoria prawna
DO $$ BEGIN
    CREATE TYPE legal_category AS ENUM (
        'cywilne',
        'administracyjne',
        'pracownicze',
        'konsumenckie',
        'rodzinne',
        'spadkowe',
        'nieruchomosci',
        'umowy',
        'karne',
        'wykroczenia'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status sprawy
DO $$ BEGIN
    CREATE TYPE case_status AS ENUM (
        'active',
        'archived',
        'won',
        'lost',
        'settled',
        'dismissed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Typ etapu postępowania
DO $$ BEGIN
    CREATE TYPE proceeding_stage_type AS ENUM (
        'policja',
        'prokuratura',
        'sad_rejonowy',
        'sad_okregowy',
        'sad_apelacyjny',
        'sad_najwyzszy',
        'organ_administracyjny',
        'wsa',
        'nsa',
        'komornik',
        'mediacja',
        'arbitraz',
        'inne'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wynik etapu postępowania
DO $$ BEGIN
    CREATE TYPE proceeding_outcome AS ENUM (
        'w_toku',
        'przekazano',
        'umorzono',
        'wyrok_korzystny',
        'wyrok_niekorzystny',
        'ugoda',
        'apelacja',
        'kasacja',
        'zakonczone'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Typ strony postępowania
DO $$ BEGIN
    CREATE TYPE party_type AS ENUM (
        'powod',
        'pozwany',
        'wnioskodawca',
        'uczestnik',
        'oskarzyciel',
        'oskarzony',
        'pokrzywdzony',
        'swiadek',
        'biegly',
        'interwenient',
        'kurator',
        'pelnomonik'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- WSPÓLNA BAZA PRAWNA (PUBLIC - dla wszystkich użytkowników)
-- ============================================================================

-- Tabela przepisów prawnych
CREATE TABLE IF NOT EXISTS public.legal_regulations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    short_name text,
    document_type legal_document_type NOT NULL,
    category legal_category[] NOT NULL DEFAULT '{}',
    source_url text,
    source_identifier text,
    publication_date date,
    effective_date date,
    content text NOT NULL,
    content_html text,
    articles_json jsonb,
    metadata jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela orzecznictw sądowych
CREATE TABLE IF NOT EXISTS public.legal_rulings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_name text NOT NULL,
    case_number text NOT NULL,
    ruling_date date NOT NULL,
    ruling_type text,
    category legal_category[] NOT NULL DEFAULT '{}',
    summary text,
    content text NOT NULL,
    related_regulations uuid[],
    keywords text[],
    source_url text,
    metadata jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela szablonów dokumentów prawnych
CREATE TABLE IF NOT EXISTS public.legal_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    document_type legal_document_type NOT NULL,
    category legal_category[] NOT NULL DEFAULT '{}',
    template_content text NOT NULL,
    template_fields jsonb NOT NULL DEFAULT '[]',
    example_filled text,
    usage_instructions text,
    legal_basis text,
    related_regulations uuid[],
    is_premium boolean DEFAULT false,
    popularity_score integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Embeddingi dla wspólnej bazy prawnej
CREATE TABLE IF NOT EXISTS public.legal_documents_embeddings (
    id bigserial PRIMARY KEY,
    source_type text NOT NULL,
    source_id uuid NOT NULL,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding vector(1536),
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDYWIDUALNE SPRAWY UŻYTKOWNIKÓW
-- ============================================================================

-- Tabela spraw prawnych użytkownika
CREATE TABLE IF NOT EXISTS public.legal_cases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category legal_category NOT NULL,
    status case_status DEFAULT 'active',
    opponent_name text,
    opponent_type text,
    parent_case_id uuid REFERENCES public.legal_cases(id) ON DELETE SET NULL,
    deadline_date date,
    icon text DEFAULT '⚖️',
    color text DEFAULT 'blue',
    notes text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela etapów postępowania (sygnatury, instancje)
CREATE TABLE IF NOT EXISTS public.case_proceedings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id uuid NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
    stage_type proceeding_stage_type NOT NULL,
    institution_name text NOT NULL,
    case_number text,
    started_at date,
    ended_at date,
    outcome proceeding_outcome DEFAULT 'w_toku',
    notes text,
    previous_proceeding_id uuid REFERENCES public.case_proceedings(id) ON DELETE SET NULL,
    merged_from_case_ids uuid[],
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela stron postępowania
CREATE TABLE IF NOT EXISTS public.case_parties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id uuid NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
    party_type party_type NOT NULL,
    name text NOT NULL,
    address text,
    pesel_or_nip text,
    contact_info text,
    is_user boolean DEFAULT false,
    notes text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Dokumenty dołączone do sprawy
CREATE TABLE IF NOT EXISTS public.case_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id uuid NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
    title text NOT NULL,
    document_type text NOT NULL,
    file_path text,
    file_size bigint,
    content text,
    summary text,
    processing_status text DEFAULT 'pending',
    document_date date,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Embeddingi dla dokumentów użytkownika (prywatne)
CREATE TABLE IF NOT EXISTS public.case_documents_embeddings (
    id bigserial PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
    document_id uuid NOT NULL REFERENCES public.case_documents(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding vector(1536),
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Historia czatu prawnego
CREATE TABLE IF NOT EXISTS public.legal_chat_histories (
    id serial PRIMARY KEY,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message jsonb NOT NULL,
    sources_used jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Wygenerowane dokumenty użytkownika
CREATE TABLE IF NOT EXISTS public.generated_legal_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id uuid REFERENCES public.legal_cases(id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id uuid REFERENCES public.legal_templates(id),
    title text NOT NULL,
    document_type legal_document_type NOT NULL,
    content text NOT NULL,
    form_data jsonb,
    docx_file_path text,
    pdf_file_path text,
    version integer DEFAULT 1,
    is_draft boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- TABELE ADMINISTRACYJNE
-- ============================================================================

-- Role administratorów modułu prawnego
CREATE TABLE IF NOT EXISTS public.legal_admins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'editor',
    permissions jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Logi importu danych prawnych
CREATE TABLE IF NOT EXISTS public.legal_import_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_type text NOT NULL,
    source_url text,
    records_imported integer DEFAULT 0,
    records_failed integer DEFAULT 0,
    error_details jsonb,
    imported_by uuid REFERENCES public.profiles(id),
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

-- Limity planów prawnych
CREATE TABLE IF NOT EXISTS public.legal_plan_limits (
    plan_id text PRIMARY KEY,
    cases_limit integer,
    documents_per_month integer,
    can_export_docx boolean DEFAULT false,
    can_access_rulings boolean DEFAULT true,
    can_generate_documents boolean DEFAULT false,
    full_rag_access boolean DEFAULT false,
    price_monthly_pln decimal(10,2),
    features jsonb DEFAULT '{}'
);

-- Domyślne plany
INSERT INTO public.legal_plan_limits (plan_id, cases_limit, documents_per_month, can_export_docx, can_access_rulings, can_generate_documents, full_rag_access, price_monthly_pln, features)
VALUES
    ('free', 2, 3, false, true, false, false, 0, '{"basic_search": true, "view_regulations": true}'),
    ('pro_legal', NULL, NULL, true, true, true, true, 29.99, '{"full_search": true, "document_generator": true, "export_docx": true}'),
    ('business_legal', NULL, NULL, true, true, true, true, 99.99, '{"api_access": true, "priority_support": true, "custom_templates": true}')
ON CONFLICT (plan_id) DO UPDATE SET
    cases_limit = EXCLUDED.cases_limit,
    documents_per_month = EXCLUDED.documents_per_month,
    can_export_docx = EXCLUDED.can_export_docx,
    price_monthly_pln = EXCLUDED.price_monthly_pln;

-- ============================================================================
-- ROZSZERZENIE TABELI SUBSCRIPTIONS
-- ============================================================================

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS legal_plan_id text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS legal_cases_limit integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS legal_documents_generated integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS legal_documents_limit integer DEFAULT 3;

-- ============================================================================
-- INDEXY
-- ============================================================================

-- Indexy dla przepisów
CREATE INDEX IF NOT EXISTS idx_legal_regulations_category ON public.legal_regulations USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_legal_regulations_type ON public.legal_regulations(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_regulations_active ON public.legal_regulations(is_active);
CREATE INDEX IF NOT EXISTS idx_legal_regulations_search ON public.legal_regulations USING GIN(to_tsvector('polish', title || ' ' || COALESCE(content, '')));

-- Indexy dla orzecznictw
CREATE INDEX IF NOT EXISTS idx_legal_rulings_category ON public.legal_rulings USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_legal_rulings_court ON public.legal_rulings(court_name);
CREATE INDEX IF NOT EXISTS idx_legal_rulings_date ON public.legal_rulings(ruling_date DESC);
CREATE INDEX IF NOT EXISTS idx_legal_rulings_keywords ON public.legal_rulings USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_legal_rulings_search ON public.legal_rulings USING GIN(to_tsvector('polish', case_number || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));

-- Indexy dla szablonów
CREATE INDEX IF NOT EXISTS idx_legal_templates_category ON public.legal_templates USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_legal_templates_type ON public.legal_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_templates_premium ON public.legal_templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_legal_templates_popularity ON public.legal_templates(popularity_score DESC);

-- Indexy dla spraw użytkownika
CREATE INDEX IF NOT EXISTS idx_legal_cases_user ON public.legal_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_cases_status ON public.legal_cases(status);
CREATE INDEX IF NOT EXISTS idx_legal_cases_category ON public.legal_cases(category);
CREATE INDEX IF NOT EXISTS idx_legal_cases_updated ON public.legal_cases(updated_at DESC);

-- Indexy dla etapów postępowania
CREATE INDEX IF NOT EXISTS idx_case_proceedings_case ON public.case_proceedings(case_id);
CREATE INDEX IF NOT EXISTS idx_case_proceedings_stage ON public.case_proceedings(stage_type);

-- Indexy dla stron postępowania
CREATE INDEX IF NOT EXISTS idx_case_parties_case ON public.case_parties(case_id);

-- Indexy dla dokumentów sprawy
CREATE INDEX IF NOT EXISTS idx_case_documents_case ON public.case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_status ON public.case_documents(processing_status);

-- Indexy wektorowe
CREATE INDEX IF NOT EXISTS idx_legal_embeddings ON public.legal_documents_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_case_embeddings ON public.case_documents_embeddings USING hnsw (embedding vector_cosine_ops);

-- Indexy dla czatu
CREATE INDEX IF NOT EXISTS idx_legal_chat_session ON public.legal_chat_histories(session_id);
CREATE INDEX IF NOT EXISTS idx_legal_chat_user ON public.legal_chat_histories(user_id);

-- Indexy dla wygenerowanych dokumentów
CREATE INDEX IF NOT EXISTS idx_generated_docs_user ON public.generated_legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_docs_case ON public.generated_legal_documents(case_id);

-- ============================================================================
-- FUNKCJE
-- ============================================================================

-- Funkcja sprawdzająca czy użytkownik jest właścicielem sprawy
CREATE OR REPLACE FUNCTION public.is_case_owner(case_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.legal_cases
        WHERE id = case_id_param
        AND user_id = auth.uid()
    );
$$;

-- Funkcja do wyszukiwania w bazie prawnej
CREATE OR REPLACE FUNCTION public.search_legal_library(
    query_embedding vector,
    query_text text DEFAULT '',
    categories legal_category[] DEFAULT NULL,
    source_types text[] DEFAULT ARRAY['regulation', 'ruling', 'template'],
    match_count integer DEFAULT 10
)
RETURNS TABLE(
    id bigint,
    source_type text,
    source_id uuid,
    content text,
    metadata jsonb,
    similarity double precision,
    text_rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.source_type,
        e.source_id,
        e.content,
        e.metadata,
        1 - (e.embedding <=> query_embedding) as similarity,
        COALESCE(ts_rank(to_tsvector('polish', e.content), plainto_tsquery('polish', query_text)), 0) as text_rank
    FROM public.legal_documents_embeddings e
    WHERE
        e.source_type = ANY(source_types)
        AND (
            categories IS NULL
            OR e.metadata->>'category' = ANY(SELECT unnest(categories)::text)
        )
    ORDER BY
        (0.7 * (1 - (e.embedding <=> query_embedding))) +
        (0.3 * COALESCE(ts_rank(to_tsvector('polish', e.content), plainto_tsquery('polish', query_text)), 0))
        DESC
    LIMIT match_count;
END;
$$;

-- Funkcja do wyszukiwania w dokumentach sprawy użytkownika
CREATE OR REPLACE FUNCTION public.search_case_documents(
    query_embedding vector,
    case_id_param uuid,
    match_count integer DEFAULT 5
)
RETURNS TABLE(
    id bigint,
    document_id uuid,
    content text,
    metadata jsonb,
    similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.document_id,
        e.content,
        e.metadata,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM public.case_documents_embeddings e
    WHERE e.case_id = case_id_param
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Funkcja hybrydowego RAG (łączy bazę prawną + dokumenty sprawy)
CREATE OR REPLACE FUNCTION public.hybrid_legal_search(
    query_embedding vector,
    case_id_param uuid DEFAULT NULL,
    categories legal_category[] DEFAULT NULL,
    include_regulations boolean DEFAULT true,
    include_rulings boolean DEFAULT true,
    include_templates boolean DEFAULT false,
    include_case_docs boolean DEFAULT true,
    legal_match_count integer DEFAULT 7,
    case_match_count integer DEFAULT 3
)
RETURNS TABLE(
    source text,
    id bigint,
    content text,
    metadata jsonb,
    similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    source_types text[] := ARRAY[]::text[];
BEGIN
    IF include_regulations THEN
        source_types := array_append(source_types, 'regulation');
    END IF;
    IF include_rulings THEN
        source_types := array_append(source_types, 'ruling');
    END IF;
    IF include_templates THEN
        source_types := array_append(source_types, 'template');
    END IF;

    RETURN QUERY
    SELECT
        'legal_library'::text as source,
        r.id,
        r.content,
        r.metadata,
        r.similarity
    FROM public.search_legal_library(
        query_embedding,
        '',
        categories,
        source_types,
        legal_match_count
    ) r

    UNION ALL

    SELECT
        'case_document'::text as source,
        c.id,
        c.content,
        c.metadata,
        c.similarity
    FROM public.search_case_documents(
        query_embedding,
        case_id_param,
        case_match_count
    ) c
    WHERE case_id_param IS NOT NULL AND include_case_docs

    ORDER BY similarity DESC;
END;
$$;

-- Funkcja sprawdzająca limity użytkownika
CREATE OR REPLACE FUNCTION public.check_legal_limits(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_sub record;
    plan_limits record;
    cases_count integer;
    docs_this_month integer;
    result jsonb;
BEGIN
    SELECT * INTO user_sub FROM public.subscriptions WHERE user_id = user_id_param;

    SELECT * INTO plan_limits FROM public.legal_plan_limits
    WHERE plan_id = COALESCE(user_sub.legal_plan_id, 'free');

    SELECT COUNT(*) INTO cases_count FROM public.legal_cases
    WHERE user_id = user_id_param AND status = 'active';

    SELECT COUNT(*) INTO docs_this_month FROM public.generated_legal_documents
    WHERE user_id = user_id_param
    AND created_at >= date_trunc('month', now());

    result := jsonb_build_object(
        'plan_id', COALESCE(user_sub.legal_plan_id, 'free'),
        'cases_count', cases_count,
        'cases_limit', plan_limits.cases_limit,
        'can_create_case', plan_limits.cases_limit IS NULL OR cases_count < plan_limits.cases_limit,
        'documents_this_month', docs_this_month,
        'documents_limit', plan_limits.documents_per_month,
        'can_generate_document', plan_limits.documents_per_month IS NULL OR docs_this_month < plan_limits.documents_per_month,
        'can_export_docx', plan_limits.can_export_docx,
        'can_generate_documents', plan_limits.can_generate_documents,
        'full_rag_access', plan_limits.full_rag_access,
        'features', plan_limits.features
    );

    RETURN result;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.legal_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_rulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_proceedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_plan_limits ENABLE ROW LEVEL SECURITY;

-- WSPÓLNA BAZA PRAWNA - dostęp dla wszystkich zalogowanych
CREATE POLICY "Anyone can read regulations" ON public.legal_regulations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read rulings" ON public.legal_rulings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read templates" ON public.legal_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read legal embeddings" ON public.legal_documents_embeddings
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read plan limits" ON public.legal_plan_limits
    FOR SELECT USING (true);

-- Tylko admini mogą modyfikować wspólną bazę
CREATE POLICY "Admins can manage regulations" ON public.legal_regulations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.legal_admins
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage rulings" ON public.legal_rulings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.legal_admins
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage templates" ON public.legal_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.legal_admins
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage legal embeddings" ON public.legal_documents_embeddings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.legal_admins
            WHERE user_id = auth.uid()
        )
    );

-- DANE UŻYTKOWNIKA - tylko właściciel
CREATE POLICY "Users can manage their own cases" ON public.legal_cases
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage proceedings in their cases" ON public.case_proceedings
    FOR ALL USING (public.is_case_owner(case_id));

CREATE POLICY "Users can manage parties in their cases" ON public.case_parties
    FOR ALL USING (public.is_case_owner(case_id));

CREATE POLICY "Users can manage documents in their cases" ON public.case_documents
    FOR ALL USING (public.is_case_owner(case_id));

CREATE POLICY "Users can view embeddings of their case documents" ON public.case_documents_embeddings
    FOR SELECT USING (public.is_case_owner(case_id));

CREATE POLICY "Users can manage their chat history" ON public.legal_chat_histories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their generated documents" ON public.generated_legal_documents
    FOR ALL USING (auth.uid() = user_id);

-- ADMIN
CREATE POLICY "Admins can view admin table" ON public.legal_admins
    FOR SELECT USING (auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM public.legal_admins WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super admins can manage admins" ON public.legal_admins
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.legal_admins WHERE user_id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Admins can view import logs" ON public.legal_import_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.legal_admins WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage import logs" ON public.legal_import_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.legal_admins WHERE user_id = auth.uid())
    );

-- ============================================================================
-- TRIGGERY
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_legal_regulations_updated_at
    BEFORE UPDATE ON public.legal_regulations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_rulings_updated_at
    BEFORE UPDATE ON public.legal_rulings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_templates_updated_at
    BEFORE UPDATE ON public.legal_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_cases_updated_at
    BEFORE UPDATE ON public.legal_cases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_proceedings_updated_at
    BEFORE UPDATE ON public.case_proceedings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_parties_updated_at
    BEFORE UPDATE ON public.case_parties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_documents_updated_at
    BEFORE UPDATE ON public.case_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
    BEFORE UPDATE ON public.generated_legal_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER TABLE public.legal_cases REPLICA IDENTITY FULL;
ALTER TABLE public.case_proceedings REPLICA IDENTITY FULL;
ALTER TABLE public.case_parties REPLICA IDENTITY FULL;
ALTER TABLE public.case_documents REPLICA IDENTITY FULL;
ALTER TABLE public.legal_chat_histories REPLICA IDENTITY FULL;
ALTER TABLE public.generated_legal_documents REPLICA IDENTITY FULL;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'case-documents',
    'case-documents',
    false,
    52428800,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'generated-documents',
    'generated-documents',
    false,
    20971520,
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Users can manage their case documents"
ON storage.objects FOR ALL
USING (
    bucket_id = 'case-documents' AND
    (storage.foldername(name))[1]::uuid IN (
        SELECT id FROM public.legal_cases WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access their generated documents"
ON storage.objects FOR ALL
USING (
    bucket_id = 'generated-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
