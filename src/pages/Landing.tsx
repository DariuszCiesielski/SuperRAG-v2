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
  Star,
  Scale,
  Crown,
  Sparkles
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
      // Pass upgrade intent through URL so AuthForm can handle it after login
      navigate('/auth?intent=upgrade_pro');
      return;
    }
    createCheckoutSession(STRIPE_PRICE_ID_PRO);
  };

  const handleLegalFree = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/legal');
  };

  const handleLegalPro = () => {
    if (!user) {
      navigate('/auth?intent=upgrade_legal_pro');
      return;
    }
    navigate('/legal');
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
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Logo size="sm" />
            <span className="text-sm md:text-xl font-bold text-gray-900 hidden sm:inline">SuperRAG</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 hidden sm:inline-flex" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('navPricing')}
            </Button>
            {user ? (
              <Button size="sm" className="bg-brand hover:bg-brand-700 text-xs sm:text-sm px-2 sm:px-3 md:px-4" onClick={() => navigate('/dashboard')}>
                {t('navDashboard')}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 md:px-4" onClick={() => navigate('/auth')}>
                  {t('navLogin')}
                </Button>
                <Button size="sm" className="bg-brand hover:bg-brand-700 text-xs sm:text-sm px-2 sm:px-3 md:px-4" onClick={handleGetStarted}>
                  {t('navGetStarted')}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-brand-100 text-brand-700 hover:bg-brand-100">
            {t('heroBadge')}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('heroTitle')}
            <span className="text-brand"> {t('heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg bg-brand hover:bg-brand-700" onClick={handleGetStarted}>
              {t('heroCtaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-brand text-brand hover:bg-brand-50" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('heroCtaSecondary')}
            </Button>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-brand to-brand-700 rounded-2xl p-1 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-left">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">U</div>
                    <div className="bg-gray-700 rounded-lg p-3 text-gray-200 text-sm">
                      {t('demoQuestion')}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand to-brand-700 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-brand/20 border border-brand/30 rounded-lg p-3 text-gray-200 text-sm flex-1">
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
              <Card key={index} className="border-2 border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-brand" />
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
                  <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center mx-auto">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-brand flex items-center justify-center text-brand font-bold">
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
                      <Check className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full h-12 text-lg border-brand text-brand hover:bg-brand-50"
                  onClick={handleSelectFree}
                >
                  {user ? tPricing('goToDashboard') : tPricing('getStarted')}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-brand hover:border-brand-700 transition-colors shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-brand text-white px-4 py-1 hover:bg-brand-700">
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
                      <Check className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                    <span className="text-brand font-medium">{tPricing('featurePrioritySupport')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full h-12 text-lg bg-brand hover:bg-brand-700"
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

      {/* Legal Assistant Pricing Section */}
      <section className="py-20 px-6 bg-gray-50" id="legal-pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800">
              <Scale className="h-4 w-4 mr-1" />
              {t('legalBadge', 'Nowy moduł')}
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('legalTitle', 'Asystent Prawny')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('legalSubtitle', 'Profesjonalne narzędzie do zarządzania sprawami prawnymi, generowania dokumentów i wyszukiwania w bazie prawnej.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Legal Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Scale className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl">{t('legalFreeName', 'Darmowy')}</CardTitle>
                </div>
                <CardDescription>{t('legalFreeDesc', 'Podstawowe funkcje dla początkujących')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">0</span>
                  <span className="text-gray-500 ml-2">PLN</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalFreeFeature1', 'Do 2 aktywnych spraw')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalFreeFeature2', '3 dokumenty miesięcznie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalFreeFeature3', 'Podstawowe wyszukiwanie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalFreeFeature4', 'Dostęp do przepisów')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalFreeFeature5', 'Podstawowy chat AI')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLegalFree}
                >
                  {user ? t('legalGoToModule', 'Przejdź do modułu') : t('legalStartFree', 'Zacznij za darmo')}
                </Button>
              </CardFooter>
            </Card>

            {/* Legal Pro Plan */}
            <Card className="relative border-2 border-amber-500 hover:border-amber-600 transition-colors shadow-lg shadow-amber-500/10">
              <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-orange-500">
                {t('legalProBadge', 'Najpopularniejszy')}
              </Badge>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-xl">{t('legalProName', 'Legal Pro')}</CardTitle>
                </div>
                <CardDescription>{t('legalProDesc', 'Pełny pakiet dla wymagających użytkowników')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">29,99</span>
                  <span className="text-gray-500 ml-2">PLN/mies.</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature1', 'Nieograniczona liczba spraw')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature2', 'Nieograniczone dokumenty')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature3', 'Eksport do DOCX')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature4', 'Pełny dostęp do AI i RAG')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature5', 'Wszystkie szablony Premium')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature6', 'Dostęp do orzecznictwa')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalProFeature7', 'Priorytetowe wsparcie')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={handleLegalPro}
                >
                  {user ? t('legalUpgrade', 'Ulepsz') : t('legalSignUp', 'Zarejestruj się')}
                </Button>
              </CardFooter>
            </Card>

            {/* Legal Business Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <Badge className="absolute -top-2 right-4 bg-gray-200 text-gray-700">
                {t('legalBusinessBadge', 'Dla firm')}
              </Badge>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">{t('legalBusinessName', 'Legal Business')}</CardTitle>
                </div>
                <CardDescription>{t('legalBusinessDesc', 'Dla kancelarii i firm')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">99,99</span>
                  <span className="text-gray-500 ml-2">PLN/mies.</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature1', 'Wszystko z planu Pro')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature2', 'Dostęp do API')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature3', 'Do 5 użytkowników')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature4', 'Własne szablony')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature5', 'Dedykowane wsparcie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{t('legalBusinessFeature6', 'Gwarancja SLA')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLegalPro}
                >
                  {user ? t('legalUpgrade', 'Ulepsz') : t('legalSignUp', 'Zarejestruj się')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand to-brand-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-brand-100 mb-10">
            {t('ctaSubtitle')}
          </p>
          <Button size="lg" variant="secondary" className="h-14 px-8 text-lg bg-white text-brand hover:bg-gray-100" onClick={handleGetStarted}>
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
