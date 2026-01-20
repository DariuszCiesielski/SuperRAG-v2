/**
 * Podgląd przepisu prawnego z artykułami
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LegalRegulation,
  LegalCategory,
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
} from '@/types/legal';

interface RegulationViewerProps {
  regulation: LegalRegulation;
}

const RegulationViewer: React.FC<RegulationViewerProps> = ({ regulation }) => {
  const { t } = useTranslation('legal');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  // Parsuj artykuły z JSON jeśli istnieją
  const articles = regulation.articles_json as Record<string, { title?: string; content: string }> | null;

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4">
        {/* Metadane */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase">
              {t('library.regulations.typeLabel', 'Typ')}
            </p>
            <p className="font-medium">
              {DOCUMENT_TYPE_LABELS[regulation.document_type] || regulation.document_type}
            </p>
          </div>

          {regulation.short_name && (
            <div>
              <p className="text-xs text-gray-500 uppercase">
                {t('library.regulations.shortNameLabel', 'Skrót')}
              </p>
              <p className="font-medium text-blue-600">{regulation.short_name}</p>
            </div>
          )}

          {regulation.publication_date && (
            <div>
              <p className="text-xs text-gray-500 uppercase">
                {t('library.regulations.publishedLabel', 'Opublikowano')}
              </p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(regulation.publication_date)}
              </p>
            </div>
          )}

          {regulation.effective_date && (
            <div>
              <p className="text-xs text-gray-500 uppercase">
                {t('library.regulations.effectiveLabel', 'Obowiązuje od')}
              </p>
              <p className="font-medium">{formatDate(regulation.effective_date)}</p>
            </div>
          )}
        </div>

        {/* Kategorie */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">
            {t('library.regulations.categoriesLabel', 'Kategorie')}
          </p>
          <div className="flex flex-wrap gap-2">
            {regulation.category.map((cat) => (
              <Badge key={cat} variant="secondary">
                {CATEGORY_LABELS[cat as LegalCategory] || cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Identyfikator źródła */}
        {regulation.source_identifier && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">
              {t('library.regulations.identifierLabel', 'Identyfikator')}
            </p>
            <p className="text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
              {regulation.source_identifier}
            </p>
          </div>
        )}

        {/* Artykuły (jeśli są sparsowane) */}
        {articles && Object.keys(articles).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">
              {t('library.regulations.articlesLabel', 'Artykuły')}
            </p>
            <div className="space-y-3">
              {Object.entries(articles).map(([key, article]) => (
                <div
                  key={key}
                  className="p-3 bg-white border rounded-lg hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Art. {key}
                    </Badge>
                    {article.title && (
                      <span className="text-sm font-medium text-gray-700">
                        {article.title}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {article.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treść główna (jeśli nie ma artykułów lub jako pełna treść) */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">
            {articles && Object.keys(articles).length > 0
              ? t('library.regulations.fullContentLabel', 'Pełna treść')
              : t('library.regulations.contentLabel', 'Treść')}
          </p>

          {regulation.content_html ? (
            <div
              className="prose prose-sm max-w-none bg-white p-4 border rounded-lg"
              dangerouslySetInnerHTML={{ __html: regulation.content_html }}
            />
          ) : (
            <div className="prose prose-sm max-w-none bg-white p-4 border rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {regulation.content}
              </pre>
            </div>
          )}
        </div>

        {/* Link do źródła */}
        {regulation.source_url && (
          <div className="pt-4">
            <Button variant="outline" asChild>
              <a
                href={regulation.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t('library.regulations.viewSource', 'Zobacz źródło (ISAP)')}
              </a>
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default RegulationViewer;
