/**
 * Komponent wyświetlający timeline etapów postępowania (sygnatury)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import AddProceedingDialog from './AddProceedingDialog';
import {
  type CaseProceeding,
  STAGE_TYPE_LABELS,
  STAGE_TYPE_ICONS,
  OUTCOME_LABELS,
  type ProceedingOutcome,
} from '@/types/legal';

interface CaseProceedingsProps {
  caseId: string;
  proceedings: CaseProceeding[];
  isLoading: boolean;
}

const CaseProceedings: React.FC<CaseProceedingsProps> = ({
  caseId,
  proceedings,
  isLoading,
}) => {
  const { t } = useTranslation('legal');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const outcomeColors: Record<ProceedingOutcome, string> = {
    w_toku: 'bg-blue-100 text-blue-800',
    przekazano: 'bg-purple-100 text-purple-800',
    umorzono: 'bg-gray-100 text-gray-800',
    wyrok_korzystny: 'bg-green-100 text-green-800',
    wyrok_niekorzystny: 'bg-red-100 text-red-800',
    ugoda: 'bg-yellow-100 text-yellow-800',
    apelacja: 'bg-orange-100 text-orange-800',
    kasacja: 'bg-pink-100 text-pink-800',
    zakonczone: 'bg-gray-100 text-gray-800',
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">
            {t('proceedings.title', 'Etapy postępowania')}
          </h2>
          <Button size="sm" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {t('proceedings.subtitle', 'Historia sygnatur i instancji')}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-4">
        {proceedings.length === 0 ? (
          <EmptyProceedings onAdd={() => setIsAddDialogOpen(true)} />
        ) : (
          <div className="space-y-4">
            {proceedings.map((proceeding, index) => (
              <ProceedingCard
                key={proceeding.id}
                proceeding={proceeding}
                isFirst={index === 0}
                isLast={index === proceedings.length - 1}
                isCurrent={proceeding.outcome === 'w_toku'}
                isExpanded={expandedIds.has(proceeding.id)}
                onToggleExpand={() => toggleExpand(proceeding.id)}
                outcomeColors={outcomeColors}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog dodawania etapu */}
      <AddProceedingDialog
        caseId={caseId}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        previousProceedingId={
          proceedings.length > 0 ? proceedings[proceedings.length - 1].id : undefined
        }
      />
    </div>
  );
};

/**
 * Karta pojedynczego etapu postępowania
 */
const ProceedingCard: React.FC<{
  proceeding: CaseProceeding;
  isFirst: boolean;
  isLast: boolean;
  isCurrent: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  outcomeColors: Record<ProceedingOutcome, string>;
}> = ({
  proceeding,
  isFirst,
  isLast,
  isCurrent,
  isExpanded,
  onToggleExpand,
  outcomeColors,
}) => {
  const { t } = useTranslation('legal');

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pl-PL');
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300" />
      )}

      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <div
          className={`
            relative bg-white rounded-lg border-2 p-4
            ${isCurrent ? 'border-blue-500 shadow-sm' : 'border-gray-200'}
          `}
        >
          {/* Timeline dot */}
          <div
            className={`
              absolute -left-1 top-4 w-4 h-4 rounded-full border-2 bg-white
              ${isCurrent ? 'border-blue-500' : 'border-gray-300'}
            `}
          />

          {/* Header */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {STAGE_TYPE_ICONS[proceeding.stage_type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {STAGE_TYPE_LABELS[proceeding.stage_type]}
                </span>
                <Badge className={outcomeColors[proceeding.outcome]}>
                  {OUTCOME_LABELS[proceeding.outcome]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {proceeding.institution_name}
              </p>
              {proceeding.case_number && (
                <p className="text-sm font-mono text-gray-500 mt-1">
                  {t('caseNumber', 'Sygn.')}: {proceeding.case_number}
                </p>
              )}
            </div>

            {/* Expand button */}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Expanded content */}
          <CollapsibleContent className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3 text-sm">
              {/* Daty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">{t('startDate', 'Rozpoczęcie')}:</span>
                  <p className="font-medium">
                    {formatDate(proceeding.started_at) || t('notSet', 'Nie ustawiono')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t('endDate', 'Zakończenie')}:</span>
                  <p className="font-medium">
                    {formatDate(proceeding.ended_at) || t('ongoing', 'W toku')}
                  </p>
                </div>
              </div>

              {/* Notatki */}
              {proceeding.notes && (
                <div>
                  <span className="text-gray-500">{t('notes', 'Notatki')}:</span>
                  <p className="mt-1 text-gray-700">{proceeding.notes}</p>
                </div>
              )}

              {/* Połączone sprawy */}
              {proceeding.merged_from_case_ids &&
                proceeding.merged_from_case_ids.length > 0 && (
                  <div>
                    <span className="text-gray-500">
                      {t('mergedFrom', 'Połączone sprawy')}:
                    </span>
                    <p className="mt-1 text-gray-700">
                      {proceeding.merged_from_case_ids.length} spraw
                    </p>
                  </div>
                )}

              {/* Akcje */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="h-3 w-3 mr-1" />
                  {t('edit', 'Edytuj')}
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('delete', 'Usuń')}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};

/**
 * Pusty stan - brak etapów
 */
const EmptyProceedings: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const { t } = useTranslation('legal');

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
        <span className="text-2xl">⚖️</span>
      </div>
      <h3 className="font-medium text-gray-900 mb-2">
        {t('proceedings.empty.title', 'Brak etapów postępowania')}
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
        {t(
          'proceedings.empty.description',
          'Dodaj pierwszy etap postępowania, np. dochodzenie policyjne lub sprawę w sądzie.'
        )}
      </p>
      <Button onClick={onAdd} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        {t('proceedings.addFirst', 'Dodaj etap')}
      </Button>
    </div>
  );
};

export default CaseProceedings;
