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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo i nawigacja */}
          <div className="flex items-center gap-8">
            <Link to="/legal" className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-xl text-gray-900">
                {t('brandName', 'Pomoc Prawna')}
              </span>
            </Link>

            {/* Nawigacja */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" asChild>
                <Link to="/legal">{t('nav.cases', 'Moje sprawy')}</Link>
              </Button>
              <Button variant="ghost" asChild>
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">{t('nav.switchToInsights', 'InsightsLM')}</Link>
            </Button>

            {/* Dropdown użytkownika */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userEmail && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    {t('nav.settings', 'Ustawienia')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    {t('nav.pricing', 'Cennik')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600"
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
