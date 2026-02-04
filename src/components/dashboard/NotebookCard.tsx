import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNotebookDelete } from '@/hooks/useNotebookDelete';

interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    date: string;
    sources: number;
    icon: string;
    color: string;
    hasCollaborators?: boolean;
  };
}

// Mapowanie nazw kolorów na wartości hex dla akcentu
const colorAccents: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  gray: '#6b7280',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  lime: '#84cc16',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  slate: '#64748b',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
};

const NotebookCard = ({
  notebook
}: NotebookCardProps) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    deleteNotebook,
    isDeleting
  } = useNotebookDelete();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for notebook:', notebook.id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Confirming delete for notebook:', notebook.id);
    deleteNotebook(notebook.id);
    setShowDeleteDialog(false);
  };

  // Pobierz kolor akcentu dla notatnika
  const colorName = notebook.color || 'blue';
  const accentColor = colorAccents[colorName] || colorAccents.blue;

  return (
    <div
      className="rounded-xl border p-4 cursor-pointer relative h-48 flex flex-col transition-all duration-300 hover:scale-[1.02]"
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

      <div className="absolute top-3 right-3" data-delete-action="true">
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{
                color: 'var(--text-muted)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--error-light)';
                e.currentTarget.style.color = 'var(--error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              disabled={isDeleting}
              data-delete-action="true"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>
                {t('dashboard:notebookCard.deleteTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard:notebookCard.deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                {t('common:buttons.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'var(--text-inverse)'
                }}
                disabled={isDeleting}
              >
                {isDeleting ? t('common:loading.deleting') : t('common:buttons.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Ikona z kolorowym tłem */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mt-2"
        style={{
          backgroundColor: `${accentColor}20`,
          border: `1px solid ${accentColor}40`
        }}
      >
        <span className="text-3xl">{notebook.icon}</span>
      </div>

      <h3
        className="mb-2 pr-6 line-clamp-2 text-xl font-medium flex-grow"
        style={{ color: 'var(--text-primary)' }}
      >
        {notebook.title}
      </h3>

      <div
        className="flex items-center justify-between text-sm mt-auto"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>{notebook.date} • {t('common:sources.count', { count: notebook.sources })}</span>
      </div>
    </div>
  );
};

export default NotebookCard;
