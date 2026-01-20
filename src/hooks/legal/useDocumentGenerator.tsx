/**
 * Hook do generowania dokumentów prawnych
 * Zarządza procesem: wybór szablonu -> wypełnienie formularza -> podgląd -> eksport
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLegalLibrary } from './useLegalLibrary';
import {
  LegalTemplate,
  GeneratedLegalDocument,
  DocumentGeneratorFormData,
  GeneratedDocumentResult,
} from '@/types/legal';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// ============================================================================
// TYPY
// ============================================================================

interface UseDocumentGeneratorReturn {
  // Stan
  selectedTemplate: LegalTemplate | null;
  formData: Record<string, string | number | Date>;
  generatedContent: string;
  isGenerating: boolean;
  isSaving: boolean;
  generationError: string | null;

  // Akcje
  selectTemplate: (template: LegalTemplate) => void;
  updateFormField: (name: string, value: string | number | Date) => void;
  resetFormData: () => void;
  generatePreview: () => Promise<string | null>;
  saveDocument: (caseId?: string) => Promise<GeneratedLegalDocument | null>;
  exportToDocx: () => Promise<string | null>;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export const useDocumentGenerator = (
  initialTemplateId?: string
): UseDocumentGeneratorReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { useTemplateById, useIncrementTemplatePopularity } = useLegalLibrary();

  // Pobierz szablon jeśli podano ID
  const { data: initialTemplate } = useTemplateById(initialTemplateId || null);
  const incrementPopularity = useIncrementTemplatePopularity();

  // Stan lokalny
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number | Date>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [savedDocument, setSavedDocument] = useState<GeneratedLegalDocument | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Ustaw szablon początkowy
  useEffect(() => {
    if (initialTemplate && !selectedTemplate) {
      setSelectedTemplate(initialTemplate);
      initializeFormData(initialTemplate);
    }
  }, [initialTemplate, selectedTemplate]);

  // Inicjalizacja danych formularza z wartościami domyślnymi
  const initializeFormData = useCallback((template: LegalTemplate) => {
    const initialData: Record<string, string | number | Date> = {};
    template.template_fields.forEach((field) => {
      if (field.defaultValue) {
        if (field.type === 'date') {
          initialData[field.name] = new Date(field.defaultValue);
        } else if (field.type === 'number') {
          initialData[field.name] = parseFloat(field.defaultValue) || 0;
        } else {
          initialData[field.name] = field.defaultValue;
        }
      }
    });
    setFormData(initialData);
  }, []);

  // Wybór szablonu
  const selectTemplate = useCallback(
    (template: LegalTemplate) => {
      setSelectedTemplate(template);
      initializeFormData(template);
      setGeneratedContent('');
      setSavedDocument(null);
      setGenerationError(null);

      // Zwiększ popularność szablonu
      incrementPopularity.mutate(template.id);
    },
    [initializeFormData, incrementPopularity]
  );

  // Aktualizacja pola formularza
  const updateFormField = useCallback(
    (name: string, value: string | number | Date) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Reset danych formularza
  const resetFormData = useCallback(() => {
    if (selectedTemplate) {
      initializeFormData(selectedTemplate);
    } else {
      setFormData({});
    }
  }, [selectedTemplate, initializeFormData]);

  // Generowanie treści dokumentu na podstawie szablonu i danych
  const generateContentFromTemplate = useCallback((): string => {
    if (!selectedTemplate) return '';

    let content = selectedTemplate.template_content;

    // Zamień placeholdery {{field_name}} na wartości
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      let formattedValue: string;

      if (value instanceof Date) {
        formattedValue = format(value, 'dd MMMM yyyy', { locale: pl });
      } else if (typeof value === 'number') {
        formattedValue = value.toString();
      } else {
        formattedValue = value || '';
      }

      content = content.replace(placeholder, formattedValue);
    });

    // Usuń niewypełnione placeholdery opcjonalne
    content = content.replace(/\{\{[^}]+\}\}/g, '');

    // Dodaj datę i miejscowość jeśli nie ma
    const today = format(new Date(), 'dd MMMM yyyy', { locale: pl });
    if (!content.includes('[PRAWY]') && formData['miejscowosc']) {
      content = `[PRAWY]${formData['miejscowosc']}, ${today}\n\n${content}`;
    }

    return content;
  }, [selectedTemplate, formData]);

  // Mutacja generowania podglądu
  const generateMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      if (!selectedTemplate) {
        throw new Error('Nie wybrano szablonu');
      }

      // Generuj treść lokalnie (bez wywołania edge function na tym etapie)
      const content = generateContentFromTemplate();

      if (!content) {
        throw new Error('Nie udało się wygenerować treści dokumentu');
      }

      return content;
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
      setGenerationError(null);
    },
    onError: (error: Error) => {
      setGenerationError(error.message);
      toast({
        title: 'Błąd generowania',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutacja zapisywania dokumentu
  const saveMutation = useMutation({
    mutationFn: async (caseId?: string): Promise<GeneratedLegalDocument> => {
      if (!selectedTemplate || !user) {
        throw new Error('Brak szablonu lub użytkownika');
      }

      const content = generatedContent || generateContentFromTemplate();

      // Zapisz do bazy danych
      const { data, error } = await supabase
        .from('generated_legal_documents')
        .insert({
          user_id: user.id,
          case_id: caseId || null,
          template_id: selectedTemplate.id,
          title: selectedTemplate.title,
          document_type: selectedTemplate.document_type,
          content: content,
          form_data: formData,
          version: 1,
          is_draft: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving document:', error);
        throw new Error('Nie udało się zapisać dokumentu');
      }

      return data as GeneratedLegalDocument;
    },
    onSuccess: (document) => {
      setSavedDocument(document);
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      toast({
        title: 'Dokument zapisany',
        description: 'Dokument został pomyślnie zapisany.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Błąd zapisywania',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutacja eksportu do DOCX
  const exportMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      if (!savedDocument && !generatedContent) {
        throw new Error('Brak dokumentu do eksportu');
      }

      // Wywołaj Edge Function do generowania DOCX
      const { data, error } = await supabase.functions.invoke('generate-legal-document', {
        body: {
          document_id: savedDocument?.id,
          template_id: selectedTemplate?.id,
          content: generatedContent || savedDocument?.content,
          form_data: formData,
          title: selectedTemplate?.title,
          document_type: selectedTemplate?.document_type,
        },
      });

      if (error) {
        console.error('Error generating DOCX:', error);
        throw new Error('Nie udało się wygenerować pliku DOCX');
      }

      // Pobierz plik
      if (data?.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        return data.downloadUrl;
      }

      // Jeśli otrzymano blob, stwórz link do pobrania
      if (data?.blob) {
        const blob = new Blob([data.blob], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate?.title || 'dokument'}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return url;
      }

      throw new Error('Nieprawidłowa odpowiedź serwera');
    },
    onSuccess: () => {
      toast({
        title: 'Eksport zakończony',
        description: 'Plik DOCX został pobrany.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Błąd eksportu',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generowanie podglądu
  const generatePreview = useCallback(async (): Promise<string | null> => {
    try {
      const content = await generateMutation.mutateAsync();
      return content;
    } catch {
      return null;
    }
  }, [generateMutation]);

  // Zapisywanie dokumentu
  const saveDocument = useCallback(
    async (caseId?: string): Promise<GeneratedLegalDocument | null> => {
      try {
        const document = await saveMutation.mutateAsync(caseId);
        return document;
      } catch {
        return null;
      }
    },
    [saveMutation]
  );

  // Eksport do DOCX
  const exportToDocx = useCallback(async (): Promise<string | null> => {
    try {
      const url = await exportMutation.mutateAsync();
      return url;
    } catch {
      return null;
    }
  }, [exportMutation]);

  // Reset wszystkiego
  const reset = useCallback(() => {
    setSelectedTemplate(null);
    setFormData({});
    setGeneratedContent('');
    setSavedDocument(null);
    setGenerationError(null);
  }, []);

  return {
    // Stan
    selectedTemplate,
    formData,
    generatedContent,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending || exportMutation.isPending,
    generationError,

    // Akcje
    selectTemplate,
    updateFormField,
    resetFormData,
    generatePreview,
    saveDocument,
    exportToDocx,
    reset,
  };
};

export default useDocumentGenerator;
