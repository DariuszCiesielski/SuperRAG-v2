/**
 * Komponent eksportu wygenerowanego dokumentu
 * Umożliwia pobranie dokumentu w różnych formatach (DOCX, PDF, TXT)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  FileType,
  FileCheck,
  Loader2,
  CheckCircle,
  Copy,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LegalTemplate, DOCUMENT_TYPE_LABELS } from '@/types/legal';

interface DocumentExporterProps {
  content: string;
  template: LegalTemplate | null;
  onExport: () => Promise<void>;
  isExporting?: boolean;
}

const DocumentExporter: React.FC<DocumentExporterProps> = ({
  content,
  template,
  onExport,
  isExporting,
}) => {
  const { t } = useTranslation('legal');
  const [exportedDocx, setExportedDocx] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleExportDocx = async () => {
    await onExport();
    setExportedDocx(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${template?.title || 'Dokument'}</title>
            <style>
              body {
                font-family: 'Times New Roman', Times, serif;
                font-size: 12pt;
                line-height: 1.6;
                max-width: 210mm;
                margin: 20mm auto;
                padding: 0 20mm;
              }
              h1 { text-align: center; font-size: 14pt; margin-bottom: 24pt; }
              h2 { font-size: 13pt; margin-bottom: 12pt; }
              p { text-align: justify; margin-bottom: 12pt; }
              .right { text-align: right; }
              .center { text-align: center; }
              .signature { margin-top: 48pt; text-align: right; }
            </style>
          </head>
          <body>
            ${content
              .split('\n\n')
              .map((p) => {
                if (p.startsWith('# ')) return `<h1>${p.slice(2)}</h1>`;
                if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
                if (p.startsWith('[PRAWY]')) return `<p class="right">${p.slice(7).trim()}</p>`;
                if (p.startsWith('[ŚRODEK]')) return `<p class="center">${p.slice(8).trim()}</p>`;
                if (p.startsWith('[PODPIS]'))
                  return `<div class="signature"><p>_______________________</p><p>${p.slice(8).trim()}</p></div>`;
                return `<p>${p}</p>`;
              })
              .join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Nagłówek sukcesu */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('generator.documentSaved', 'Dokument zapisany!')}
        </h2>
        <p className="text-gray-500">
          {t(
            'generator.documentSavedDesc',
            'Twój dokument został wygenerowany i zapisany. Możesz go teraz pobrać.'
          )}
        </p>
      </div>

      {/* Info o dokumencie */}
      {template && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{template.title}</h3>
                <Badge variant="outline" className="mt-1">
                  {DOCUMENT_TYPE_LABELS[template.document_type]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opcje eksportu */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">
          {t('generator.exportOptions', 'Opcje eksportu')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* DOCX */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              exportedDocx ? 'border-green-500 bg-green-50' : ''
            }`}
            onClick={!isExporting ? handleExportDocx : undefined}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  exportedDocx ? 'bg-green-200' : 'bg-blue-100'
                }`}
              >
                {isExporting ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : exportedDocx ? (
                  <FileCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <FileType className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Microsoft Word (.docx)</h4>
                <p className="text-sm text-gray-500">
                  {t('generator.docxDesc', 'Edytowalny dokument Word')}
                </p>
              </div>
              <Button
                variant={exportedDocx ? 'outline' : 'default'}
                size="sm"
                disabled={isExporting}
                className={exportedDocx ? 'bg-green-600 text-white hover:bg-green-700' : ''}
              >
                {exportedDocx ? (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    {t('generator.downloaded', 'Pobrano')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    {t('generator.download', 'Pobierz')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Kopiuj tekst */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              copied ? 'border-green-500 bg-green-50' : ''
            }`}
            onClick={handleCopy}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  copied ? 'bg-green-200' : 'bg-gray-100'
                }`}
              >
                {copied ? (
                  <FileCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {t('generator.copyToClipboard', 'Kopiuj do schowka')}
                </h4>
                <p className="text-sm text-gray-500">
                  {t('generator.copyDesc', 'Skopiuj tekst dokumentu')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    {t('generator.copied', 'Skopiowano')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    {t('generator.copy', 'Kopiuj')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Drukuj */}
          <Card
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={handlePrint}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Printer className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {t('generator.print', 'Drukuj')}
                </h4>
                <p className="text-sm text-gray-500">
                  {t('generator.printDesc', 'Wydrukuj dokument')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" />
                {t('generator.print', 'Drukuj')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Informacja */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>
          {t(
            'generator.exportInfo',
            'Wygenerowany dokument został zapisany w Twojej sprawie. Możesz do niego wrócić w każdej chwili z poziomu widoku sprawy.'
          )}
        </p>
      </div>
    </div>
  );
};

export default DocumentExporter;
