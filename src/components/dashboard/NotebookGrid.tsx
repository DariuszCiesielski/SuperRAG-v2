
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotebookGrid = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'mostRecent' | 'title'>('mostRecent');
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating
  } = useNotebooks();
  const navigate = useNavigate();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];

    const sorted = [...notebooks];

    if (sortBy === 'mostRecent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [notebooks, sortBy]);

  const handleCreateNotebook = () => {
    createNotebook({
      title: t('dashboard:notebookCard.untitledNotebook'),
      description: ''
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from a delete action or other interactive element
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    if (isDeleteAction) {
      console.log('Click prevented due to delete action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  if (isLoading) {
    return <div className="text-center py-16">
        <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard:loading')}</p>
      </div>;
  }

  return <div>
      <div className="flex items-center justify-between mb-8">
        <Button className="rounded-full px-6" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)' }} onClick={handleCreateNotebook} disabled={isCreating}>
          {isCreating ? t('common:loading.creating') : t('dashboard:createNew')}
        </Button>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {sortBy === 'mostRecent' ? t('dashboard:sorting.mostRecent') : t('dashboard:sorting.title')}
                </span>
                <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('mostRecent')} className="flex items-center justify-between">
                {t('dashboard:sorting.mostRecent')}
                {sortBy === 'mostRecent' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')} className="flex items-center justify-between">
                {t('dashboard:sorting.title')}
                {sortBy === 'title' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => <div key={notebook.id} onClick={e => handleNotebookClick(notebook.id, e)}>
            <NotebookCard notebook={{
          id: notebook.id,
          title: notebook.title,
          date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          sources: notebook.sources?.[0]?.count || 0,
          icon: notebook.icon || '📝',
          color: notebook.color || 'bg-gray-100'
        }} />
          </div>)}
      </div>
    </div>;
};

export default NotebookGrid;
