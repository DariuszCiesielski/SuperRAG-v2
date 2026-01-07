-- ============================================================================
-- ACCOUNT DELETION SUPPORT MIGRATION
-- Adds proper CASCADE relationships and helper functions for complete account deletion
-- ============================================================================

-- 1. Fix documents table - Add user_id with CASCADE
-- Currently documents table has NO user_id, only metadata->>'notebook_id'
-- We need to add user_id column for proper CASCADE deletion

ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

-- Backfill existing documents with user_id from notebooks
UPDATE public.documents
SET user_id = notebooks.user_id
FROM public.notebooks
WHERE (documents.metadata->>'notebook_id')::uuid = notebooks.id
  AND documents.user_id IS NULL;

-- 2. n8n_chat_histories already has session_id (notebook_id)
-- The CASCADE will work through notebooks, but let's add user_id for clarity
ALTER TABLE public.n8n_chat_histories
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_chat_histories_user_id ON public.n8n_chat_histories(user_id);

-- Backfill existing chat histories with user_id from notebooks
UPDATE public.n8n_chat_histories
SET user_id = notebooks.user_id
FROM public.notebooks
WHERE n8n_chat_histories.session_id = notebooks.id
  AND n8n_chat_histories.user_id IS NULL;

-- 3. Create function to get all user storage files before deletion
CREATE OR REPLACE FUNCTION public.get_user_storage_files(user_id_param uuid)
RETURNS TABLE(
    bucket_name text,
    file_path text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Get all source files from notebooks owned by user
    RETURN QUERY
    SELECT
        'sources'::text as bucket_name,
        s.file_path
    FROM public.sources s
    INNER JOIN public.notebooks n ON s.notebook_id = n.id
    WHERE n.user_id = user_id_param
      AND s.file_path IS NOT NULL;

    -- Get all audio files from notebooks owned by user
    RETURN QUERY
    SELECT
        'audio'::text as bucket_name,
        n.audio_overview_url
    FROM public.notebooks n
    WHERE n.user_id = user_id_param
      AND n.audio_overview_url IS NOT NULL;
END;
$$;

-- 4. Update RLS policies for documents to use new user_id column
DROP POLICY IF EXISTS "Users can view documents from their notebooks" ON public.documents;
CREATE POLICY "Users can view documents from their notebooks"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create documents in their notebooks" ON public.documents;
CREATE POLICY "Users can create documents in their notebooks"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update documents in their notebooks" ON public.documents;
CREATE POLICY "Users can update documents in their notebooks"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete documents from their notebooks" ON public.documents;
CREATE POLICY "Users can delete documents from their notebooks"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Update RLS policies for chat histories to use new user_id column
DROP POLICY IF EXISTS "Users can view chat histories from their notebooks" ON public.n8n_chat_histories;
CREATE POLICY "Users can view chat histories from their notebooks"
    ON public.n8n_chat_histories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create chat histories in their notebooks" ON public.n8n_chat_histories;
CREATE POLICY "Users can create chat histories in their notebooks"
    ON public.n8n_chat_histories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete chat histories from their notebooks" ON public.n8n_chat_histories;
CREATE POLICY "Users can delete chat histories from their notebooks"
    ON public.n8n_chat_histories FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Create triggers to automatically populate user_id on INSERT
CREATE OR REPLACE FUNCTION public.set_document_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Get user_id from notebook
    SELECT user_id INTO new.user_id
    FROM public.notebooks
    WHERE id = (new.metadata->>'notebook_id')::uuid;

    RETURN new;
END;
$$;

CREATE TRIGGER set_document_user_id_trigger
    BEFORE INSERT ON public.documents
    FOR EACH ROW
    WHEN (new.user_id IS NULL)
    EXECUTE FUNCTION public.set_document_user_id();

CREATE OR REPLACE FUNCTION public.set_chat_history_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Get user_id from notebook (session_id is notebook_id)
    SELECT user_id INTO new.user_id
    FROM public.notebooks
    WHERE id = new.session_id;

    RETURN new;
END;
$$;

CREATE TRIGGER set_chat_history_user_id_trigger
    BEFORE INSERT ON public.n8n_chat_histories
    FOR EACH ROW
    WHEN (new.user_id IS NULL)
    EXECUTE FUNCTION public.set_chat_history_user_id();
