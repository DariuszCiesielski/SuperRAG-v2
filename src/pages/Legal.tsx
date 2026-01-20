/**
 * Strona główna modułu pomocy prawnej (Legal Dashboard)
 * Wyświetla listę spraw użytkownika i pozwala tworzyć nowe
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Scale, FileText, BookOpen, Filter } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50">
        <LegalDashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-medium text-gray-900 mb-2">
              {t('title', 'Pomoc Prawna')}
            </h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading', 'Ładowanie...')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (authError || (isError && error)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LegalDashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-medium text-gray-900 mb-2">
              {t('title', 'Pomoc Prawna')}
            </h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">
              {t('error', 'Wystąpił błąd')}: {authError || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="min-h-screen bg-white">
      <LegalDashboardHeader userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-[60px]">
        {/* Header z tytułem i przyciskami */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-medium text-gray-900 mb-2 text-3xl md:text-5xl">
              {t('title', 'Pomoc Prawna')}
            </h1>
            <p className="text-gray-600">
              {t('subtitle', 'Zarządzaj swoimi sprawami prawnymi')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/legal/library')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {t('nav.library', 'Baza prawna')}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
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
            <TabsList>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                {t('activeCases', 'Aktywne')} ({activeCases.length})
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('archivedCases', 'Archiwum')} ({archivedCases.length})
              </TabsTrigger>
              <TabsTrigger value="all">
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
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
        <Scale className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {t('empty.title', 'Nie masz jeszcze żadnych spraw')}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {t(
          'empty.description',
          'Utwórz swoją pierwszą sprawę, aby rozpocząć korzystanie z narzędzia pomocy prawnej. Możesz dodawać dokumenty, śledzić etapy postępowania i otrzymywać pomoc w przygotowaniu pism.'
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onCreateCase}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t('newCase', 'Nowa sprawa')}
        </Button>
        <Button variant="outline" asChild>
          <a href="/legal/library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('browseLibrary', 'Przeglądaj bazę prawną')}
          </a>
        </Button>
      </div>

      {/* Informacje o funkcjach */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
        <FeatureCard
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          title={t('features.documents.title', 'Zarządzanie dokumentami')}
          description={t(
            'features.documents.description',
            'Przechowuj wszystkie dokumenty związane ze sprawą w jednym miejscu.'
          )}
        />
        <FeatureCard
          icon={<Scale className="h-6 w-6 text-blue-600" />}
          title={t('features.tracking.title', 'Śledzenie postępowania')}
          description={t(
            'features.tracking.description',
            'Monitoruj etapy sprawy od policji przez prokuraturę do sądu.'
          )}
        />
        <FeatureCard
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
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
  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
    <div className="mb-3">{icon}</div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default Legal;
