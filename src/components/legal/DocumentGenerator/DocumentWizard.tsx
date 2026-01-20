/**
 * Główny kreator dokumentów prawnych ze stepper'em
 * Przeprowadza użytkownika przez proces: wybór szablonu -> wypełnienie formularza -> podgląd -> eksport
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LegalTemplate, GeneratedLegalDocument } from '@/types/legal';
import { useDocumentGenerator } from '@/hooks/legal/useDocumentGenerator';
import { useLegalSubscription, useLegalLimitsDisplay } from '@/hooks/legal/useLegalSubscription';
import { LegalUpgradeDialog } from '../LegalUpgradeDialog';
import TemplateSelector from './TemplateSelector';
import FormFiller from './FormFiller';
import DocumentPreview from './DocumentPreview';
import DocumentExporter from './DocumentExporter';

interface DocumentWizardProps {
  caseId?: string;
  onComplete?: (document: GeneratedLegalDocument) => void;
  onCancel?: () => void;
}

type WizardStep = 'select' | 'fill' | 'preview' | 'export';

const STEPS: { id: WizardStep; labelKey: string }[] = [
  { id: 'select', labelKey: 'generator.steps.select' },
  { id: 'fill', labelKey: 'generator.steps.fill' },
  { id: 'preview', labelKey: 'generator.steps.preview' },
  { id: 'export', labelKey: 'generator.steps.export' },
];

const DocumentWizard: React.FC<DocumentWizardProps> = ({
  caseId,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pobierz ID szablonu z URL jeśli przekazano
  const initialTemplateId = searchParams.get('templateId');

  const [currentStep, setCurrentStep] = useState<WizardStep>(
    initialTemplateId ? 'fill' : 'select'
  );
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'documents_limit' | 'export_docx' | 'generate_documents'>('documents_limit');

  // Subscription and limits
  const {
    canGenerateDocument,
    canExportDocx,
    canGenerateDocuments,
    limits,
  } = useLegalSubscription();
  const { documentsRemaining, documentsPercentUsed } = useLegalLimitsDisplay();

  const {
    selectedTemplate,
    formData,
    generatedContent,
    isGenerating,
    isSaving,
    generationError,
    selectTemplate,
    updateFormField,
    resetFormData,
    generatePreview,
    saveDocument,
    exportToDocx,
    reset,
  } = useDocumentGenerator(initialTemplateId || undefined);

  // Obsługa wyboru szablonu
  const handleTemplateSelect = useCallback((template: LegalTemplate) => {
    selectTemplate(template);
    setCurrentStep('fill');
  }, [selectTemplate]);

  // Obsługa zmiany pola formularza
  const handleFieldChange = useCallback((name: string, value: string | number | Date) => {
    updateFormField(name, value);
  }, [updateFormField]);

  // Generowanie podglądu
  const handleGeneratePreview = useCallback(async () => {
    const content = await generatePreview();
    if (content) {
      setCurrentStep('preview');
    }
  }, [generatePreview]);

  // Zapisanie dokumentu
  const handleSaveDocument = useCallback(async () => {
    // Check document generation limit
    if (!canGenerateDocument) {
      setUpgradeReason('documents_limit');
      setShowUpgradeDialog(true);
      return;
    }

    const document = await saveDocument(caseId);
    if (document) {
      setCurrentStep('export');
      if (onComplete) {
        onComplete(document);
      }
    }
  }, [saveDocument, caseId, onComplete, canGenerateDocument]);

  // Eksport do DOCX
  const handleExport = useCallback(async () => {
    // Check DOCX export permission
    if (!canExportDocx) {
      setUpgradeReason('export_docx');
      setShowUpgradeDialog(true);
      return;
    }

    await exportToDocx();
  }, [exportToDocx, canExportDocx]);

  // Anulowanie
  const handleCancel = useCallback(() => {
    reset();
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }, [reset, onCancel, navigate]);

  // Powrót do poprzedniego kroku
  const handleBack = useCallback(() => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  }, [currentStep]);

  // Sprawdzenie czy można przejść dalej
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'select':
        return !!selectedTemplate;
      case 'fill':
        if (!selectedTemplate) return false;
        // Sprawdź czy wszystkie wymagane pola są wypełnione
        return selectedTemplate.template_fields
          .filter(f => f.required)
          .every(f => {
            const value = formData[f.name];
            return value !== undefined && value !== '';
          });
      case 'preview':
        return !!generatedContent;
      case 'export':
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedTemplate, formData, generatedContent]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {t('generator.title', 'Generator dokumentów')}
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index < currentStepIndex
                      ? 'bg-green-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium hidden sm:inline',
                    index <= currentStepIndex
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                >
                  {t(step.labelKey, step.id)}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Limit warning */}
        {limits.documents_limit !== null && currentStep !== 'export' && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('generator.documentsUsed', 'Dokumenty w tym miesiącu')}
                </span>
                <span className="font-medium">
                  {limits.documents_this_month} / {limits.documents_limit}
                </span>
              </div>
              <Progress value={documentsPercentUsed} className="h-2" />
              {!canGenerateDocument && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('generator.limitReachedTitle', 'Limit osiągnięty')}</AlertTitle>
                  <AlertDescription>
                    {t('generator.limitReached', 'Osiągnąłeś miesięczny limit dokumentów. Ulepsz do planu Pro, aby generować więcej.')}
                  </AlertDescription>
                </Alert>
              )}
              {documentsRemaining !== null && documentsRemaining > 0 && documentsRemaining <= 1 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {t('generator.almostAtLimit', 'Pozostał {{count}} dokument do wygenerowania', { count: documentsRemaining })}
                </p>
              )}
            </div>
          </div>
        )}

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            {/* Krok 1: Wybór szablonu */}
            {currentStep === 'select' && (
              <TemplateSelector onSelect={handleTemplateSelect} />
            )}

            {/* Krok 2: Wypełnianie formularza */}
            {currentStep === 'fill' && selectedTemplate && (
              <FormFiller
                template={selectedTemplate}
                formData={formData}
                onChange={handleFieldChange}
              />
            )}

            {/* Krok 3: Podgląd */}
            {currentStep === 'preview' && (
              <DocumentPreview
                content={generatedContent}
                template={selectedTemplate}
                isLoading={isGenerating}
                error={generationError}
              />
            )}

            {/* Krok 4: Eksport */}
            {currentStep === 'export' && (
              <DocumentExporter
                content={generatedContent}
                template={selectedTemplate}
                onExport={handleExport}
                isExporting={isSaving}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer z przyciskami nawigacji */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStepIndex === 0 ? handleCancel : handleBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStepIndex === 0
              ? t('cancel', 'Anuluj')
              : t('generator.back', 'Wstecz')}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === 'fill' && (
              <Button
                onClick={handleGeneratePreview}
                disabled={!canProceed() || isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('generator.generating', 'Generowanie...')}
                  </>
                ) : (
                  <>
                    {t('generator.preview', 'Podgląd')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            {currentStep === 'preview' && (
              <Button
                onClick={handleSaveDocument}
                disabled={!canProceed() || isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('generator.saving', 'Zapisywanie...')}
                  </>
                ) : (
                  <>
                    {t('generator.save', 'Zapisz dokument')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            {currentStep === 'export' && (
              <Button
                onClick={() => navigate(caseId ? `/legal/case/${caseId}` : '/legal')}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('generator.finish', 'Zakończ')}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade dialog */}
      <LegalUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        reason={upgradeReason}
      />
    </div>
  );
};

export default DocumentWizard;
