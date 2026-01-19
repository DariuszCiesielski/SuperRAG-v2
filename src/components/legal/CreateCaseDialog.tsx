/**
 * Dialog tworzenia nowej sprawy prawnej
 */

import React from 'react';
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
import { useLegalCases } from '@/hooks/legal/useLegalCases';
import { CATEGORY_LABELS, type LegalCategory } from '@/types/legal';
import { useToast } from '@/hooks/use-toast';

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'cywilne',
      opponent_name: '',
      opponent_type: '',
      deadline_date: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const newCase = await createCaseAsync({
        title: data.title,
        description: data.description,
        category: data.category as LegalCategory,
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
                  ? t('creating', 'Tworzenie...')
                  : t('create', 'Utwórz sprawę')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCaseDialog;
