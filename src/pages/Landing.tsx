import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Youtube,
  Globe,
  Zap,
  Shield,
  ArrowRight,
  Check,
  BookOpen,
  Brain,
  Upload,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, STRIPE_PRICE_ID_PRO } from '@/hooks/useSubscription';
import Logo from '@/components/ui/Logo';

const Landing = () => {
  const { t } = useTranslation('landing');
  const { t: tPricing } = useTranslation('pricing');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro, isFree, createCheckoutSession, isCreatingCheckout } = useSubscription();

  const handleGetStarted = () => {
    navigate('/auth');
  };

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
    {
      icon: FileText,
      title: t('feature1Title'),
      description: t('feature1Description'),
    },
    {
      icon: Youtube,
      title: t('feature2Title'),
      description: t('feature2Description'),
    },
    {
      icon: Globe,
      title: t('feature3Title'),
      description: t('feature3Description'),
    },
    {
      icon: MessageSquare,
      title: t('feature4Title'),
      description: t('feature4Description'),
    },
    {
      icon: BookOpen,
      title: t('feature5Title'),
      description: t('feature5Description'),
    },
    {
      icon: Brain,
      title: t('feature6Title'),
      description: t('feature6Description'),
    },
  ];

  const steps = [
    {
      icon: Upload,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      icon: Brain,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      icon: MessageSquare,
      title: t('step3Title'),
      description: t('step3Description'),
    },
  ];

  const pricingFeatures = [
    tPricing('featureUnlimitedNotebooks'),
    tPricing('featureAIChat'),
    tPricing('featureDocumentUpload'),
    tPricing('featureWebsiteImport'),
    tPricing('featureYouTubeImport'),
    tPricing('featureNotes'),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xl font-bold text-gray-900">SuperRAG</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('navPricing')}
            </Button>
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                {t('navDashboard')}
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  {t('navLogin')}
                </Button>
                <Button onClick={handleGetStarted}>
                  {t('navGetStarted')}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            {t('heroBadge')}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('heroTitle')}
            <span className="text-blue-600"> {t('heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={handleGetStarted}>
              {t('heroCtaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('heroCtaSecondary')}
            </Button>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-left">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">U</div>
                    <div className="bg-gray-700 rounded-lg p-3 text-gray-200 text-sm">
                      {t('demoQuestion')}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-gray-200 text-sm flex-1">
                      {t('demoAnswer')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pricingTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricingSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Zap className="h-6 w-6 text-gray-500" />
                  {tPricing('freePlan')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {tPricing('freePlanDescription')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">0 zł</span>
                  <span className="text-gray-500">/{tPricing('month')}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {pricingFeatures.map((feature, index) => (
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
                  disabled={isFree && !!user}
                >
                  {isFree && user ? tPricing('currentPlan') : tPricing('getStarted')}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-colors shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  {tPricing('recommended')}
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  {tPricing('proPlan')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {tPricing('proPlanDescription')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">1 zł</span>
                  <span className="text-gray-500">/{tPricing('month')}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-700 font-medium">{tPricing('featurePrioritySupport')}</span>
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
                      {tPricing('processing')}
                    </span>
                  ) : isPro ? (
                    tPricing('currentPlan')
                  ) : (
                    tPricing('upgradeToPro')
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            {t('ctaSubtitle')}
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" onClick={handleGetStarted}>
            {t('ctaButton')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xl font-bold text-white">SuperRAG</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="mailto:support@superrag.app" className="hover:text-white transition-colors">
                {t('footerContact')}
              </a>
              <a href="/pricing" className="hover:text-white transition-colors">
                {t('footerPricing')}
              </a>
            </div>
            <p className="text-sm">
              © 2025 SuperRAG. {t('footerRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
