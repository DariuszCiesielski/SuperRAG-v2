/**
 * Hook do zarządzania sprawami prawnymi użytkownika
 * CRUD operations + real-time subscriptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LegalCase, LegalCategory, CaseStatus, ProceedingStageType, PartyType } from '@/types/legal';

export interface CreateCaseData {
  title: string;
  description?: string;
  category: LegalCategory;
  case_number?: string;
  current_stage?: ProceedingStageType;
  user_role?: PartyType;
  opponent_name?: string;
  opponent_type?: string;
  deadline_date?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCaseData {
  id: string;
  title?: string;
  description?: string;
  category?: LegalCategory;
  status?: CaseStatus;
  opponent_name?: string;
  opponent_type?: string;
  deadline_date?: string;
  icon?: string;
  color?: string;
  notes?: string;
}

export interface LegalCaseWithCounts extends LegalCase {
  documents_count: number;
  proceedings_count: number;
}

export const useLegalCases = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Pobieranie listy spraw
  const {
    data: cases = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['legal-cases', user?.id],
    queryFn: async (): Promise<LegalCaseWithCounts[]> => {
      if (!user) {
        return [];
      }

      // Pobierz sprawy użytkownika
      const { data: casesData, error: casesError } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (casesError) {
        console.error('Error fetching legal cases:', casesError);
        throw casesError;
      }

      // Pobierz liczniki dla każdej sprawy
      const casesWithCounts = await Promise.all(
        (casesData || []).map(async (legalCase) => {
          // Liczba dokumentów
          const { count: docsCount } = await supabase
            .from('case_documents')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', legalCase.id);

          // Liczba etapów postępowania
          const { count: proceedingsCount } = await supabase
            .from('case_proceedings')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', legalCase.id);

          return {
            ...legalCase,
            documents_count: docsCount || 0,
            proceedings_count: proceedingsCount || 0,
          } as LegalCaseWithCounts;
        })
      );

      return casesWithCounts;
    },
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error) => {
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    const channel = supabase
      .channel('legal-cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_cases',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time legal case update:', payload);
          queryClient.invalidateQueries({ queryKey: ['legal-cases', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, queryClient]);

  // Tworzenie sprawy
  const createCase = useMutation({
    mutationFn: async (caseData: CreateCaseData): Promise<LegalCase> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('legal_cases')
        .insert({
          title: caseData.title,
          description: caseData.description,
          category: caseData.category,
          case_number: caseData.case_number,
          current_stage: caseData.current_stage,
          user_role: caseData.user_role,
          opponent_name: caseData.opponent_name,
          opponent_type: caseData.opponent_type,
          deadline_date: caseData.deadline_date,
          icon: caseData.icon || '⚖️',
          color: caseData.color || 'blue',
          user_id: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating legal case:', error);
        throw error;
      }

      return data as LegalCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases', user?.id] });
    },
  });

  // Aktualizacja sprawy
  const updateCase = useMutation({
    mutationFn: async (caseData: UpdateCaseData): Promise<LegalCase> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updateData } = caseData;

      const { data, error } = await supabase
        .from('legal_cases')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating legal case:', error);
        throw error;
      }

      return data as LegalCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases', user?.id] });
    },
  });

  // Usuwanie sprawy
  const deleteCase = useMutation({
    mutationFn: async (caseId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('legal_cases')
        .delete()
        .eq('id', caseId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting legal case:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases', user?.id] });
    },
  });

  // Archiwizacja sprawy
  const archiveCase = useMutation({
    mutationFn: async (caseId: string): Promise<LegalCase> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('legal_cases')
        .update({ status: 'archived' })
        .eq('id', caseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error archiving legal case:', error);
        throw error;
      }

      return data as LegalCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-cases', user?.id] });
    },
  });

  // Filtrowanie spraw
  const activeCases = cases.filter((c) => c.status === 'active');
  const archivedCases = cases.filter((c) => c.status === 'archived');
  const casesByCategory = (category: LegalCategory) =>
    cases.filter((c) => c.category === category);

  return {
    cases,
    activeCases,
    archivedCases,
    casesByCategory,
    isLoading: authLoading || isLoading,
    error: error?.message || null,
    isError,
    refetch,
    createCase: createCase.mutate,
    createCaseAsync: createCase.mutateAsync,
    isCreating: createCase.isPending,
    updateCase: updateCase.mutate,
    updateCaseAsync: updateCase.mutateAsync,
    isUpdating: updateCase.isPending,
    deleteCase: deleteCase.mutate,
    deleteCaseAsync: deleteCase.mutateAsync,
    isDeleting: deleteCase.isPending,
    archiveCase: archiveCase.mutate,
    archiveCaseAsync: archiveCase.mutateAsync,
    isArchiving: archiveCase.isPending,
  };
};

/**
 * Hook do pobierania pojedynczej sprawy
 */
export const useLegalCase = (caseId: string | undefined) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: legalCase,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['legal-case', caseId],
    queryFn: async (): Promise<LegalCaseWithCounts | null> => {
      if (!user || !caseId) {
        return null;
      }

      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .eq('id', caseId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching legal case:', error);
        throw error;
      }

      // Pobierz liczniki
      const { count: docsCount } = await supabase
        .from('case_documents')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseId);

      const { count: proceedingsCount } = await supabase
        .from('case_proceedings')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseId);

      return {
        ...data,
        documents_count: docsCount || 0,
        proceedings_count: proceedingsCount || 0,
      } as LegalCaseWithCounts;
    },
    enabled: isAuthenticated && !authLoading && !!caseId,
  });

  // Real-time subscription dla pojedynczej sprawy
  useEffect(() => {
    if (!user?.id || !isAuthenticated || !caseId) return;

    const channel = supabase
      .channel(`legal-case-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_cases',
          filter: `id=eq.${caseId}`,
        },
        (payload) => {
          console.log('Real-time single case update:', payload);
          queryClient.invalidateQueries({ queryKey: ['legal-case', caseId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, caseId, queryClient]);

  return {
    legalCase,
    isLoading: authLoading || isLoading,
    error: error?.message || null,
    isError,
    refetch,
  };
};
