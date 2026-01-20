/**
 * Dialog tworzenia nowej sprawy prawnej
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Crown } from 'lucide-react';
import { useLegalCases } from '@/hooks/legal/useLegalCases';
import {
  CATEGORY_LABELS,
  STAGE_TYPE_LABELS,
  PARTY_TYPE_LABELS,
  type LegalCategory,
  type ProceedingStageType,
  type PartyType,
} from '@/types/legal';
import { useToast } from '@/hooks/use-toast';
import { useLegalSubscription, useLegalLimitsDisplay } from '@/hooks/legal/useLegalSubscription';
import { LegalUpgradeDialog } from './LegalUpgradeDialog';

const formSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć co najmniej 3 znaki'),
  description: z.string().optional(),
  category: z.enum([
    'cywilne',
    'administracyjne',
    'pracownicze',
    'konsumenckie',
    'rodzinne',
    'spadkowe',
    'nieruchomosci',
    'umowy',
    'karne',
    'wykroczenia',
  ] as const),
  case_number: z.string().optional(),
  current_stage: z.enum([
    'policja',
    'prokuratura',
    'sad_rejonowy',
    'sad_okregowy',
    'sad_apelacyjny',
    'sad_najwyzszy',
    'organ_administracyjny',
    'wsa',
    'nsa',
    'komornik',
    'mediacja',
    'arbitraz',
    'inne',
  ] as const).optional(),
  user_role: z.enum([
    'powod',
    'pozwany',
    'wnioskodawca',
    'uczestnik',
    'oskarzyciel',
    'oskarzony',
    'pokrzywdzony',
    'swiadek',
    'biegly',
    'interwenient',
    'kurator',
    'pelnomonik',
  ] as const).optional(),
  opponent_name: z.string().optional(),
  opponent_type: z.string().optional(),
  deadline_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCaseDialog: React.FC<CreateCaseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCaseAsync, isCreating } = useLegalCases();
  const { canCreateCase, limits } = useLegalSubscription();
  const { casesRemaining, casesPercentUsed } = useLegalLimitsDisplay();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'cywilne',
      case_number: '',
      current_stage: undefined,
      user_role: undefined,
      opponent_name: '',
      opponent_type: '',
      deadline_date: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    // Check limit before creating
    if (!canCreateCase) {
      setShowUpgradeDialog(true);
      return;
    }
    try {
      const newCase = await createCaseAsync({
        title: data.title,
        description: data.description,
        category: data.category as LegalCategory,
        case_number: data.case_number || undefined,
        current_stage: data.current_stage as ProceedingStageType | undefined,
        user_role: data.user_role as PartyType | undefined,
        opponent_name: data.opponent_name,
        opponent_type: data.opponent_type,
        deadline_date: data.deadline_date || undefined,
      });

      toast({
        title: t('toast.caseCreated', 'Sprawa utworzona'),
        description: t('toast.caseCreatedDesc', 'Możesz teraz dodawać dokumenty i śledzić postępowanie.'),
      });

      form.reset();
      onOpenChange(false);

      // Przekieruj do nowej sprawy
      navigate(`/legal/case/${newCase.id}`);
    } catch (error) {
      toast({
        title: t('toast.error', 'Błąd'),
        description: t('toast.createError', 'Nie udało się utworzyć sprawy. Spróbuj ponownie.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createCase.title', 'Nowa sprawa')}</DialogTitle>
          <DialogDescription>
            {t(
              'createCase.description',
              'Utwórz nową sprawę prawną. Będziesz mógł dodać dokumenty i śledzić postępowanie.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tytuł */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCase.titleLabel', 'Nazwa sprawy')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'createCase.titlePlaceholder',
                        'np. Sprawa o zapłatę czynszu'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCase.categoryLabel', 'Kategoria')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('createCase.categoryPlaceholder', 'Wybierz kategorię')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sygnatura i Etap postępowania */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="case_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('createCase.caseNumberLabel', 'Sygnatura (opcjonalnie)')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('createCase.caseNumberPlaceholder', 'np. II K 123/24')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createCase.currentStageLabel', 'Etap postępowania')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createCase.selectStage', 'Wybierz etap')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rola użytkownika w sprawie */}
            <FormField
              control={form.control}
              name="user_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCase.userRoleLabel', 'Twoja rola w sprawie')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCase.selectRole', 'Wybierz rolę')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PARTY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Opis */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createCase.descriptionLabel', 'Opis (opcjonalnie)')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'createCase.descriptionPlaceholder',
                        'Krótki opis sprawy...'
                      )}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Przeciwnik */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="opponent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('createCase.opponentLabel', 'Przeciwnik (opcjonalnie)')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('createCase.opponentPlaceholder', 'Nazwa/imię')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opponent_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('createCase.opponentTypeLabel', 'Typ')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('createCase.selectType', 'Wybierz')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="osoba">
                          {t('opponentTypes.person', 'Osoba fizyczna')}
                        </SelectItem>
                        <SelectItem value="firma">
                          {t('opponentTypes.company', 'Firma')}
                        </SelectItem>
                        <SelectItem value="urzad">
                          {t('opponentTypes.office', 'Urząd/Instytucja')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Termin */}
            <FormField
              control={form.control}
              name="deadline_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('createCase.deadlineLabel', 'Termin (opcjonalnie)')}
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'createCase.deadlineDescription',
                      'Np. termin na wniesienie pisma lub data rozprawy'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Limit info */}
            {limits.cases_limit !== null && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('createCase.casesUsed', 'Wykorzystane sprawy')}
                  </span>
                  <span className="font-medium">
                    {limits.cases_count} / {limits.cases_limit}
                  </span>
                </div>
                <Progress value={casesPercentUsed} className="h-2" />
                {!canCreateCase && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('createCase.limitReached', 'Osiągnąłeś limit spraw. Ulepsz do planu Pro, aby tworzyć więcej.')}
                    </AlertDescription>
                  </Alert>
                )}
                {casesRemaining !== null && casesRemaining > 0 && casesRemaining <= 1 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {t('createCase.almostAtLimit', 'Pozostała {{count}} sprawa', { count: casesRemaining })}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel', 'Anuluj')}
              </Button>
              {!canCreateCase ? (
                <Button
                  type="button"
                  onClick={() => setShowUpgradeDialog(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  {t('createCase.upgradeToPro', 'Ulepsz do Pro')}
                </Button>
              ) : (
                <Button type="submit" disabled={isCreating}>
                  {isCreating
                    ? t('creating', 'Tworzenie...')
                    : t('create', 'Utwórz sprawę')}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Upgrade dialog */}
      <LegalUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        reason="cases_limit"
      />
    </Dialog>
  );
};

export default CreateCaseDialog;
