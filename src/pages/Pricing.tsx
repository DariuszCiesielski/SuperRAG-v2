import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap, Star, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, STRIPE_PRICE_ID_PRO } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { LegalPricingCards } from '@/components/legal/LegalPricingCard';

const Pricing = () => {
  const { t } = useTranslation('pricing');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { subscription, isPro, isFree, createCheckoutSession, isCreatingCheckout } = useSubscription();

  React.useEffect(() => {
    const status = searchParams.get('subscription');
    if (status === 'success') {
      toast({
        title: t('subscriptionSuccess'),
        description: t('subscriptionSuccessDescription'),
      });
    } else if (status === 'canceled') {
      toast({
        title: t('subscriptionCanceled'),
        description: t('subscriptionCanceledDescription'),
        variant: 'destructive',
      });
    }
  }, [searchParams, toast, t]);

  const handleSelectFree = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/dashboard');
  };

  const handleSelectPro = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    createCheckoutSession(STRIPE_PRICE_ID_PRO);
  };

  const features = [
    t('featureUnlimitedNotebooks'),
    t('featureAIChat'),
    t('featureDocumentUpload'),
    t('featureWebsiteImport'),
    t('featureYouTubeImport'),
    t('featureNotes'),
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))' }}
    >
      {user && <DashboardHeader userEmail={user.email} />}

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('title')}
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card
            className="relative border-2 transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <CardHeader className="text-center pb-8">
              <CardTitle
                className="text-2xl font-bold flex items-center justify-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Zap className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
                {t('freePlan')}
              </CardTitle>
              <CardDescription style={{ color: 'var(--text-secondary)' }}>
                {t('freePlanDescription')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0 zł</span>
                <span style={{ color: 'var(--text-muted)' }}>/{t('month')}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={handleSelectFree}
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {user ? t('goToDashboard') : t('getStarted')}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card
            className="relative border-2 transition-colors shadow-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--accent-primary)'
            }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge
                className="px-4 py-1"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}
              >
                {t('recommended')}
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle
                className="text-2xl font-bold flex items-center justify-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Star className="h-6 w-6" style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                {t('proPlan')}
              </CardTitle>
              <CardDescription style={{ color: 'var(--text-secondary)' }}>
                {t('proPlanDescription')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>1 zł</span>
                <span style={{ color: 'var(--text-muted)' }}>/{t('month')}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                  <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{t('featurePrioritySupport')}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12 text-lg"
                onClick={handleSelectPro}
                disabled={isPro || isCreatingCheckout}
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}
              >
                {isCreatingCheckout ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {t('processing')}
                  </span>
                ) : isPro ? (
                  t('currentPlan')
                ) : (
                  t('upgradeToPro')
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Legal Assistant Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <Badge
              className="mb-4"
              style={{
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)'
              }}
            >
              <Scale className="h-4 w-4 mr-1" />
              {t('legalSection.badge', 'Moduł Prawny')}
            </Badge>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('legalSection.title', 'Asystent Prawny')}
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('legalSection.description', 'Profesjonalne narzędzie do zarządzania sprawami prawnymi, generowania dokumentów i wyszukiwania w bazie prawnej.')}
            </p>
          </div>
          <LegalPricingCards />
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('questionsTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('questionsDescription')}{' '}
            <a
              href="mailto:support@superrag.app"
              style={{ color: 'var(--accent-primary)' }}
              className="hover:underline"
            >
              support@superrag.app
            </a>
          </p>
        </div>

        {/* Back to Dashboard */}
        {user && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('backToDashboard')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pricing;
