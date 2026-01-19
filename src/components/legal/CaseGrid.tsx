/**
 * Siatka kart spraw prawnych
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText, Scale, MoreVertical, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLegalCases, type LegalCaseWithCounts } from '@/hooks/legal/useLegalCases';
import {
  CATEGORY_LABELS,
  CASE_STATUS_LABELS,
  type CaseStatus,
  type LegalCategory,
} from '@/types/legal';

interface CaseGridProps {
  cases: LegalCaseWithCounts[];
}

const CaseGrid: React.FC<CaseGridProps> = ({ cases }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map((legalCase) => (
        <CaseCard key={legalCase.id} legalCase={legalCase} />
      ))}
    </div>
  );
};

interface CaseCardProps {
  legalCase: LegalCaseWithCounts;
}

const CaseCard: React.FC<CaseCardProps> = ({ legalCase }) => {
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { archiveCase, deleteCase, isArchiving, isDeleting } = useLegalCases();

  const handleClick = () => {
    navigate(`/legal/case/${legalCase.id}`);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmArchive', 'Czy na pewno chcesz zarchiwizować tę sprawę?'))) {
      archiveCase(legalCase.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete', 'Czy na pewno chcesz usunąć tę sprawę? Ta operacja jest nieodwracalna.'))) {
      deleteCase(legalCase.id);
    }
  };

  const statusColors: Record<CaseStatus, string> = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    won: 'bg-blue-100 text-blue-800',
    lost: 'bg-red-100 text-red-800',
    settled: 'bg-yellow-100 text-yellow-800',
    dismissed: 'bg-orange-100 text-orange-800',
  };

  const categoryColors: Record<LegalCategory, string> = {
    cywilne: 'border-blue-200 bg-blue-50',
    administracyjne: 'border-purple-200 bg-purple-50',
    pracownicze: 'border-green-200 bg-green-50',
    konsumenckie: 'border-orange-200 bg-orange-50',
    rodzinne: 'border-pink-200 bg-pink-50',
    spadkowe: 'border-amber-200 bg-amber-50',
    nieruchomosci: 'border-teal-200 bg-teal-50',
    umowy: 'border-indigo-200 bg-indigo-50',
    karne: 'border-red-200 bg-red-50',
    wykroczenia: 'border-rose-200 bg-rose-50',
  };

  const formattedDate = legalCase.updated_at
    ? new Date(legalCase.updated_at).toLocaleDateString('pl-PL')
    : '';

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        ${categoryColors[legalCase.category] || 'border-gray-200 bg-gray-50'}
      `}
    >
      {/* Nagłówek z ikoną i menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{legalCase.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {legalCase.title}
            </h3>
            <Badge
              variant="secondary"
              className={statusColors[legalCase.status]}
            >
              {CASE_STATUS_LABELS[legalCase.status]}
            </Badge>
          </div>
        </div>

        {/* Menu kontekstowe */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {legalCase.status === 'active' && (
              <DropdownMenuItem
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                {t('archive', 'Archiwizuj')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              {t('delete', 'Usuń')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Kategoria */}
      <div className="mb-3">
        <Badge variant="outline" className="text-xs">
          {CATEGORY_LABELS[legalCase.category]}
        </Badge>
      </div>

      {/* Opis */}
      {legalCase.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {legalCase.description}
        </p>
      )}

      {/* Przeciwnik */}
      {legalCase.opponent_name && (
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">{t('opponent', 'Przeciwnik')}:</span>{' '}
          {legalCase.opponent_name}
        </div>
      )}

      {/* Statystyki */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{legalCase.documents_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Scale className="h-4 w-4" />
          <span>{legalCase.proceedings_count}</span>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Deadline */}
      {legalCase.deadline_date && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-orange-600 font-medium">
              {t('deadline', 'Termin')}:{' '}
              {new Date(legalCase.deadline_date).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseGrid;
