/**
 * Lista wygenerowanych dokumentów prawnych dla danej sprawy
 * Wyświetla dokumenty z możliwością podglądu, pobrania i usunięcia
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Plus,
  Loader2,
  MoreVertical,
  Calendar,
  FileType,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLegalTemplates } from '@/hooks/legal/useLegalTemplates';
import {
  GeneratedLegalDocument,
  DOCUMENT_TYPE_LABELS,
} from '@/types/legal';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface GeneratedDocumentsListProps {
  caseId: string;
}

const GeneratedDocumentsList: React.FC<GeneratedDocumentsListProps> = ({
  caseId,
}) => {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    useGeneratedDocuments,
    useDeleteGeneratedDocument,
    getDocxDownloadUrl,
  } = useLegalTemplates();

  const { data: documents, isLoading, error } = useGeneratedDocuments(caseId);
  const deleteDocument = useDeleteGeneratedDocument();

  const [previewDocument, setPreviewDocument] = useState<GeneratedLegalDocument | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Obsługa pobrania dokumentu
  const handleDownload = async (doc: GeneratedLegalDocument) => {
    if (!doc.docx_file_path) {
      toast({
        title: t('generator.noFile', 'Brak pliku'),
        description: t('generator.noFileDesc', 'Plik DOCX nie został wygenerowany.'),
        variant: 'destructive',
      });
      return;
    }

    const url = await getDocxDownloadUrl(doc.docx_file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Obsługa usunięcia dokumentu
  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      setDeleteConfirmId(null);
      toast({
        title: t('generator.deleted', 'Usunięto'),
        description: t('generator.deletedDesc', 'Dokument został usunięty.'),
      });
    } catch (error) {
      toast({
        title: t('error', 'Błąd'),
        description: t('generator.deleteError', 'Nie udało się usunąć dokumentu.'),
        variant: 'destructive',
      });
    }
  };

  // Przejście do generatora dokumentów
  const handleCreateNew = () => {
    navigate(`/legal/generator?caseId=${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">
          {t('error', 'Wystąpił błąd')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">
            {t('generator.documents', 'Wygenerowane dokumenty')}
          </h2>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-1" />
            {t('generator.new', 'Nowy')}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {documents?.length || 0} {t('generator.documentsCount', 'dokumentów')}
        </p>
      </div>

      {/* Lista dokumentów */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {!documents || documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                {t('generator.noDocuments', 'Brak wygenerowanych dokumentów')}
              </p>
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('generator.createFirst', 'Utwórz pierwszy dokument')}
              </Button>
            </div>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}
                        </Badge>
                        {doc.is_draft && (
                          <Badge variant="secondary" className="text-xs">
                            {t('generator.draft', 'Szkic')}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {doc.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(doc.created_at), 'dd MMM yyyy, HH:mm', {
                            locale: pl,
                          })}
                        </span>
                        {doc.version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{doc.version}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewDocument(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('generator.preview', 'Podgląd')}
                        </DropdownMenuItem>
                        {doc.docx_file_path && (
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('generator.download', 'Pobierz')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete', 'Usuń')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Dialog podglądu dokumentu */}
      <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.title}</DialogTitle>
            <DialogDescription>
              {previewDocument && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {DOCUMENT_TYPE_LABELS[previewDocument.document_type]}
                  </Badge>
                  <span>
                    {format(new Date(previewDocument.created_at), 'dd MMMM yyyy', {
                      locale: pl,
                    })}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
              {previewDocument?.content.split('\n\n').map((para, idx) => {
                const trimmed = para.trim();
                if (trimmed.startsWith('# ')) {
                  return <h1 key={idx} className="text-center">{trimmed.slice(2)}</h1>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h2 key={idx}>{trimmed.slice(3)}</h2>;
                }
                if (trimmed.startsWith('[PRAWY]')) {
                  return <p key={idx} className="text-right">{trimmed.slice(7).trim()}</p>;
                }
                if (trimmed.startsWith('[ŚRODEK]')) {
                  return <p key={idx} className="text-center">{trimmed.slice(8).trim()}</p>;
                }
                return <p key={idx}>{trimmed}</p>;
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            {previewDocument?.docx_file_path && (
              <Button onClick={() => previewDocument && handleDownload(previewDocument)}>
                <Download className="h-4 w-4 mr-2" />
                {t('generator.downloadDocx', 'Pobierz DOCX')}
              </Button>
            )}
            <Button variant="outline" onClick={() => setPreviewDocument(null)}>
              {t('generator.close', 'Zamknij')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert potwierdzenia usunięcia */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('generator.deleteConfirmTitle', 'Usunąć dokument?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'generator.deleteConfirmDesc',
                'Ta operacja jest nieodwracalna. Dokument zostanie trwale usunięty.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', 'Anuluj')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDocument.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('delete', 'Usuń')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GeneratedDocumentsList;
