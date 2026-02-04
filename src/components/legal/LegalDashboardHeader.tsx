/**
 * Nagłówek dashboardu pomocy prawnej
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, User, Settings, LogOut, CreditCard, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface LegalDashboardHeaderProps {
  userEmail?: string | null;
}

const LegalDashboardHeader: React.FC<LegalDashboardHeaderProps> = ({ userEmail }) => {
  const { t } = useTranslation('legal');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo i nawigacja */}
          <div className="flex items-center gap-8">
            <Link to="/legal" className="flex items-center gap-2">
              <Scale className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />
              <span
                className="font-semibold text-xl"
                style={{ color: 'var(--header-text)' }}
              >
                {t('brandName', 'Pomoc Prawna')}
              </span>
            </Link>

            {/* Nawigacja */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                asChild
                style={{ color: 'var(--header-text)' }}
              >
                <Link to="/legal">{t('nav.cases', 'Moje sprawy')}</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                style={{ color: 'var(--header-text)' }}
              >
                <Link to="/legal/library" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t('nav.library', 'Baza prawna')}
                </Link>
              </Button>
            </nav>
          </div>

          {/* Menu użytkownika */}
          <div className="flex items-center gap-4">
            {/* Przełącznik na InsightsLM */}
            <Button
              variant="outline"
              size="sm"
              asChild
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--header-text)'
              }}
            >
              <Link to="/dashboard">{t('nav.switchToInsights', 'InsightsLM')}</Link>
            </Button>

            {/* Dropdown użytkownika */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <User className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                {userEmail && (
                  <>
                    <div className="px-2 py-1.5">
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {userEmail}
                      </p>
                    </div>
                    <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-secondary)' }} />
                  </>
                )}
                <DropdownMenuItem
                  asChild
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    {t('nav.settings', 'Ustawienia')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Link to="/pricing" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    {t('nav.pricing', 'Cennik')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-secondary)' }} />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer"
                  style={{ color: 'var(--error)' }}
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.signOut', 'Wyloguj się')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LegalDashboardHeader;
