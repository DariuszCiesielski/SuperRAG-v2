/**
 * Zakładka z orzecznictwem
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Calendar, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLegalLibrary } from '@/hooks/legal/useLegalLibrary';
import { LegalCategory, LegalRuling, CATEGORY_LABELS } from '@/types/legal';

interface RulingsTabProps {
  searchQuery: string;
  selectedCategories: LegalCategory[];
}

const RulingsTab: React.FC<RulingsTabProps> = ({
  searchQuery,
  selectedCategories,
}) => {
  const { t } = useTranslation('legal');
  const { useRulings } = useLegalLibrary();
  const [page, setPage] = useState(1);
  const [selectedRuling, setSelectedRuling] = useState<LegalRuling | null>(null);

  const { data, isLoading, error } = useRulings(
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
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
        <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">
          {t('library.rulings.empty', 'Brak orzeczeń')}
        </h3>
        <p className="text-sm text-gray-500">
          {searchQuery
            ? t('library.rulings.noResults', 'Nie znaleziono orzeczeń pasujących do zapytania.')
            : t('library.rulings.noData', 'Baza orzeczeń jest pusta.')}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.totalCount / data.pageSize);

  return (
    <div className="space-y-4">
      {/* Licznik wyników */}
      <p className="text-sm text-gray-500">
        {t('library.resultsCountRulings', 'Znaleziono: {{count}} orzeczeń', {
          count: data.totalCount,
        })}
      </p>

      {/* Lista orzeczeń */}
      <div className="space-y-3">
        {data.data.map((ruling) => (
          <Card
            key={ruling.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedRuling(ruling)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {ruling.court_name}
                    </Badge>
                    {ruling.ruling_type && (
                      <Badge variant="secondary">
                        {ruling.ruling_type}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('library.rulings.caseNumber', 'Sygn. {{number}}', {
                      number: ruling.case_number,
                    })}
                  </h3>

                  {ruling.summary && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {ruling.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {ruling.category.slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[cat as LegalCategory] || cat}
                      </Badge>
                    ))}
                    {ruling.category.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{ruling.category.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {t('library.rulings.date', 'Data orzeczenia: {{date}}', {
                        date: formatDate(ruling.ruling_date),
                      })}
                    </span>
                  </div>
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

      {/* Dialog z podglądem orzeczenia */}
      <Dialog
        open={!!selectedRuling}
        onOpenChange={(open) => !open && setSelectedRuling(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-600" />
              {selectedRuling?.court_name} - {selectedRuling?.case_number}
            </DialogTitle>
          </DialogHeader>

          {selectedRuling && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Metadane */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('library.rulings.courtLabel', 'Sąd')}
                    </p>
                    <p className="font-medium">{selectedRuling.court_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('library.rulings.caseNumberLabel', 'Sygnatura')}
                    </p>
                    <p className="font-medium">{selectedRuling.case_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('library.rulings.dateLabel', 'Data orzeczenia')}
                    </p>
                    <p className="font-medium">{formatDate(selectedRuling.ruling_date)}</p>
                  </div>
                  {selectedRuling.ruling_type && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        {t('library.rulings.typeLabel', 'Typ')}
                      </p>
                      <p className="font-medium">{selectedRuling.ruling_type}</p>
                    </div>
                  )}
                </div>

                {/* Kategorie */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    {t('library.rulings.categoriesLabel', 'Kategorie')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRuling.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {CATEGORY_LABELS[cat as LegalCategory] || cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Streszczenie */}
                {selectedRuling.summary && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.rulings.summaryLabel', 'Streszczenie')}
                    </p>
                    <p className="text-gray-700">{selectedRuling.summary}</p>
                  </div>
                )}

                {/* Słowa kluczowe */}
                {selectedRuling.keywords && selectedRuling.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.rulings.keywordsLabel', 'Słowa kluczowe')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRuling.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treść */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    {t('library.rulings.contentLabel', 'Treść orzeczenia')}
                  </p>
                  <div className="prose prose-sm max-w-none bg-white p-4 border rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedRuling.content}
                    </pre>
                  </div>
                </div>

                {/* Link do źródła */}
                {selectedRuling.source_url && (
                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <a
                        href={selectedRuling.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('library.rulings.viewSource', 'Zobacz źródło')}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RulingsTab;
