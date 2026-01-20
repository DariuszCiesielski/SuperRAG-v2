/**
 * Dialog do dodawania dokumentów do sprawy prawnej
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useCaseDocuments, type CreateDocumentData } from '@/hooks/legal/useCaseDocuments';

interface AddCaseDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
}

const DOCUMENT_TYPES = [
  { value: 'pozew', label: 'Pozew' },
  { value: 'odpowiedz', label: 'Odpowied\u017a na pozew' },
  { value: 'wniosek', label: 'Wniosek' },
  { value: 'odwolanie', label: 'Odwo\u0142anie' },
  { value: 'skarga', label: 'Skarga' },
  { value: 'umowa', label: 'Umowa' },
  { value: 'faktura', label: 'Faktura' },
  { value: 'wezwanie', label: 'Wezwanie' },
  { value: 'protokol', label: 'Protok\u00f3\u0142' },
  { value: 'wyrok', label: 'Wyrok' },
  { value: 'postanowienie', label: 'Postanowienie' },
  { value: 'decyzja', label: 'Decyzja' },
  { value: 'pismo', label: 'Pismo procesowe' },
  { value: 'dowod', label: 'Dow\u00f3d' },
  { value: 'inne', label: 'Inne' },
];

const AddCaseDocumentDialog = ({
  open,
  onOpenChange,
  caseId,
}: AddCaseDocumentDialogProps) => {
  const { t } = useTranslation('legal');
  const { addDocumentAsync, isAdding, isUploading } = useCaseDocuments(caseId);

  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDocumentType('');
    setDocumentDate('');
    setContent('');
    setSelectedFile(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const documentData: CreateDocumentData = {
        caseId,
        title: title.trim(),
        document_type: documentType || undefined,
        document_date: documentDate || undefined,
        content: content.trim() || undefined,
        file: selectedFile || undefined,
      };

      await addDocumentAsync(documentData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const isSubmitting = isAdding || isUploading;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('addDocument', 'Dodaj dokument')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tytu\u0142 */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('documentTitle', 'Tytu\u0142 dokumentu')} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('documentTitlePlaceholder', 'np. Pozew o zap\u0142at\u0119')}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Typ dokumentu */}
          <div className="space-y-2">
            <Label htmlFor="documentType">{t('documentType', 'Typ dokumentu')}</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectDocumentType', 'Wybierz typ dokumentu')} />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data dokumentu */}
          <div className="space-y-2">
            <Label htmlFor="documentDate">{t('documentDate', 'Data dokumentu')}</Label>
            <Input
              id="documentDate"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Upload pliku */}
          <div className="space-y-2">
            <Label>{t('attachFile', 'Za\u0142\u0105cz plik')}</Label>
            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {t('dragDropFile', 'Przeci\u0105gnij plik lub kliknij')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, TXT, DOC, DOCX (max 10MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Tre\u015b\u0107 / notatki */}
          <div className="space-y-2">
            <Label htmlFor="content">{t('contentNotes', 'Tre\u015b\u0107 / notatki')}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('contentNotesPlaceholder', 'Opcjonalnie dodaj tre\u015b\u0107 lub notatki do dokumentu...')}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common:cancel', 'Anuluj')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? t('uploading', 'Przesy\u0142anie...') : t('adding', 'Dodawanie...')}
                </>
              ) : (
                t('addDocument', 'Dodaj dokument')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCaseDocumentDialog;
