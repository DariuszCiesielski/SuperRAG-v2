/**
 * Dynamiczny formularz do wypełniania pól szablonu dokumentu
 * Generuje pola na podstawie template_fields z szablonu
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { LegalTemplate, LegalTemplateField, DOCUMENT_TYPE_LABELS } from '@/types/legal';

interface FormFillerProps {
  template: LegalTemplate;
  formData: Record<string, string | number | Date>;
  onChange: (name: string, value: string | number | Date) => void;
}

const FormFiller: React.FC<FormFillerProps> = ({
  template,
  formData,
  onChange,
}) => {
  const { t } = useTranslation('legal');

  const renderField = (field: LegalTemplateField) => {
    const value = formData[field.name];
    const hasError = field.required && (value === undefined || value === '');

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={cn(
              'min-h-[100px]',
              hasError && 'border-red-300 focus:border-red-500'
            )}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  hasError && 'border-red-300'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? (
                  format(new Date(value as string | Date), 'PPP', { locale: pl })
                ) : (
                  <span>{field.placeholder || t('generator.selectDate', 'Wybierz datę')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string | Date) : undefined}
                onSelect={(date) => date && onChange(field.name, date)}
                initialFocus
                locale={pl}
              />
            </PopoverContent>
          </Popover>
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            placeholder={field.placeholder}
            value={(value as number) || ''}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            className={cn(hasError && 'border-red-300 focus:border-red-500')}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => onChange(field.name, v)}
          >
            <SelectTrigger className={cn(hasError && 'border-red-300')}>
              <SelectValue placeholder={field.placeholder || t('generator.select', 'Wybierz')} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'address':
        return (
          <Textarea
            id={field.name}
            placeholder={field.placeholder || t('generator.addressPlaceholder', 'Ulica, numer\nKod pocztowy, miejscowość')}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={cn(
              'min-h-[80px]',
              hasError && 'border-red-300 focus:border-red-500'
            )}
          />
        );

      case 'text':
      default:
        return (
          <Input
            id={field.name}
            type="text"
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={cn(hasError && 'border-red-300 focus:border-red-500')}
          />
        );
    }
  };

  // Grupowanie pól według sekcji (jeśli są)
  const requiredFields = template.template_fields.filter(f => f.required);
  const optionalFields = template.template_fields.filter(f => !f.required);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Nagłówek z informacją o szablonie */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900 mb-1">
                {template.title}
              </h3>
              <p className="text-sm text-green-700">
                {DOCUMENT_TYPE_LABELS[template.document_type]}
                {template.description && ` - ${template.description}`}
              </p>
            </div>
          </div>
        </div>

        {/* Instrukcje */}
        {template.usage_instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {t('generator.instructions', 'Instrukcje')}
            </h4>
            <p className="text-sm text-blue-700 whitespace-pre-wrap">
              {template.usage_instructions}
            </p>
          </div>
        )}

        {/* Pola wymagane */}
        {requiredFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {t('generator.requiredFields', 'Pola wymagane')}
              <Badge variant="destructive" className="text-xs">
                {requiredFields.length}
              </Badge>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={field.name} className="font-medium">
                      {field.label}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    {field.helpText && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{field.helpText}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pola opcjonalne */}
        {optionalFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {t('generator.optionalFields', 'Pola opcjonalne')}
              <Badge variant="secondary" className="text-xs">
                {optionalFields.length}
              </Badge>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionalFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={field.name} className="font-medium">
                      {field.label}
                    </Label>
                    {field.helpText && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{field.helpText}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FormFiller;
