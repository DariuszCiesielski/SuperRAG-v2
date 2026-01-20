/**
 * Główny kontener przeglądarki biblioteki prawnej
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Scale, FileText, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegalCategory } from '@/types/legal';
import LegalSearchBar from './LegalSearchBar';
import RegulationsTab from './RegulationsTab';
import RulingsTab from './RulingsTab';
import TemplatesTab from './TemplatesTab';

export type LibraryTab = 'regulations' | 'rulings' | 'templates';

const LegalLibraryBrowser: React.FC = () => {
  const { t } = useTranslation('legal');
  const [activeTab, setActiveTab] = useState<LibraryTab>('regulations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<LegalCategory[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (categories: LegalCategory[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('library.title', 'Baza prawna')}
        </h1>
        <p className="text-gray-500 mt-1">
          {t('library.subtitle', 'Przeglądaj przepisy, orzecznictwo i szablony pism')}
        </p>
      </div>

      {/* Wyszukiwarka */}
      <LegalSearchBar
        value={searchQuery}
        onChange={handleSearch}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />

      {/* Zakładki */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t('library.tabs.regulations', 'Przepisy')}</span>
          </TabsTrigger>
          <TabsTrigger value="rulings" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">{t('library.tabs.rulings', 'Orzecznictwo')}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t('library.tabs.templates', 'Wzory pism')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="mt-6">
          <RegulationsTab
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </TabsContent>

        <TabsContent value="rulings" className="mt-6">
          <RulingsTab
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalLibraryBrowser;
