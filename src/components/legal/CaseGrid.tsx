/**
 * Siatka kart spraw prawnych - wersja z efektem glass
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

// Mapowanie kategorii na kolory akcentu
const categoryAccentColors: Record<LegalCategory, string> = {
  cywilne: '#3b82f6',      // blue
  administracyjne: '#a855f7', // purple
  pracownicze: '#22c55e',  // green
  konsumenckie: '#f97316', // orange
  rodzinne: '#ec4899',     // pink
  spadkowe: '#f59e0b',     // amber
  nieruchomosci: '#14b8a6', // teal
  umowy: '#6366f1',        // indigo
  karne: '#ef4444',        // red
  wykroczenia: '#f43f5e',  // rose
};

// Mapowanie statusów na kolory
const statusAccentColors: Record<CaseStatus, { bg: string; text: string }> = {
  active: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
  archived: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' },
  won: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
  lost: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
  settled: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
  dismissed: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316' },
};

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

  const accentColor = categoryAccentColors[legalCase.category] || '#6b7280';
  const statusColors = statusAccentColors[legalCase.status] || statusAccentColors.active;

  const formattedDate = legalCase.updated_at
    ? new Date(legalCase.updated_at).toLocaleDateString('pl-PL')
    : '';

  return (
    <div
      onClick={handleClick}
      className="relative p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--glass-bg, var(--bg-secondary))',
        backdropFilter: 'blur(var(--blur, 12px))',
        WebkitBackdropFilter: 'blur(var(--blur, 12px))',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accentColor}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {/* Kolorowy pasek u góry */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Nagłówek z ikoną i menu */}
      <div className="flex items-start justify-between mb-3 mt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${accentColor}20`,
              border: `1px solid ${accentColor}40`
            }}
          >
            <span className="text-xl">{legalCase.icon}</span>
          </div>
          <div>
            <h3
              className="font-semibold line-clamp-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {legalCase.title}
            </h3>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
                borderColor: statusColors.text
              }}
            >
              {CASE_STATUS_LABELS[legalCase.status]}
            </Badge>
          </div>
        </div>

        {/* Menu kontekstowe */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              style={{ color: 'var(--text-muted)' }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {legalCase.status === 'active' && (
              <DropdownMenuItem
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Archive className="h-4 w-4" />
                {t('archive', 'Archiwizuj')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2"
              style={{ color: 'var(--error)' }}
            >
              <Trash2 className="h-4 w-4" />
              {t('delete', 'Usuń')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Kategoria */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className="text-xs"
          style={{
            borderColor: `${accentColor}60`,
            color: accentColor,
            backgroundColor: `${accentColor}10`
          }}
        >
          {CATEGORY_LABELS[legalCase.category]}
        </Badge>
      </div>

      {/* Opis */}
      {legalCase.description && (
        <p
          className="text-sm line-clamp-2 mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {legalCase.description}
        </p>
      )}

      {/* Przeciwnik */}
      {legalCase.opponent_name && (
        <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('opponent', 'Przeciwnik')}:
          </span>{' '}
          {legalCase.opponent_name}
        </div>
      )}

      {/* Statystyki */}
      <div
        className="flex items-center gap-4 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
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
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid var(--border-secondary)' }}
        >
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" style={{ color: 'var(--warning)' }} />
            <span style={{ color: 'var(--warning)' }} className="font-medium">
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
