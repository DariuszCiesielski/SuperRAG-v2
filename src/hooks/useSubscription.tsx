import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const STRIPE_PRICE_ID_PRO = 'price_1SqWcGGJOj5HoRnWdBEA9Gae'; // Pro plan - 1 PLN/month

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      return data as Subscription;
    },
    enabled: !!user?.id,
  });

  const createCheckoutSession = useMutation({
    mutationFn: async (priceId: string) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/dashboard?subscription=success`,
            cancelUrl: `${window.location.origin}/pricing?subscription=canceled`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    },
  });

  const isPro = subscription?.plan_id === 'pro' && subscription?.status === 'active';
  const isFree = subscription?.plan_id === 'free' || !subscription;

  return {
    subscription,
    isLoading,
    error,
    refetch,
    isPro,
    isFree,
    createCheckoutSession: createCheckoutSession.mutate,
    isCreatingCheckout: createCheckoutSession.isPending,
    STRIPE_PRICE_ID_PRO,
  };
}
