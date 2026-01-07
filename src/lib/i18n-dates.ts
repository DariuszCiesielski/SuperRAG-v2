import { format, parseISO } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';
import i18n from '@/i18n/config';

const locales: Record<string, Locale> = {
  en: enUS,
  pl: pl,
};

export const formatDate = (date: string | Date, formatStr: string = 'PP') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const currentLocale = locales[i18n.language] || locales.en;

  return format(dateObj, formatStr, { locale: currentLocale });
};

export const formatShortDate = (date: string | Date) => {
  return formatDate(date, 'MMM d, yyyy');
};

export const formatLongDate = (date: string | Date) => {
  return formatDate(date, 'PPPP');
};

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'PPp');
};
