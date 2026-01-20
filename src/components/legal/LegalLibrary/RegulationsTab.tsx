/**
 * Zakładka z przepisami prawnymi
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, ChevronRight, Loader2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLegalLibrary } from '@/hooks/legal/useLegalLibrary';
import {
  LegalCategory,
  LegalRegulation,
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '@/types/legal';
import RegulationViewer from './RegulationViewer';

interface RegulationsTabProps {
  searchQuery: string;
  selectedCategories: LegalCategory[];
}

const RegulationsTab: React.FC<RegulationsTabProps> = ({
  searchQuery,
  selectedCategories,
}) => {
  const { t } = useTranslation('legal');
  const { useRegulations } = useLegalLibrary();
  const [page, setPage] = useState(1);
  const [selectedRegulation, setSelectedRegulation] = useState<LegalRegulation | null>(null);

  const { data, isLoading, error } = useRegulations(
    {
      query: searchQuery || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    },
    page,
    20
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">
          {t('library.regulations.empty', 'Brak przepisów')}
        </h3>
        <p className="text-sm text-gray-500">
          {searchQuery
            ? t('library.regulations.noResults', 'Nie znaleziono przepisów pasujących do zapytania.')
            : t('library.regulations.noData', 'Baza przepisów jest pusta.')}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.totalCount / data.pageSize);

  return (
    <div className="space-y-4">
      {/* Licznik wyników */}
      <p className="text-sm text-gray-500">
        {t('library.resultsCount', 'Znaleziono: {{count}} przepisów', {
          count: data.totalCount,
        })}
      </p>

      {/* Lista przepisów */}
      <div className="space-y-3">
        {data.data.map((regulation) => (
          <Card
            key={regulation.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedRegulation(regulation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {DOCUMENT_TYPE_LABELS[regulation.document_type] || regulation.document_type}
                    </Badge>
                    {regulation.short_name && (
                      <span className="text-sm font-medium text-blue-600">
                        {regulation.short_name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {regulation.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {regulation.category.slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[cat as LegalCategory] || cat}
                      </Badge>
                    ))}
                    {regulation.category.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{regulation.category.length - 3}
                      </Badge>
                    )}
                  </div>

                  {regulation.publication_date && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {t('library.regulations.published', 'Opublikowano: {{date}}', {
                          date: formatDate(regulation.publication_date),
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t('library.pagination.prev', 'Poprzednia')}
          </Button>
          <span className="text-sm text-gray-500">
            {t('library.pagination.page', 'Strona {{current}} z {{total}}', {
              current: page,
              total: totalPages,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('library.pagination.next', 'Następna')}
          </Button>
        </div>
      )}

      {/* Dialog z podglądem przepisu */}
      <Dialog
        open={!!selectedRegulation}
        onOpenChange={(open) => !open && setSelectedRegulation(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {selectedRegulation?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedRegulation && (
            <RegulationViewer regulation={selectedRegulation} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegulationsTab;
