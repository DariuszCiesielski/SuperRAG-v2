import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  FileText,
  Briefcase,
  Download,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { useLegalSubscription, useLegalLimitsDisplay, STRIPE_PRICE_ID_LEGAL_PRO } from '@/hooks/legal/useLegalSubscription';

export type UpgradeReason =
  | 'cases_limit'
  | 'documents_limit'
  | 'export_docx'
  | 'generate_documents'
  | 'full_rag'
  | 'premium_template'
  | 'general';

interface LegalUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: UpgradeReason;
}

const reasonIcons: Record<UpgradeReason, React.ElementType> = {
  cases_limit: Briefcase,
  documents_limit: FileText,
  export_docx: Download,
  generate_documents: FileText,
  full_rag: Sparkles,
  premium_template: Crown,
  general: Crown,
};

export function LegalUpgradeDialog({
  open,
  onOpenChange,
  reason = 'general',
}: LegalUpgradeDialogProps) {
  const { t } = useTranslation('legal');
  const {
    createLegalCheckout,
    isCreatingCheckout,
    limits,
  } = useLegalSubscription();
  const {
    casesRemaining,
    documentsRemaining,
    casesPercentUsed,
    documentsPercentUsed,
  } = useLegalLimitsDisplay();

  const Icon = reasonIcons[reason];

  const handleUpgrade = () => {
    createLegalCheckout(STRIPE_PRICE_ID_LEGAL_PRO);
  };

  const features = [
    { key: 'unlimited_cases', label: t('subscription.features.unlimitedCases', 'Nieograniczona liczba spraw') },
    { key: 'unlimited_docs', label: t('subscription.features.unlimitedDocs', 'Nieograniczone generowanie dokumentów') },
    { key: 'export_docx', label: t('subscription.features.exportDocx', 'Eksport do DOCX') },
    { key: 'full_rag', label: t('subscription.features.fullRag', 'Pełny dostęp do AI i bazy prawnej') },
    { key: 'premium_templates', label: t('subscription.features.premiumTemplates', 'Szablony Premium') },
    { key: 'priority_support', label: t('subscription.features.prioritySupport', 'Priorytetowe wsparcie') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {t('subscription.proLegal', 'Legal Pro')}
            </Badge>
          </div>
          <DialogTitle className="text-xl">
            {getReasonTitle(reason, t)}
          </DialogTitle>
          <DialogDescription>
            {getReasonDescription(reason, t)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current usage */}
          {(reason === 'cases_limit' || reason === 'general') && limits.cases_limit !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subscription.casesUsed', 'Wykorzystane sprawy')}</span>
                <span className="font-medium">{limits.cases_count} / {limits.cases_limit}</span>
              </div>
              <Progress value={casesPercentUsed} className="h-2" />
              {casesRemaining === 0 && (
                <p className="text-sm text-destructive">
                  {t('subscription.casesLimitReached', 'Osiągnąłeś limit spraw')}
                </p>
              )}
            </div>
          )}

          {(reason === 'documents_limit' || reason === 'general') && limits.documents_limit !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subscription.documentsUsed', 'Dokumenty w tym miesiącu')}</span>
                <span className="font-medium">{limits.documents_this_month} / {limits.documents_limit}</span>
              </div>
              <Progress value={documentsPercentUsed} className="h-2" />
              {documentsRemaining === 0 && (
                <p className="text-sm text-destructive">
                  {t('subscription.documentsLimitReached', 'Osiągnąłeś miesięczny limit dokumentów')}
                </p>
              )}
            </div>
          )}

          {/* Features list */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium mb-3">{t('subscription.whatYouGet', 'Co otrzymujesz:')}</h4>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature.key} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className="text-center py-2">
            <div className="text-3xl font-bold">
              29,99 <span className="text-lg font-normal text-muted-foreground">PLN/mies.</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('subscription.cancelAnytime', 'Możesz anulować w dowolnym momencie')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'Anuluj')}
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isCreatingCheckout}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isCreatingCheckout ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('subscription.processing', 'Przetwarzanie...')}
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                {t('subscription.upgradeToPro', 'Ulepsz do Pro')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getReasonTitle(reason: UpgradeReason, t: (key: string, fallback: string) => string): string {
  switch (reason) {
    case 'cases_limit':
      return t('subscription.titles.casesLimit', 'Osiągnąłeś limit spraw');
    case 'documents_limit':
      return t('subscription.titles.documentsLimit', 'Osiągnąłeś limit dokumentów');
    case 'export_docx':
      return t('subscription.titles.exportDocx', 'Eksport do DOCX wymaga planu Pro');
    case 'generate_documents':
      return t('subscription.titles.generateDocuments', 'Generowanie dokumentów wymaga planu Pro');
    case 'full_rag':
      return t('subscription.titles.fullRag', 'Pełny dostęp do AI wymaga planu Pro');
    case 'premium_template':
      return t('subscription.titles.premiumTemplate', 'Ten szablon jest dostępny w planie Pro');
    default:
      return t('subscription.titles.general', 'Odblokuj pełne możliwości');
  }
}

function getReasonDescription(reason: UpgradeReason, t: (key: string, fallback: string) => string): string {
  switch (reason) {
    case 'cases_limit':
      return t('subscription.descriptions.casesLimit', 'Ulepsz do planu Pro, aby tworzyć nieograniczoną liczbę spraw i śledzić wszystkie swoje postępowania.');
    case 'documents_limit':
      return t('subscription.descriptions.documentsLimit', 'Ulepsz do planu Pro, aby generować nieograniczoną liczbę dokumentów miesięcznie.');
    case 'export_docx':
      return t('subscription.descriptions.exportDocx', 'Eksportuj wygenerowane pisma do edytowalnych dokumentów Word (.docx).');
    case 'generate_documents':
      return t('subscription.descriptions.generateDocuments', 'Automatycznie generuj profesjonalne pisma prawne na podstawie szablonów.');
    case 'full_rag':
      return t('subscription.descriptions.fullRag', 'Uzyskaj pełny dostęp do asystenta AI z zaawansowanym wyszukiwaniem w bazie prawnej.');
    case 'premium_template':
      return t('subscription.descriptions.premiumTemplate', 'Ten profesjonalny szablon jest dostępny wyłącznie dla użytkowników Pro.');
    default:
      return t('subscription.descriptions.general', 'Przejdź na plan Pro i uzyskaj pełny dostęp do wszystkich funkcji Asystenta Prawnego.');
  }
}

// Hook do łatwego używania dialogu upgrade
export function useLegalUpgradeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<UpgradeReason>('general');

  const openUpgradeDialog = (upgradeReason: UpgradeReason = 'general') => {
    setReason(upgradeReason);
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    reason,
    openUpgradeDialog,
    UpgradeDialog: () => (
      <LegalUpgradeDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        reason={reason}
      />
    ),
  };
}
