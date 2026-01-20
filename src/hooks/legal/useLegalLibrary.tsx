/**
 * Hook do obsługi biblioteki prawnej
 * Pobieranie przepisów, orzeczeń i szablonów
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LegalRegulation,
  LegalRuling,
  LegalTemplate,
  LegalCategory,
  LegalDocumentType,
} from '@/types/legal';

// ============================================================================
// TYPY
// ============================================================================

export interface LibrarySearchFilters {
  query?: string;
  categories?: LegalCategory[];
  documentType?: LegalDocumentType;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
}

export interface LibrarySearchResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// HOOK
// ============================================================================

export const useLegalLibrary = () => {
  const queryClient = useQueryClient();

  // --------------------------------------------------------------------------
  // PRZEPISY (Regulations)
  // --------------------------------------------------------------------------

  const useRegulations = (filters: LibrarySearchFilters = {}, page = 1, pageSize = 20) => {
    return useQuery({
      queryKey: ['legal-regulations', filters, page, pageSize],
      queryFn: async (): Promise<LibrarySearchResult<LegalRegulation>> => {
        let query = supabase
          .from('legal_regulations')
          .select('*', { count: 'exact' })
          .eq('is_active', filters.isActive ?? true)
          .order('publication_date', { ascending: false });

        // Filtr tekstowy
        if (filters.query) {
          query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%,short_name.ilike.%${filters.query}%`);
        }

        // Filtr kategorii
        if (filters.categories && filters.categories.length > 0) {
          query = query.overlaps('category', filters.categories);
        }

        // Filtr typu dokumentu
        if (filters.documentType) {
          query = query.eq('document_type', filters.documentType);
        }

        // Filtr daty
        if (filters.dateFrom) {
          query = query.gte('publication_date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('publication_date', filters.dateTo);
        }

        // Paginacja
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching regulations:', error);
          throw error;
        }

        return {
          data: (data || []) as LegalRegulation[],
          totalCount: count || 0,
          page,
          pageSize,
        };
      },
    });
  };

  const useRegulationById = (id: string | null) => {
    return useQuery({
      queryKey: ['legal-regulation', id],
      queryFn: async (): Promise<LegalRegulation | null> => {
        if (!id) return null;

        const { data, error } = await supabase
          .from('legal_regulations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching regulation:', error);
          throw error;
        }

        return data as LegalRegulation;
      },
      enabled: !!id,
    });
  };

  // --------------------------------------------------------------------------
  // ORZECZENIA (Rulings)
  // --------------------------------------------------------------------------

  const useRulings = (filters: LibrarySearchFilters = {}, page = 1, pageSize = 20) => {
    return useQuery({
      queryKey: ['legal-rulings', filters, page, pageSize],
      queryFn: async (): Promise<LibrarySearchResult<LegalRuling>> => {
        let query = supabase
          .from('legal_rulings')
          .select('*', { count: 'exact' })
          .eq('is_active', filters.isActive ?? true)
          .order('ruling_date', { ascending: false });

        // Filtr tekstowy
        if (filters.query) {
          query = query.or(`court_name.ilike.%${filters.query}%,case_number.ilike.%${filters.query}%,summary.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
        }

        // Filtr kategorii
        if (filters.categories && filters.categories.length > 0) {
          query = query.overlaps('category', filters.categories);
        }

        // Filtr daty
        if (filters.dateFrom) {
          query = query.gte('ruling_date', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('ruling_date', filters.dateTo);
        }

        // Paginacja
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching rulings:', error);
          throw error;
        }

        return {
          data: (data || []) as LegalRuling[],
          totalCount: count || 0,
          page,
          pageSize,
        };
      },
    });
  };

  const useRulingById = (id: string | null) => {
    return useQuery({
      queryKey: ['legal-ruling', id],
      queryFn: async (): Promise<LegalRuling | null> => {
        if (!id) return null;

        const { data, error } = await supabase
          .from('legal_rulings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching ruling:', error);
          throw error;
        }

        return data as LegalRuling;
      },
      enabled: !!id,
    });
  };

  // --------------------------------------------------------------------------
  // SZABLONY (Templates)
  // --------------------------------------------------------------------------

  const useTemplates = (filters: LibrarySearchFilters & { isPremium?: boolean } = {}, page = 1, pageSize = 20) => {
    return useQuery({
      queryKey: ['legal-templates', filters, page, pageSize],
      queryFn: async (): Promise<LibrarySearchResult<LegalTemplate>> => {
        let query = supabase
          .from('legal_templates')
          .select('*', { count: 'exact' })
          .eq('is_active', filters.isActive ?? true)
          .order('popularity_score', { ascending: false });

        // Filtr tekstowy
        if (filters.query) {
          query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
        }

        // Filtr kategorii
        if (filters.categories && filters.categories.length > 0) {
          query = query.overlaps('category', filters.categories);
        }

        // Filtr typu dokumentu
        if (filters.documentType) {
          query = query.eq('document_type', filters.documentType);
        }

        // Filtr premium
        if (filters.isPremium !== undefined) {
          query = query.eq('is_premium', filters.isPremium);
        }

        // Paginacja
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Error fetching templates:', error);
          throw error;
        }

        return {
          data: (data || []) as LegalTemplate[],
          totalCount: count || 0,
          page,
          pageSize,
        };
      },
    });
  };

  const useTemplateById = (id: string | null) => {
    return useQuery({
      queryKey: ['legal-template', id],
      queryFn: async (): Promise<LegalTemplate | null> => {
        if (!id) return null;

        const { data, error } = await supabase
          .from('legal_templates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching template:', error);
          throw error;
        }

        return data as LegalTemplate;
      },
      enabled: !!id,
    });
  };

  // Zwiększ popularność szablonu
  const useIncrementTemplatePopularity = () => {
    return useMutation({
      mutationFn: async (templateId: string) => {
        const { data: template, error: fetchError } = await supabase
          .from('legal_templates')
          .select('popularity_score')
          .eq('id', templateId)
          .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
          .from('legal_templates')
          .update({ popularity_score: (template.popularity_score || 0) + 1 })
          .eq('id', templateId);

        if (updateError) throw updateError;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['legal-templates'] });
      },
    });
  };

  return {
    // Przepisy
    useRegulations,
    useRegulationById,
    // Orzeczenia
    useRulings,
    useRulingById,
    // Szablony
    useTemplates,
    useTemplateById,
    useIncrementTemplatePopularity,
  };
};

export default useLegalLibrary;
