import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';

const Auth = () => {
  const { t } = useTranslation('common');

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('app.name')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('app.tagline')}</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
