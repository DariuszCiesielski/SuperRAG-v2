import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Scale, Sparkles } from 'lucide-react';
import { useLegalSubscription, STRIPE_PRICE_ID_LEGAL_PRO, LegalPlanId } from '@/hooks/legal/useLegalSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LegalPricingPlan {
  id: LegalPlanId;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export function LegalPricingCards() {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    legalPlanId,
    createLegalCheckout,
    isCreatingCheckout,
    openCustomerPortal,
    isOpeningPortal,
    hasPaidLegalPlan,
  } = useLegalSubscription();

  const plans: LegalPricingPlan[] = [
    {
      id: 'free',
      name: t('pricing.free.name', 'Darmowy'),
      price: '0',
      priceValue: 0,
      period: t('pricing.free.period', 'PLN'),
      description: t('pricing.free.description', 'Podstawowe funkcje dla początkujących'),
      features: [
        t('pricing.free.features.cases', 'Do 2 aktywnych spraw'),
        t('pricing.free.features.documents', '3 dokumenty miesięcznie'),
        t('pricing.free.features.search', 'Podstawowe wyszukiwanie'),
        t('pricing.free.features.regulations', 'Dostęp do przepisów'),
        t('pricing.free.features.chat', 'Podstawowy chat AI'),
      ],
    },
    {
      id: 'pro_legal',
      name: t('pricing.proLegal.name', 'Legal Pro'),
      price: '29,99',
      priceValue: 29.99,
      period: t('pricing.proLegal.period', 'PLN/mies.'),
      description: t('pricing.proLegal.description', 'Pełny pakiet dla wymagających użytkowników'),
      features: [
        t('pricing.proLegal.features.cases', 'Nieograniczona liczba spraw'),
        t('pricing.proLegal.features.documents', 'Nieograniczone dokumenty'),
        t('pricing.proLegal.features.export', 'Eksport do DOCX'),
        t('pricing.proLegal.features.rag', 'Pełny dostęp do AI i RAG'),
        t('pricing.proLegal.features.templates', 'Wszystkie szablony Premium'),
        t('pricing.proLegal.features.rulings', 'Dostęp do orzecznictwa'),
        t('pricing.proLegal.features.support', 'Priorytetowe wsparcie'),
      ],
      highlighted: true,
      badge: t('pricing.proLegal.badge', 'Najpopularniejszy'),
    },
    {
      id: 'business_legal',
      name: t('pricing.businessLegal.name', 'Legal Business'),
      price: '99,99',
      priceValue: 99.99,
      period: t('pricing.businessLegal.period', 'PLN/mies.'),
      description: t('pricing.businessLegal.description', 'Dla kancelarii i firm'),
      features: [
        t('pricing.businessLegal.features.all', 'Wszystko z planu Pro'),
        t('pricing.businessLegal.features.api', 'Dostęp do API'),
        t('pricing.businessLegal.features.team', 'Do 5 użytkowników'),
        t('pricing.businessLegal.features.templates', 'Własne szablony'),
        t('pricing.businessLegal.features.priority', 'Dedykowane wsparcie'),
        t('pricing.businessLegal.features.sla', 'Gwarancja SLA'),
      ],
      badge: t('pricing.businessLegal.badge', 'Dla firm'),
    },
  ];

  const handleSelectPlan = (plan: LegalPricingPlan) => {
    // Jeśli użytkownik nie jest zalogowany, przekieruj do logowania
    if (!user) {
      navigate('/auth');
      return;
    }

    if (plan.id === 'free') {
      // Przekieruj do modułu prawnego
      navigate('/legal');
      return;
    }

    // For now, only Pro Legal is available
    if (plan.id === 'pro_legal') {
      createLegalCheckout(STRIPE_PRICE_ID_LEGAL_PRO);
    } else {
      // Business plan - show contact info or coming soon
      // For now, redirect to pro
      createLegalCheckout(STRIPE_PRICE_ID_LEGAL_PRO);
    }
  };

  const getButtonState = (plan: LegalPricingPlan) => {
    // Dla niezalogowanych użytkowników
    if (!user) {
      if (plan.id === 'free') {
        return {
          label: t('pricing.startFree', 'Zacznij za darmo'),
          disabled: false,
          variant: 'outline' as const,
          action: () => navigate('/auth'),
        };
      }
      return {
        label: t('pricing.signUpAndUpgrade', 'Zarejestruj się'),
        disabled: false,
        variant: plan.highlighted ? 'default' as const : 'outline' as const,
        action: () => navigate('/auth'),
      };
    }

    const isCurrentPlan = legalPlanId === plan.id;
    const isUpgrade = plan.priceValue > getPlanPrice(legalPlanId);

    if (isCurrentPlan) {
      return {
        label: t('pricing.currentPlan', 'Aktualny plan'),
        disabled: true,
        variant: 'outline' as const,
      };
    }

    if (plan.id === 'free') {
      if (hasPaidLegalPlan) {
        return {
          label: t('pricing.manageSubscription', 'Zarządzaj subskrypcją'),
          disabled: false,
          variant: 'outline' as const,
          action: () => openCustomerPortal(),
        };
      }
      return {
        label: t('pricing.goToLegal', 'Przejdź do modułu'),
        disabled: false,
        variant: 'outline' as const,
        action: () => navigate('/legal'),
      };
    }

    if (isUpgrade) {
      return {
        label: t('pricing.upgrade', 'Ulepsz'),
        disabled: false,
        variant: plan.highlighted ? 'default' as const : 'outline' as const,
        action: () => handleSelectPlan(plan),
      };
    }

    return {
      label: t('pricing.select', 'Wybierz'),
      disabled: false,
      variant: 'outline' as const,
      action: () => handleSelectPlan(plan),
    };
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const buttonState = getButtonState(plan);
        const isCurrentPlan = legalPlanId === plan.id;

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative flex flex-col',
              plan.highlighted && 'border-amber-500 shadow-lg shadow-amber-500/10',
              isCurrentPlan && 'ring-2 ring-primary'
            )}
          >
            {plan.badge && (
              <Badge
                className={cn(
                  'absolute -top-2 right-4',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {plan.badge}
              </Badge>
            )}

            <CardHeader>
              <div className="flex items-center gap-2">
                {plan.id === 'free' && <Scale className="h-5 w-5 text-muted-foreground" />}
                {plan.id === 'pro_legal' && <Crown className="h-5 w-5 text-amber-500" />}
                {plan.id === 'business_legal' && <Sparkles className="h-5 w-5 text-purple-500" />}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className={cn(
                      'h-5 w-5 flex-shrink-0 mt-0.5',
                      plan.highlighted ? 'text-amber-500' : 'text-green-500'
                    )} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className={cn(
                  'w-full',
                  plan.highlighted && !buttonState.disabled && 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                )}
                variant={buttonState.variant}
                disabled={buttonState.disabled || isCreatingCheckout || isOpeningPortal}
                onClick={buttonState.action}
              >
                {(isCreatingCheckout || isOpeningPortal) && buttonState.action ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('pricing.processing', 'Przetwarzanie...')}
                  </>
                ) : (
                  buttonState.label
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function getPlanPrice(planId: LegalPlanId): number {
  switch (planId) {
    case 'pro_legal':
      return 29.99;
    case 'business_legal':
      return 99.99;
    default:
      return 0;
  }
}

// Compact version for embedding in other pages
export function LegalPricingBanner() {
  const { t } = useTranslation('legal');
  const { isFreeLegal, createLegalCheckout, isCreatingCheckout } = useLegalSubscription();

  if (!isFreeLegal) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-medium">{t('pricing.banner.title', 'Odblokuj pełne możliwości')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('pricing.banner.description', 'Ulepsz do planu Pro i korzystaj bez ograniczeń')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => createLegalCheckout(STRIPE_PRICE_ID_LEGAL_PRO)}
          disabled={isCreatingCheckout}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          {isCreatingCheckout ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Crown className="mr-2 h-4 w-4" />
          )}
          {t('pricing.banner.cta', 'Ulepsz do Pro - 29,99 PLN/mies.')}
        </Button>
      </div>
    </div>
  );
}
