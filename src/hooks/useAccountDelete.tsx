import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletedFiles: number;
}

export const useAccountDelete = () => {
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteAccount = useMutation({
    mutationFn: async (): Promise<DeleteAccountResponse> => {
      console.log('Starting account deletion process...');

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get current session for authorization header
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Call Edge Function to delete account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete account');
      }

      console.log('Account deleted successfully:', data);
      return data;
    },
    onSuccess: async (data) => {
      console.log('Delete mutation success, signing out...');

      // Show success message
      toast({
        title: "Account deleted",
        description: `Your account and all associated data (${data.deletedFiles} files) have been permanently deleted.`,
        duration: 5000,
      });

      // Clear all queries
      queryClient.clear();

      // Sign out and redirect to home
      // Note: The session is already invalid server-side, but we clean up client-side
      await signOut();

      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);

      let errorMessage = "Failed to delete your account. Please try again or contact support.";

      if (error?.message?.includes('Unauthorized')) {
        errorMessage = "Authentication error. Please sign in again and try again.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
    },
  });

  return {
    deleteAccount: deleteAccount.mutate,
    deleteAccountAsync: deleteAccount.mutateAsync,
    isDeleting: deleteAccount.isPending,
  };
};
