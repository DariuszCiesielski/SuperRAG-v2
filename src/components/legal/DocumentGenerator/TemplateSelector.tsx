/**
 * Komponent wyboru szablonu dokumentu prawnego
 * Wyświetla listę dostępnych szablonów z filtrowaniem
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Star, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLegalLibrary } from '@/hooks/legal/useLegalLibrary';
import {
  LegalTemplate,
  LegalCategory,
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '@/types/legal';

interface TemplateSelectorProps {
  onSelect: (template: LegalTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const { t } = useTranslation('legal');
  const { useTemplates } = useLegalLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useTemplates(
    {
      query: searchQuery || undefined,
      categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
    },
    page,
    50
  );

  const categories = Object.entries(CATEGORY_LABELS) as [LegalCategory, string][];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t('error', 'Wystąpił błąd')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {t('generator.selectTemplate', 'Wybierz szablon')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('generator.selectTemplateDesc', 'Wybierz szablon dokumentu, który chcesz wygenerować.')}
        </p>
      </div>

      {/* Filtry */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('generator.searchTemplates', 'Szukaj szablonów...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as LegalCategory | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('generator.allCategories', 'Wszystkie kategorie')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('generator.allCategories', 'Wszystkie kategorie')}
            </SelectItem>
            {categories.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista szablonów */}
      <ScrollArea className="h-[400px]">
        {!data || data.data.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery
                ? t('generator.noTemplatesFound', 'Nie znaleziono szablonów.')
                : t('generator.noTemplates', 'Brak dostępnych szablonów.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {data.data.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
                onClick={() => onSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {DOCUMENT_TYPE_LABELS[template.document_type] || template.document_type}
                        </Badge>
                        {template.is_premium && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1">
                        {template.title}
                      </h3>

                      {template.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.category.slice(0, 2).map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[cat as LegalCategory] || cat}
                            </Badge>
                          ))}
                          {template.category.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.category.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Star className="h-3 w-3" />
                          <span>{template.popularity_score || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {data && data.totalCount > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {t('generator.templatesCount', 'Znaleziono {{count}} szablonów', {
            count: data.totalCount,
          })}
        </p>
      )}
    </div>
  );
};

export default TemplateSelector;
