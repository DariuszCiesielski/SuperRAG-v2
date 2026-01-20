/**
 * Hook do zarządzania dokumentami sprawy prawnej
 * CRUD operations + file upload
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CaseDocument {
  id: string;
  case_id: string;
  title: string;
  document_type?: string;
  file_path?: string;
  file_size?: number;
  content?: string;
  summary?: string;
  processing_status: string;
  document_date?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  caseId: string;
  title: string;
  document_type?: string;
  file?: File;
  content?: string;
  document_date?: string;
}

export interface UpdateDocumentData {
  id: string;
  title?: string;
  document_type?: string;
  content?: string;
  summary?: string;
  document_date?: string;
}

export const useCaseDocuments = (caseId: string | undefined) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Pobieranie dokumentów sprawy
  const {
    data: documents = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: async (): Promise<CaseDocument[]> => {
      if (!user || !caseId) {
        return [];
      }

      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching case documents:', error);
        throw error;
      }

      return data as CaseDocument[];
    },
    enabled: isAuthenticated && !authLoading && !!caseId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !isAuthenticated || !caseId) return;

    const channel = supabase
      .channel(`case-documents-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_documents',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          console.log('Real-time case document update:', payload);
          queryClient.invalidateQueries({ queryKey: ['case-documents', caseId] });
          // Invalidate also case query to update documents_count
          queryClient.invalidateQueries({ queryKey: ['legal-case', caseId] });
          queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, caseId, queryClient]);

  // Upload pliku do storage
  const uploadFile = async (file: File, documentId: string): Promise<string | null> => {
    try {
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `legal/${caseId}/${documentId}.${fileExtension}`;

      console.log('Uploading file to:', filePath);

      const { data, error } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);
      return filePath;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    }
  };

  // Dodawanie dokumentu
  const addDocument = useMutation({
    mutationFn: async (documentData: CreateDocumentData): Promise<CaseDocument> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsUploading(true);

      try {
        // 1. Utwórz rekord dokumentu
        const { data: newDocument, error: insertError } = await supabase
          .from('case_documents')
          .insert({
            case_id: documentData.caseId,
            title: documentData.title,
            document_type: documentData.document_type,
            content: documentData.content,
            document_date: documentData.document_date,
            file_size: documentData.file?.size,
            processing_status: documentData.file ? 'uploading' : 'completed',
            metadata: {
              fileName: documentData.file?.name,
              fileType: documentData.file?.type,
            },
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating document record:', insertError);
          throw insertError;
        }

        // 2. Jeśli jest plik, uploaduj go
        if (documentData.file) {
          const filePath = await uploadFile(documentData.file, newDocument.id);

          if (filePath) {
            // 3. Zaktualizuj rekord o ścieżkę pliku
            const { error: updateError } = await supabase
              .from('case_documents')
              .update({
                file_path: filePath,
                processing_status: 'completed',
              })
              .eq('id', newDocument.id);

            if (updateError) {
              console.error('Error updating document with file path:', updateError);
            }

            return { ...newDocument, file_path: filePath, processing_status: 'completed' } as CaseDocument;
          } else {
            // Upload się nie powiódł
            await supabase
              .from('case_documents')
              .update({ processing_status: 'failed' })
              .eq('id', newDocument.id);

            throw new Error('File upload failed');
          }
        }

        return newDocument as CaseDocument;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-documents', caseId] });
      queryClient.invalidateQueries({ queryKey: ['legal-case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
      toast({
        title: 'Dokument dodany',
        description: 'Dokument został pomyślnie dodany do sprawy.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się dodać dokumentu. Spróbuj ponownie.',
        variant: 'destructive',
      });
      console.error('Error adding document:', error);
    },
  });

  // Aktualizacja dokumentu
  const updateDocument = useMutation({
    mutationFn: async (documentData: UpdateDocumentData): Promise<CaseDocument> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updateData } = documentData;

      const { data, error } = await supabase
        .from('case_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      return data as CaseDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-documents', caseId] });
    },
  });

  // Usuwanie dokumentu
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Pobierz dokument żeby sprawdzić czy ma plik
      const { data: document } = await supabase
        .from('case_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      // Usuń plik ze storage jeśli istnieje
      if (document?.file_path) {
        await supabase.storage.from('sources').remove([document.file_path]);
      }

      // Usuń rekord dokumentu
      const { error } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-documents', caseId] });
      queryClient.invalidateQueries({ queryKey: ['legal-case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['legal-cases'] });
      toast({
        title: 'Dokument usunięty',
        description: 'Dokument został pomyślnie usunięty.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć dokumentu.',
        variant: 'destructive',
      });
      console.error('Error deleting document:', error);
    },
  });

  // Pobieranie URL pliku
  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage.from('sources').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    documents,
    isLoading: authLoading || isLoading,
    isUploading,
    error: error?.message || null,
    isError,
    refetch,
    addDocument: addDocument.mutate,
    addDocumentAsync: addDocument.mutateAsync,
    isAdding: addDocument.isPending,
    updateDocument: updateDocument.mutate,
    updateDocumentAsync: updateDocument.mutateAsync,
    isUpdating: updateDocument.isPending,
    deleteDocument: deleteDocument.mutate,
    deleteDocumentAsync: deleteDocument.mutateAsync,
    isDeleting: deleteDocument.isPending,
    getFileUrl,
  };
};
