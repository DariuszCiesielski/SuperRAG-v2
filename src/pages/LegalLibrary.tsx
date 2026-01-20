/**
 * Strona Biblioteki Prawnej
 * Przeglądanie przepisów, orzeczeń i szablonów
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LegalDashboardHeader from '@/components/legal/LegalDashboardHeader';
import LegalLibraryBrowser from '@/components/legal/LegalLibrary/LegalLibraryBrowser';

const LegalLibrary: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <LegalDashboardHeader userEmail={user?.email} />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <LegalLibraryBrowser />
      </main>
    </div>
  );
};

export default LegalLibrary;
