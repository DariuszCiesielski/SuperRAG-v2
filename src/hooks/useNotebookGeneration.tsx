
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useNotebookGeneration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const generateNotebookContent = useMutation({
    mutationFn: async ({ notebookId, filePath, sourceType }: { 
      notebookId: string; 
      filePath?: string;
      sourceType: string;
    }) => {
      console.log('Starting notebook content generation for:', notebookId, 'with source type:', sourceType);
      
      const { data, error } = await supabase.functions.invoke('generate-notebook-content', {
        body: {
          notebookId,
          filePath,
          sourceType,
          language: i18n.language // Pass user's language preference
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Notebook generation successful:', data);
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      queryClient.invalidateQueries({ queryKey: ['notebook'] });
      
      toast({
        title: "Content Generated",
        description: "Notebook title and description have been generated successfully.",
      });
    },
    onError: (error) => {
      console.error('Notebook generation failed:', error);
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate notebook content. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    generateNotebookContent: generateNotebookContent.mutate,
    generateNotebookContentAsync: generateNotebookContent.mutateAsync,
    isGenerating: generateNotebookContent.isPending,
  };
};
