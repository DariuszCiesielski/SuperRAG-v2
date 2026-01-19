/**
 * Hook do zarządzania etapami postępowania (sygnaturami) sprawy
 * Obsługuje timeline postępowania: policja → prokuratura → sąd I → sąd II
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type {
  CaseProceeding,
  ProceedingStageType,
  ProceedingOutcome,
} from '@/types/legal';

export interface CreateProceedingData {
  case_id: string;
  stage_type: ProceedingStageType;
  institution_name: string;
  case_number?: string;
  started_at?: string;
  ended_at?: string;
  outcome?: ProceedingOutcome;
  notes?: string;
  previous_proceeding_id?: string;
  merged_from_case_ids?: string[];
}

export interface UpdateProceedingData {
  id: string;
  stage_type?: ProceedingStageType;
  institution_name?: string;
  case_number?: string;
  started_at?: string;
  ended_at?: string;
  outcome?: ProceedingOutcome;
  notes?: string;
}

/**
 * Hook do zarządzania etapami postępowania dla danej sprawy
 */
export const useCaseProceedings = (caseId: string | undefined) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Pobieranie listy etapów
  const {
    data: proceedings = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['case-proceedings', caseId],
    queryFn: async (): Promise<CaseProceeding[]> => {
      if (!user || !caseId) {
        return [];
      }

      const { data, error } = await supabase
        .from('case_proceedings')
        .select('*')
        .eq('case_id', caseId)
        .order('started_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching case proceedings:', error);
        throw error;
      }

      return (data || []) as CaseProceeding[];
    },
    enabled: isAuthenticated && !authLoading && !!caseId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !isAuthenticated || !caseId) return;

    const channel = supabase
      .channel(`case-proceedings-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_proceedings',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          console.log('Real-time proceeding update:', payload);
          queryClient.invalidateQueries({
            queryKey: ['case-proceedings', caseId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, caseId, queryClient]);

  // Tworzenie etapu
  const createProceeding = useMutation({
    mutationFn: async (data: CreateProceedingData): Promise<CaseProceeding> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: proceeding, error } = await supabase
        .from('case_proceedings')
        .insert({
          case_id: data.case_id,
          stage_type: data.stage_type,
          institution_name: data.institution_name,
          case_number: data.case_number,
          started_at: data.started_at,
          ended_at: data.ended_at,
          outcome: data.outcome || 'w_toku',
          notes: data.notes,
          previous_proceeding_id: data.previous_proceeding_id,
          merged_from_case_ids: data.merged_from_case_ids,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating proceeding:', error);
        throw error;
      }

      return proceeding as CaseProceeding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['case-proceedings', caseId],
      });
      // Odśwież też sprawę (dla liczników)
      queryClient.invalidateQueries({
        queryKey: ['legal-case', caseId],
      });
    },
  });

  // Aktualizacja etapu
  const updateProceeding = useMutation({
    mutationFn: async (data: UpdateProceedingData): Promise<CaseProceeding> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updateData } = data;

      const { data: proceeding, error } = await supabase
        .from('case_proceedings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating proceeding:', error);
        throw error;
      }

      return proceeding as CaseProceeding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['case-proceedings', caseId],
      });
    },
  });

  // Usuwanie etapu
  const deleteProceeding = useMutation({
    mutationFn: async (proceedingId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('case_proceedings')
        .delete()
        .eq('id', proceedingId);

      if (error) {
        console.error('Error deleting proceeding:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['case-proceedings', caseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['legal-case', caseId],
      });
    },
  });

  // Zakończenie etapu i przekazanie do następnego
  const closeAndTransfer = useMutation({
    mutationFn: async ({
      currentId,
      outcome,
      nextStage,
    }: {
      currentId: string;
      outcome: ProceedingOutcome;
      nextStage?: Omit<CreateProceedingData, 'case_id' | 'previous_proceeding_id'>;
    }): Promise<{ closed: CaseProceeding; next?: CaseProceeding }> => {
      if (!user || !caseId) {
        throw new Error('User not authenticated or case not found');
      }

      // Zamknij bieżący etap
      const { data: closed, error: closeError } = await supabase
        .from('case_proceedings')
        .update({
          outcome,
          ended_at: new Date().toISOString().split('T')[0],
        })
        .eq('id', currentId)
        .select()
        .single();

      if (closeError) {
        throw closeError;
      }

      // Jeśli podano następny etap, utwórz go
      let next: CaseProceeding | undefined;
      if (nextStage) {
        const { data: nextData, error: nextError } = await supabase
          .from('case_proceedings')
          .insert({
            case_id: caseId,
            stage_type: nextStage.stage_type,
            institution_name: nextStage.institution_name,
            case_number: nextStage.case_number,
            started_at: nextStage.started_at || new Date().toISOString().split('T')[0],
            outcome: 'w_toku',
            notes: nextStage.notes,
            previous_proceeding_id: currentId,
          })
          .select()
          .single();

        if (nextError) {
          throw nextError;
        }

        next = nextData as CaseProceeding;
      }

      return { closed: closed as CaseProceeding, next };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['case-proceedings', caseId],
      });
    },
  });

  // Pomocnicze funkcje
  const currentProceeding = proceedings.find((p) => p.outcome === 'w_toku');
  const completedProceedings = proceedings.filter((p) => p.outcome !== 'w_toku');
  const latestProceeding = proceedings[proceedings.length - 1];

  // Budowanie timeline'u (łańcuch etapów)
  const buildTimeline = (): CaseProceeding[] => {
    const timeline: CaseProceeding[] = [];
    const proceedingsMap = new Map(proceedings.map((p) => [p.id, p]));

    // Znajdź pierwszy etap (bez previous_proceeding_id)
    let current = proceedings.find((p) => !p.previous_proceeding_id);

    while (current) {
      timeline.push(current);
      // Znajdź następny etap
      current = proceedings.find((p) => p.previous_proceeding_id === current?.id);
    }

    // Dodaj etapy bez powiązań (jeśli są)
    const timelineIds = new Set(timeline.map((p) => p.id));
    proceedings
      .filter((p) => !timelineIds.has(p.id))
      .forEach((p) => timeline.push(p));

    return timeline;
  };

  return {
    proceedings,
    timeline: buildTimeline(),
    currentProceeding,
    completedProceedings,
    latestProceeding,
    isLoading: authLoading || isLoading,
    error: error?.message || null,
    isError,
    refetch,
    createProceeding: createProceeding.mutate,
    createProceedingAsync: createProceeding.mutateAsync,
    isCreating: createProceeding.isPending,
    updateProceeding: updateProceeding.mutate,
    updateProceedingAsync: updateProceeding.mutateAsync,
    isUpdating: updateProceeding.isPending,
    deleteProceeding: deleteProceeding.mutate,
    deleteProceedingAsync: deleteProceeding.mutateAsync,
    isDeleting: deleteProceeding.isPending,
    closeAndTransfer: closeAndTransfer.mutate,
    closeAndTransferAsync: closeAndTransfer.mutateAsync,
    isTransferring: closeAndTransfer.isPending,
  };
};
