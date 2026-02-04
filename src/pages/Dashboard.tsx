import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NotebookGrid from '@/components/dashboard/NotebookGrid';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const hasNotebooks = notebooks && notebooks.length > 0;

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('welcome')}
            </h1>
          </div>
          <div className="text-center py-16">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--accent-primary)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('welcome')}
            </h1>
          </div>
          <div className="text-center py-16">
            <p style={{ color: 'var(--error)' }}>{t('error', { error: authError })}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('welcome')}
            </h1>
          </div>
          <div className="text-center py-16">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--accent-primary)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1
              className="text-4xl font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('welcome')}
            </h1>
          </div>
          <div className="text-center py-16">
            <p style={{ color: 'var(--error)' }}>{t('error', { error })}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <DashboardHeader userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-6 py-[60px]">
        <div className="mb-8">
          <h1
            className="font-medium mb-2 text-5xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('welcome')}
          </h1>
        </div>

        {hasNotebooks ? <NotebookGrid /> : <EmptyDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
