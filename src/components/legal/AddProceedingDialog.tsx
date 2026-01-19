/**
 * Dialog dodawania nowego etapu postępowania
 */

import React from 'react';
import { useForm } from 'react-hook-form';
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
import { useCaseProceedings } from '@/hooks/legal/useCaseProceedings';
import {
  STAGE_TYPE_LABELS,
  STAGE_TYPE_ICONS,
  OUTCOME_LABELS,
  type ProceedingStageType,
  type ProceedingOutcome,
} from '@/types/legal';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  stage_type: z.enum([
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
  ] as const),
  institution_name: z.string().min(3, 'Nazwa instytucji jest wymagana'),
  case_number: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  outcome: z.enum([
    'w_toku',
    'przekazano',
    'umorzono',
    'wyrok_korzystny',
    'wyrok_niekorzystny',
    'ugoda',
    'apelacja',
    'kasacja',
    'zakonczone',
  ] as const),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddProceedingDialogProps {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousProceedingId?: string;
}

const AddProceedingDialog: React.FC<AddProceedingDialogProps> = ({
  caseId,
  open,
  onOpenChange,
  previousProceedingId,
}) => {
  const { t } = useTranslation('legal');
  const { toast } = useToast();
  const { createProceedingAsync, isCreating } = useCaseProceedings(caseId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stage_type: 'sad_rejonowy',
      institution_name: '',
      case_number: '',
      started_at: new Date().toISOString().split('T')[0],
      ended_at: '',
      outcome: 'w_toku',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createProceedingAsync({
        case_id: caseId,
        stage_type: data.stage_type as ProceedingStageType,
        institution_name: data.institution_name,
        case_number: data.case_number || undefined,
        started_at: data.started_at || undefined,
        ended_at: data.ended_at || undefined,
        outcome: data.outcome as ProceedingOutcome,
        notes: data.notes || undefined,
        previous_proceeding_id: previousProceedingId,
      });

      toast({
        title: t('toast.proceedingCreated', 'Etap dodany'),
        description: t(
          'toast.proceedingCreatedDesc',
          'Nowy etap postępowania został dodany do sprawy.'
        ),
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('toast.error', 'Błąd'),
        description: t(
          'toast.proceedingCreateError',
          'Nie udało się dodać etapu. Spróbuj ponownie.'
        ),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('addProceeding.title', 'Dodaj etap postępowania')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'addProceeding.description',
              'Dodaj nowy etap sprawy z sygnaturą akt i informacjami o instytucji.'
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Typ etapu */}
            <FormField
              control={form.control}
              name="stage_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('addProceeding.stageType', 'Typ etapu')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <span className="flex items-center gap-2">
                            <span>{STAGE_TYPE_ICONS[value as ProceedingStageType]}</span>
                            <span>{label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nazwa instytucji */}
            <FormField
              control={form.control}
              name="institution_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('addProceeding.institutionName', 'Nazwa instytucji')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'addProceeding.institutionPlaceholder',
                        'np. Sąd Rejonowy w Krakowie, II Wydział Cywilny'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sygnatura akt */}
            <FormField
              control={form.control}
              name="case_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('addProceeding.caseNumber', 'Sygnatura akt (opcjonalnie)')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'addProceeding.caseNumberPlaceholder',
                        'np. II K 123/24'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'addProceeding.caseNumberDesc',
                      'Sygnatura nadana przez instytucję dla tego etapu sprawy'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Daty */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="started_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('addProceeding.startDate', 'Data rozpoczęcia')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ended_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('addProceeding.endDate', 'Data zakończenia (opcj.)')}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status/wynik */}
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('addProceeding.outcome', 'Status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(OUTCOME_LABELS).map(([value, label]) => (
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

            {/* Notatki */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('addProceeding.notes', 'Notatki (opcjonalnie)')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'addProceeding.notesPlaceholder',
                        'Dodatkowe informacje o tym etapie...'
                      )}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel', 'Anuluj')}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating
                  ? t('adding', 'Dodawanie...')
                  : t('add', 'Dodaj etap')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProceedingDialog;
