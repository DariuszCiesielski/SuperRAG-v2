/**
 * Strona główna modułu pomocy prawnej (Legal Dashboard)
 * Wyświetla listę spraw użytkownika i pozwala tworzyć nowe
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Scale, FileText, BookOpen } from 'lucide-react';
import LegalDashboardHeader from '@/components/legal/LegalDashboardHeader';
import CaseGrid from '@/components/legal/CaseGrid';
import CreateCaseDialog from '@/components/legal/CreateCaseDialog';
import { useLegalCases } from '@/hooks/legal/useLegalCases';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CaseStatus } from '@/types/legal';

const Legal = () => {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { cases, activeCases, archivedCases, isLoading, error, isError } = useLegalCases();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'all'>('active');

  const hasCases = cases && cases.length > 0;

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <LegalDashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-2xl md:text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('title', 'Pomoc Prawna')}
            </h1>
          </div>
          <div className="text-center py-16">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--accent-primary)' }}
            ></div>
            <p style={{ color: 'var(--text-secondary)' }}>{t('loading', 'Ładowanie...')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (authError || (isError && error)) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <LegalDashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-2xl md:text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('title', 'Pomoc Prawna')}
            </h1>
          </div>
          <div className="text-center py-16">
            <p style={{ color: 'var(--error)' }}>
              {t('error', 'Wystąpił błąd')}: {authError || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
            >
              {t('retry', 'Spróbuj ponownie')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const displayedCases =
    activeTab === 'active'
      ? activeCases
      : activeTab === 'archived'
      ? archivedCases
      : cases;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <LegalDashboardHeader userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-[60px]">
        {/* Header z tytułem i przyciskami */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1
              className="font-medium mb-2 text-3xl md:text-5xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('title', 'Pomoc Prawna')}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('subtitle', 'Zarządzaj swoimi sprawami prawnymi')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/legal/library')}
              className="flex items-center gap-2"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <BookOpen className="h-4 w-4" />
              {t('nav.library', 'Baza prawna')}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
            >
              <Plus className="h-4 w-4" />
              {t('newCase', 'Nowa sprawa')}
            </Button>
          </div>
        </div>

        {/* Tabs dla filtrowania */}
        {hasCases && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="mb-6"
          >
            <TabsList
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <TabsTrigger
                value="active"
                className="flex items-center gap-2 data-[state=active]:bg-[var(--accent-primary)] data-[state=active]:text-[var(--text-inverse)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Scale className="h-4 w-4" />
                {t('activeCases', 'Aktywne')} ({activeCases.length})
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="flex items-center gap-2 data-[state=active]:bg-[var(--accent-primary)] data-[state=active]:text-[var(--text-inverse)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <FileText className="h-4 w-4" />
                {t('archivedCases', 'Archiwum')} ({archivedCases.length})
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[var(--accent-primary)] data-[state=active]:text-[var(--text-inverse)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('allCases', 'Wszystkie')} ({cases.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Lista spraw lub pusty stan */}
        {hasCases ? (
          <CaseGrid cases={displayedCases} />
        ) : (
          <EmptyLegalDashboard onCreateCase={() => setIsCreateDialogOpen(true)} />
        )}
      </main>

      {/* Dialog tworzenia sprawy */}
      <CreateCaseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

/**
 * Komponent pustego stanu dashboardu
 */
const EmptyLegalDashboard = ({ onCreateCase }: { onCreateCase: () => void }) => {
  const { t } = useTranslation('legal');

  return (
    <div className="text-center py-16 px-4">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
        style={{ backgroundColor: 'var(--accent-light)' }}
      >
        <Scale className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h2
        className="text-2xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {t('empty.title', 'Nie masz jeszcze żadnych spraw')}
      </h2>
      <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
        {t(
          'empty.description',
          'Utwórz swoją pierwszą sprawę, aby rozpocząć korzystanie z narzędzia pomocy prawnej. Możesz dodawać dokumenty, śledzić etapy postępowania i otrzymywać pomoc w przygotowaniu pism.'
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onCreateCase}
          className="flex items-center gap-2"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--text-inverse)'
          }}
        >
          <Plus className="h-4 w-4" />
          {t('newCase', 'Nowa sprawa')}
        </Button>
        <Button
          variant="outline"
          asChild
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <a href="/legal/library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('browseLibrary', 'Przeglądaj bazę prawną')}
          </a>
        </Button>
      </div>

      {/* Informacje o funkcjach */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
        <FeatureCard
          icon={<FileText className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          title={t('features.documents.title', 'Zarządzanie dokumentami')}
          description={t(
            'features.documents.description',
            'Przechowuj wszystkie dokumenty związane ze sprawą w jednym miejscu.'
          )}
        />
        <FeatureCard
          icon={<Scale className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          title={t('features.tracking.title', 'Śledzenie postępowania')}
          description={t(
            'features.tracking.description',
            'Monitoruj etapy sprawy od policji przez prokuraturę do sądu.'
          )}
        />
        <FeatureCard
          icon={<BookOpen className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          title={t('features.ai.title', 'Pomoc AI')}
          description={t(
            'features.ai.description',
            'Zadawaj pytania i otrzymuj odpowiedzi oparte na przepisach prawa.'
          )}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div
    className="p-4 rounded-xl border"
    style={{
      backgroundColor: 'var(--glass-bg, var(--bg-secondary))',
      backdropFilter: 'blur(var(--blur, 12px))',
      WebkitBackdropFilter: 'blur(var(--blur, 12px))',
      borderColor: 'var(--border-primary)'
    }}
  >
    <div className="mb-3">{icon}</div>
    <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
  </div>
);

export default Legal;
