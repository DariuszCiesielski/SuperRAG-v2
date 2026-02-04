import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, Settings, CreditCard } from 'lucide-react';
import { useLogout } from '@/services/authService';
import Logo from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import UserMenu from '@/components/ui/UserMenu';

interface DashboardHeaderProps {
  userEmail?: string;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logout } = useLogout();

  return (
    <header
      className="px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo />
          <h1
            className="text-xl font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('app.name')}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/legal')}
            className="flex items-center gap-2"
            style={{
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent'
            }}
          >
            <Scale className="h-4 w-4" />
            {t('navigation.legal', 'Asystent Prawny')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <CreditCard className="h-4 w-4" />
          </Button>

          <LanguageSwitcher />

          <UserMenu
            userEmail={userEmail}
            onSignOut={logout}
            variant="light"
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
