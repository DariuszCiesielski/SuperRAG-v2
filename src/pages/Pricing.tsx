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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {user && <DashboardHeader userEmail={user.email} />}

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Zap className="h-6 w-6 text-gray-500" />
                {t('freePlan')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('freePlanDescription')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">0 zł</span>
                <span className="text-gray-500">/{t('month')}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={handleSelectFree}
              >
                {user ? t('goToDashboard') : t('getStarted')}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-colors shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1">
                {t('recommended')}
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                {t('proPlan')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('proPlanDescription')}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">1 zł</span>
                <span className="text-gray-500">/{t('month')}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-700 font-medium">{t('featurePrioritySupport')}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handleSelectPro}
                disabled={isPro || isCreatingCheckout}
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
            <Badge className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <Scale className="h-4 w-4 mr-1" />
              {t('legalSection.badge', 'Moduł Prawny')}
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('legalSection.title', 'Asystent Prawny')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('legalSection.description', 'Profesjonalne narzędzie do zarządzania sprawami prawnymi, generowania dokumentów i wyszukiwania w bazie prawnej.')}
            </p>
          </div>
          <LegalPricingCards />
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('questionsTitle')}</h2>
          <p className="text-gray-600">
            {t('questionsDescription')}{' '}
            <a href="mailto:support@superrag.app" className="text-blue-600 hover:underline">
              support@superrag.app
            </a>
          </p>
        </div>

        {/* Back to Dashboard */}
        {user && (
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              {t('backToDashboard')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pricing;
