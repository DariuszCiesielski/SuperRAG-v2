import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserLegalLimits } from '@/types/legal';

export type LegalPlanId = 'free' | 'pro_legal' | 'business_legal';

export interface LegalSubscriptionData {
  legalPlanId: LegalPlanId;
  limits: UserLegalLimits;
  stripeCustomerId: string | null;
  stripeLegalSubscriptionId: string | null;
}

// Price ID dla planu Pro Legal w Stripe (29.99 PLN/miesiąc)
// WAŻNE: Zaktualizuj tę wartość po utworzeniu produktu w Stripe Dashboard
export const STRIPE_PRICE_ID_LEGAL_PRO = 'price_legal_pro_placeholder';

export function useLegalSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Pobieranie limitów z funkcji SQL
  const {
    data: limits,
    isLoading: isLoadingLimits,
    error: limitsError,
    refetch: refetchLimits,
  } = useQuery({
    queryKey: ['legal-limits', user?.id],
    queryFn: async (): Promise<UserLegalLimits> => {
      if (!user?.id) {
        return getDefaultLimits();
      }

      const { data, error } = await supabase
        .rpc('check_legal_limits', { user_id_param: user.id });

      if (error) {
        console.error('Error fetching legal limits:', error);
        throw error;
      }

      return data as UserLegalLimits;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 sekund cache
    refetchOnWindowFocus: true,
  });

  // Pobieranie danych subskrypcji
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useQuery({
    queryKey: ['subscription-legal', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id, legal_plan_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Mutacja do tworzenia sesji checkout
  const createLegalCheckout = useMutation({
    mutationFn: async (priceId: string) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Nie jesteś zalogowany');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/legal?subscription=success`,
            cancelUrl: `${window.location.origin}/legal?subscription=canceled`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Nie udało się utworzyć sesji płatności');
      }

      const data = await response.json();
      return data.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
    onError: (error: Error) => {
      console.error('Legal checkout error:', error);
      toast({
        title: 'Błąd płatności',
        description: error.message || 'Nie udało się rozpocząć płatności',
        variant: 'destructive',
      });
    },
  });

  // Funkcja pomocnicza do otwierania portalu Stripe
  const openCustomerPortal = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Nie jesteś zalogowany');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            returnUrl: `${window.location.origin}/legal`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Nie udało się otworzyć portalu');
      }

      const data = await response.json();
      return data.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Obliczone wartości
  const currentLimits = limits || getDefaultLimits();
  const legalPlanId = (currentLimits.plan_id || 'free') as LegalPlanId;

  const isProLegal = legalPlanId === 'pro_legal';
  const isBusinessLegal = legalPlanId === 'business_legal';
  const isFreeLegal = legalPlanId === 'free';
  const hasPaidLegalPlan = isProLegal || isBusinessLegal;

  return {
    // Dane
    limits: currentLimits,
    legalPlanId,
    stripeCustomerId: subscription?.stripe_customer_id || null,

    // Flagi planów
    isProLegal,
    isBusinessLegal,
    isFreeLegal,
    hasPaidLegalPlan,

    // Flagi uprawnień (z limitów)
    canCreateCase: currentLimits.can_create_case,
    canGenerateDocument: currentLimits.can_generate_document,
    canExportDocx: currentLimits.can_export_docx,
    canGenerateDocuments: currentLimits.can_generate_documents,
    fullRagAccess: currentLimits.full_rag_access,

    // Liczniki
    casesCount: currentLimits.cases_count,
    casesLimit: currentLimits.cases_limit,
    documentsThisMonth: currentLimits.documents_this_month,
    documentsLimit: currentLimits.documents_limit,

    // Stan ładowania
    isLoading: isLoadingLimits || isLoadingSubscription,
    error: limitsError,

    // Akcje
    refetch: refetchLimits,
    createLegalCheckout: createLegalCheckout.mutate,
    isCreatingCheckout: createLegalCheckout.isPending,
    openCustomerPortal: openCustomerPortal.mutate,
    isOpeningPortal: openCustomerPortal.isPending,

    // Stałe
    STRIPE_PRICE_ID_LEGAL_PRO,
  };
}

// Domyślne limity dla niezalogowanych lub w przypadku błędu
function getDefaultLimits(): UserLegalLimits {
  return {
    plan_id: 'free',
    cases_count: 0,
    cases_limit: 2,
    can_create_case: true,
    documents_this_month: 0,
    documents_limit: 3,
    can_generate_document: true,
    can_export_docx: false,
    can_generate_documents: false,
    full_rag_access: false,
    features: {
      basic_search: true,
      view_regulations: true,
    },
  };
}

// Hook do wyświetlania pozostałych limitów
export function useLegalLimitsDisplay() {
  const { limits, legalPlanId } = useLegalSubscription();

  const casesRemaining = limits.cases_limit !== null
    ? Math.max(0, limits.cases_limit - limits.cases_count)
    : null;

  const documentsRemaining = limits.documents_limit !== null
    ? Math.max(0, limits.documents_limit - limits.documents_this_month)
    : null;

  const casesPercentUsed = limits.cases_limit !== null
    ? Math.min(100, (limits.cases_count / limits.cases_limit) * 100)
    : 0;

  const documentsPercentUsed = limits.documents_limit !== null
    ? Math.min(100, (limits.documents_this_month / limits.documents_limit) * 100)
    : 0;

  return {
    casesRemaining,
    documentsRemaining,
    casesPercentUsed,
    documentsPercentUsed,
    isUnlimited: limits.cases_limit === null,
    planDisplayName: getPlanDisplayName(legalPlanId),
  };
}

function getPlanDisplayName(planId: LegalPlanId): string {
  switch (planId) {
    case 'pro_legal':
      return 'Legal Pro';
    case 'business_legal':
      return 'Legal Business';
    default:
      return 'Darmowy';
  }
}
