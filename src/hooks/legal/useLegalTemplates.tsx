/**
 * Hook do obsługi szablonów dokumentów prawnych
 * Wrapper nad useLegalLibrary z dodatkowymi funkcjami dla generatora dokumentów
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLegalLibrary, LibrarySearchFilters } from './useLegalLibrary';
import {
  LegalTemplate,
  LegalCategory,
  GeneratedLegalDocument,
} from '@/types/legal';

// ============================================================================
// TYPY
// ============================================================================

export interface TemplateFilters extends LibrarySearchFilters {
  isPremium?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export const useLegalTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { useTemplates, useTemplateById, useIncrementTemplatePopularity } = useLegalLibrary();

  // --------------------------------------------------------------------------
  // SZABLONY
  // --------------------------------------------------------------------------

  /**
   * Pobierz szablony z filtrowaniem
   */
  const getTemplates = (
    filters: TemplateFilters = {},
    page = 1,
    pageSize = 20
  ) => {
    return useTemplates(filters, page, pageSize);
  };

  /**
   * Pobierz szablon po ID
   */
  const getTemplateById = (id: string | null) => {
    return useTemplateById(id);
  };

  /**
   * Zwiększ popularność szablonu
   */
  const incrementPopularity = useIncrementTemplatePopularity();

  // --------------------------------------------------------------------------
  // WYGENEROWANE DOKUMENTY
  // --------------------------------------------------------------------------

  /**
   * Pobierz wygenerowane dokumenty użytkownika
   */
  const useGeneratedDocuments = (caseId?: string) => {
    return useQuery({
      queryKey: ['generated-documents', user?.id, caseId],
      queryFn: async (): Promise<GeneratedLegalDocument[]> => {
        if (!user) return [];

        let query = supabase
          .from('generated_legal_documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (caseId) {
          query = query.eq('case_id', caseId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching generated documents:', error);
          throw error;
        }

        return (data || []) as GeneratedLegalDocument[];
      },
      enabled: !!user,
    });
  };

  /**
   * Pobierz pojedynczy wygenerowany dokument
   */
  const useGeneratedDocumentById = (id: string | null) => {
    return useQuery({
      queryKey: ['generated-document', id],
      queryFn: async (): Promise<GeneratedLegalDocument | null> => {
        if (!id || !user) return null;

        const { data, error } = await supabase
          .from('generated_legal_documents')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching generated document:', error);
          throw error;
        }

        return data as GeneratedLegalDocument;
      },
      enabled: !!id && !!user,
    });
  };

  /**
   * Usuń wygenerowany dokument
   */
  const useDeleteGeneratedDocument = () => {
    return useMutation({
      mutationFn: async (documentId: string) => {
        if (!user) throw new Error('Nie zalogowano');

        // Pobierz dokument żeby usunąć plik z storage
        const { data: doc, error: fetchError } = await supabase
          .from('generated_legal_documents')
          .select('docx_file_path')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        // Usuń plik z storage jeśli istnieje
        if (doc?.docx_file_path) {
          await supabase.storage
            .from('generated-documents')
            .remove([doc.docx_file_path]);
        }

        // Usuń rekord z bazy
        const { error: deleteError } = await supabase
          .from('generated_legal_documents')
          .delete()
          .eq('id', documentId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      },
    });
  };

  /**
   * Pobierz URL do pobrania dokumentu DOCX
   */
  const getDocxDownloadUrl = async (filePath: string): Promise<string | null> => {
    if (!filePath) return null;

    const { data } = supabase.storage
      .from('generated-documents')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  };

  return {
    // Szablony
    getTemplates,
    getTemplateById,
    incrementPopularity,

    // Wygenerowane dokumenty
    useGeneratedDocuments,
    useGeneratedDocumentById,
    useDeleteGeneratedDocument,
    getDocxDownloadUrl,
  };
};

export default useLegalTemplates;
