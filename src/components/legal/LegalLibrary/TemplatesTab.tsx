/**
 * Zakładka z szablonami pism prawnych
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Star, Lock, ChevronRight, Loader2, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLegalLibrary } from '@/hooks/legal/useLegalLibrary';
import {
  LegalCategory,
  LegalTemplate,
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '@/types/legal';

interface TemplatesTabProps {
  searchQuery: string;
  selectedCategories: LegalCategory[];
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({
  searchQuery,
  selectedCategories,
}) => {
  const { t } = useTranslation('legal');
  const { useTemplates, useIncrementTemplatePopularity } = useLegalLibrary();
  const [page, setPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);

  const incrementPopularity = useIncrementTemplatePopularity();

  const { data, isLoading, error } = useTemplates(
    {
      query: searchQuery || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    },
    page,
    20
  );

  const handleTemplateClick = (template: LegalTemplate) => {
    setSelectedTemplate(template);
    // Zwiększ popularność szablonu przy podglądzie
    incrementPopularity.mutate(template.id);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    // TODO: Przekierowanie do generatora dokumentów z tym szablonem
    console.log('Use template:', selectedTemplate.id);
  };

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

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">
          {t('library.templates.empty', 'Brak szablonów')}
        </h3>
        <p className="text-sm text-gray-500">
          {searchQuery
            ? t('library.templates.noResults', 'Nie znaleziono szablonów pasujących do zapytania.')
            : t('library.templates.noData', 'Baza szablonów jest pusta.')}
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.totalCount / data.pageSize);

  return (
    <div className="space-y-4">
      {/* Licznik wyników */}
      <p className="text-sm text-gray-500">
        {t('library.resultsCountTemplates', 'Znaleziono: {{count}} szablonów', {
          count: data.totalCount,
        })}
      </p>

      {/* Galeria szablonów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-shadow relative"
            onClick={() => handleTemplateClick(template)}
          >
            {template.is_premium && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-amber-500 hover:bg-amber-600">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2">
                    {DOCUMENT_TYPE_LABELS[template.document_type] || template.document_type}
                  </Badge>

                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {template.title}
                  </h3>

                  {template.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
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

                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Star className="h-3 w-3" />
                    <span>{template.popularity_score || 0}</span>
                  </div>
                </div>
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

      {/* Dialog z podglądem szablonu */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              {selectedTemplate?.title}
              {selectedTemplate?.is_premium && (
                <Badge className="bg-amber-500 ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Opis */}
                {selectedTemplate.description && (
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                )}

                {/* Metadane */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('library.templates.typeLabel', 'Typ dokumentu')}
                    </p>
                    <p className="font-medium">
                      {DOCUMENT_TYPE_LABELS[selectedTemplate.document_type]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('library.templates.popularityLabel', 'Popularność')}
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      {selectedTemplate.popularity_score || 0}
                    </p>
                  </div>
                </div>

                {/* Kategorie */}
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    {t('library.templates.categoriesLabel', 'Kategorie')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {CATEGORY_LABELS[cat as LegalCategory] || cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Podstawa prawna */}
                {selectedTemplate.legal_basis && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.templates.legalBasisLabel', 'Podstawa prawna')}
                    </p>
                    <p className="text-gray-700">{selectedTemplate.legal_basis}</p>
                  </div>
                )}

                {/* Instrukcje */}
                {selectedTemplate.usage_instructions && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.templates.instructionsLabel', 'Instrukcja użycia')}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedTemplate.usage_instructions}
                    </p>
                  </div>
                )}

                {/* Wymagane pola */}
                {selectedTemplate.template_fields && selectedTemplate.template_fields.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.templates.fieldsLabel', 'Wymagane pola')}
                    </p>
                    <div className="space-y-2">
                      {selectedTemplate.template_fields.map((field, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">{field.label}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                {t('library.templates.required', 'Wymagane')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Przykład wypełnienia */}
                {selectedTemplate.example_filled && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">
                      {t('library.templates.exampleLabel', 'Przykład wypełnienia')}
                    </p>
                    <div className="prose prose-sm max-w-none bg-white p-4 border rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {selectedTemplate.example_filled}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              {t('cancel', 'Anuluj')}
            </Button>
            <Button onClick={handleUseTemplate} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              {t('library.templates.useTemplate', 'Użyj szablonu')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesTab;
