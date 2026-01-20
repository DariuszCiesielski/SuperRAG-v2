/**
 * Podgląd wygenerowanego dokumentu prawnego
 * Wyświetla sformatowaną treść dokumentu przed eksportem
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LegalTemplate, DOCUMENT_TYPE_LABELS } from '@/types/legal';

interface DocumentPreviewProps {
  content: string;
  template: LegalTemplate | null;
  isLoading?: boolean;
  error?: string | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  template,
  isLoading,
  error,
}) => {
  const { t } = useTranslation('legal');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">
          {t('generator.generatingPreview', 'Generowanie podglądu dokumentu...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">
          {t('generator.previewError', 'Błąd generowania')}
        </h3>
        <p className="text-sm text-red-600 text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">
          {t('generator.noPreview', 'Brak podglądu dokumentu.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {t('generator.preview', 'Podgląd dokumentu')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('generator.previewDesc', 'Sprawdź wygenerowany dokument przed zapisaniem.')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-600" />
              {t('generator.copied', 'Skopiowano')}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              {t('generator.copyText', 'Kopiuj tekst')}
            </>
          )}
        </Button>
      </div>

      {/* Info o szablonie */}
      {template && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Badge variant="outline">
            {DOCUMENT_TYPE_LABELS[template.document_type]}
          </Badge>
          <span>{template.title}</span>
        </div>
      )}

      {/* Podgląd dokumentu */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Nagłówek dokumentu (symulacja strony A4) */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="h-4 w-4" />
            <span>A4 (210 x 297 mm)</span>
          </div>
          <div className="text-xs text-gray-400">
            {t('generator.documentPreview', 'Podgląd dokumentu')}
          </div>
        </div>

        {/* Treść dokumentu */}
        <ScrollArea className="h-[500px]">
          <div className="p-8 max-w-[210mm] mx-auto">
            {/* Renderowanie treści z zachowaniem formatowania */}
            <div
              className={cn(
                'prose prose-sm max-w-none',
                'font-serif leading-relaxed',
                '[&_p]:mb-4 [&_p]:text-justify',
                '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-center',
                '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3',
                '[&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2',
                '[&_.right]:text-right',
                '[&_.center]:text-center',
                '[&_.signature]:mt-12 [&_.signature]:text-right'
              )}
            >
              {/* Parsowanie i wyświetlanie treści */}
              {content.split('\n\n').map((paragraph, idx) => {
                // Sprawdź czy to nagłówek
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={idx} className="text-center">
                      {paragraph.slice(2)}
                    </h1>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx}>{paragraph.slice(3)}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx}>{paragraph.slice(4)}</h3>;
                }

                // Sprawdź czy to element z wyrównaniem
                if (paragraph.startsWith('[PRAWY]')) {
                  return (
                    <p key={idx} className="text-right">
                      {paragraph.slice(7).trim()}
                    </p>
                  );
                }
                if (paragraph.startsWith('[ŚRODEK]')) {
                  return (
                    <p key={idx} className="text-center">
                      {paragraph.slice(8).trim()}
                    </p>
                  );
                }
                if (paragraph.startsWith('[PODPIS]')) {
                  return (
                    <div key={idx} className="mt-12 text-right">
                      <p className="mb-8">_______________________</p>
                      <p>{paragraph.slice(8).trim()}</p>
                    </div>
                  );
                }

                // Zwykły paragraf
                return (
                  <p key={idx} className="whitespace-pre-wrap">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Wskazówka */}
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          {t(
            'generator.previewHint',
            'Możesz jeszcze wrócić i edytować dane formularza. Po kliknięciu "Zapisz dokument" dokument zostanie zapisany w systemie.'
          )}
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;
