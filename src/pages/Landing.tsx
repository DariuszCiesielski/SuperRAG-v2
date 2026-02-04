import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Youtube,
  Globe,
  Zap,
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Logo size="sm" />
            <span
              className="text-sm md:text-xl font-bold hidden sm:inline"
              style={{ color: 'var(--text-primary)' }}
            >
              SuperRAG
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 hidden sm:inline-flex"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('navPricing')}
            </Button>
            {user ? (
              <Button
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 md:px-4"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}
                onClick={() => navigate('/dashboard')}
              >
                {t('navDashboard')}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3 md:px-4"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => navigate('/auth')}
                >
                  {t('navLogin')}
                </Button>
                <Button
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3 md:px-4"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-inverse)'
                  }}
                  onClick={handleGetStarted}
                >
                  {t('navGetStarted')}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="pt-32 pb-20 px-6"
        style={{
          background: `linear-gradient(to bottom, var(--bg-tertiary), var(--bg-primary))`
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <Badge
            className="mb-6"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)'
            }}
          >
            {t('heroBadge')}
          </Badge>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('heroTitle')}
            <span style={{ color: 'var(--accent-primary)' }}> {t('heroTitleHighlight')}</span>
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto mb-10"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-14 px-8 text-lg"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
              onClick={handleGetStarted}
            >
              {t('heroCtaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg"
              style={{
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)'
              }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('heroCtaSecondary')}
            </Button>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div
              className="rounded-2xl p-1 shadow-2xl max-w-5xl mx-auto"
              style={{
                background: `linear-gradient(to right, var(--accent-primary), var(--accent-hover))`
              }}
            >
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--error)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--warning)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
                </div>
                <div
                  className="rounded-lg p-6 text-left"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-inverse)'
                      }}
                    >
                      U
                    </div>
                    <div
                      className="rounded-lg p-3 text-sm"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {t('demoQuestion')}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(to right, var(--accent-primary), var(--accent-hover))`
                      }}
                    >
                      <Brain className="w-4 h-4" style={{ color: 'var(--text-inverse)' }} />
                    </div>
                    <div
                      className="rounded-lg p-3 text-sm flex-1 border"
                      style={{
                        backgroundColor: 'var(--accent-light)',
                        borderColor: 'var(--border-accent)',
                        color: 'var(--text-secondary)'
                      }}
                    >
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
      <section
        className="py-20 px-6"
        id="features"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('featuresTitle')}
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <CardHeader>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 px-6"
        id="how-it-works"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('howItWorksTitle')}
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <step.icon className="w-10 h-10" style={{ color: 'var(--text-inverse)' }} />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="py-20 px-6"
        id="pricing"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('pricingTitle')}
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('pricingSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card
              className="relative border-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <CardHeader className="text-center pb-8">
                <CardTitle
                  className="text-2xl font-bold flex items-center justify-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Zap className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
                  {tPricing('freePlan')}
                </CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  {tPricing('freePlanDescription')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0 zł</span>
                  <span style={{ color: 'var(--text-muted)' }}>/{tPricing('month')}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {pricingFeatures.map((feature, index) => (
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
                  style={{
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary)'
                  }}
                  onClick={handleSelectFree}
                >
                  {user ? tPricing('goToDashboard') : tPricing('getStarted')}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card
              className="relative border-2 transition-colors shadow-lg"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
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
                  {tPricing('recommended')}
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle
                  className="text-2xl font-bold flex items-center justify-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Star className="h-6 w-6" style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                  {tPricing('proPlan')}
                </CardTitle>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  {tPricing('proPlanDescription')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>1 zł</span>
                  <span style={{ color: 'var(--text-muted)' }}>/{tPricing('month')}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-8">
                <ul className="space-y-3">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{tPricing('featurePrioritySupport')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full h-12 text-lg"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-inverse)'
                  }}
                  onClick={handleSelectPro}
                  disabled={isPro || isCreatingCheckout}
                >
                  {isCreatingCheckout ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="animate-spin rounded-full h-4 w-4 border-b-2"
                        style={{ borderColor: 'var(--text-inverse)' }}
                      ></span>
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
      <section
        className="py-20 px-6"
        id="legal-pricing"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              className="mb-4"
              style={{
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)'
              }}
            >
              <Scale className="h-4 w-4 mr-1" />
              {t('legalBadge', 'Nowy moduł')}
            </Badge>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('legalTitle', 'Asystent Prawny')}
            </h2>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('legalSubtitle', 'Profesjonalne narzędzie do zarządzania sprawami prawnymi, generowania dokumentów i wyszukiwania w bazie prawnej.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Legal Free Plan */}
            <Card
              className="relative border-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Scale className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                  <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>
                    {t('legalFreeName', 'Darmowy')}
                  </CardTitle>
                </div>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  {t('legalFreeDesc', 'Podstawowe funkcje dla początkujących')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0</span>
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>PLN</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalFreeFeature1', 'Do 2 aktywnych spraw')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalFreeFeature2', '3 dokumenty miesięcznie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalFreeFeature3', 'Podstawowe wyszukiwanie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalFreeFeature4', 'Dostęp do przepisów')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalFreeFeature5', 'Podstawowy chat AI')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  onClick={handleLegalFree}
                >
                  {user ? t('legalGoToModule', 'Przejdź do modułu') : t('legalStartFree', 'Zacznij za darmo')}
                </Button>
              </CardFooter>
            </Card>

            {/* Legal Pro Plan */}
            <Card
              className="relative border-2 transition-colors shadow-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--warning)'
              }}
            >
              <Badge
                className="absolute -top-2 right-4"
                style={{
                  background: 'linear-gradient(to right, var(--warning), var(--error))',
                  color: 'var(--text-inverse)'
                }}
              >
                {t('legalProBadge', 'Najpopularniejszy')}
              </Badge>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5" style={{ color: 'var(--warning)' }} />
                  <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>
                    {t('legalProName', 'Legal Pro')}
                  </CardTitle>
                </div>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  {t('legalProDesc', 'Pełny pakiet dla wymagających użytkowników')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>29,99</span>
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>PLN/mies.</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature1', 'Nieograniczona liczba spraw')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature2', 'Nieograniczone dokumenty')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature3', 'Eksport do DOCX')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature4', 'Pełny dostęp do AI i RAG')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature5', 'Wszystkie szablony Premium')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature6', 'Dostęp do orzecznictwa')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalProFeature7', 'Priorytetowe wsparcie')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  style={{
                    background: 'linear-gradient(to right, var(--warning), var(--error))',
                    color: 'var(--text-inverse)'
                  }}
                  onClick={handleLegalPro}
                >
                  {user ? t('legalUpgrade', 'Ulepsz') : t('legalSignUp', 'Zarejestruj się')}
                </Button>
              </CardFooter>
            </Card>

            {/* Legal Business Plan */}
            <Card
              className="relative border-2 transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <Badge
                className="absolute -top-2 right-4"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
              >
                {t('legalBusinessBadge', 'Dla firm')}
              </Badge>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" style={{ color: 'var(--info)' }} />
                  <CardTitle className="text-xl" style={{ color: 'var(--text-primary)' }}>
                    {t('legalBusinessName', 'Legal Business')}
                  </CardTitle>
                </div>
                <CardDescription style={{ color: 'var(--text-secondary)' }}>
                  {t('legalBusinessDesc', 'Dla kancelarii i firm')}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>99,99</span>
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>PLN/mies.</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature1', 'Wszystko z planu Pro')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature2', 'Dostęp do API')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature3', 'Do 5 użytkowników')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature4', 'Własne szablony')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature5', 'Dedykowane wsparcie')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('legalBusinessFeature6', 'Gwarancja SLA')}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
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
      <section
        className="py-20 px-6"
        style={{
          background: `linear-gradient(to right, var(--accent-primary), var(--accent-hover))`
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ color: 'var(--text-inverse)' }}
          >
            {t('ctaTitle')}
          </h2>
          <p
            className="text-xl mb-10"
            style={{ color: 'var(--accent-light)' }}
          >
            {t('ctaSubtitle')}
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-14 px-8 text-lg"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--accent-primary)'
            }}
            onClick={handleGetStarted}
          >
            {t('ctaButton')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-6"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                SuperRAG
              </span>
            </div>
            <div className="flex items-center gap-8">
              <a
                href="mailto:support@superrag.app"
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('footerContact')}
              </a>
              <a
                href="/pricing"
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('footerPricing')}
              </a>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © 2025 SuperRAG. {t('footerRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
