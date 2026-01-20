/**
 * Wyszukiwarka dla biblioteki prawnej
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { LegalCategory, CATEGORY_LABELS } from '@/types/legal';

interface LegalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCategories: LegalCategory[];
  onCategoryChange: (categories: LegalCategory[]) => void;
}

const ALL_CATEGORIES: LegalCategory[] = [
  'cywilne',
  'administracyjne',
  'pracownicze',
  'konsumenckie',
  'rodzinne',
  'spadkowe',
  'nieruchomosci',
  'umowy',
  'karne',
  'wykroczenia',
];

const LegalSearchBar: React.FC<LegalSearchBarProps> = ({
  value,
  onChange,
  selectedCategories,
  onCategoryChange,
}) => {
  const { t } = useTranslation('legal');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCategoryToggle = (category: LegalCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Pole wyszukiwania */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('library.search.placeholder', 'Szukaj przepisów, orzeczeń, szablonów...')}
            className="pl-10"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtr kategorii */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('library.search.filter', 'Filtry')}
              </span>
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {t('library.search.categories', 'Kategorie')}
                </h4>
                {selectedCategories.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('library.search.clearFilters', 'Wyczyść')}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ALL_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <span>{CATEGORY_LABELS[category]}</span>
                  </label>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Aktywne filtry */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleCategoryToggle(category)}
            >
              {CATEGORY_LABELS[category]}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default LegalSearchBar;
