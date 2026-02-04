
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2, Edit, Loader2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddSourcesDialog from './AddSourcesDialog';
import RenameSourceDialog from './RenameSourceDialog';
import SourceContentViewer from '@/components/chat/SourceContentViewer';
import { useSources } from '@/hooks/useSources';
import { useSourceDelete } from '@/hooks/useSourceDelete';
import { Citation } from '@/types/message';
import { useTranslation } from 'react-i18next';

interface SourcesSidebarProps {
  hasSource: boolean;
  notebookId?: string;
  selectedCitation?: Citation | null;
  onCitationClose?: () => void;
  setSelectedCitation?: (citation: Citation | null) => void;
}

const SourcesSidebar = ({
  hasSource,
  notebookId,
  selectedCitation,
  onCitationClose,
  setSelectedCitation
}: SourcesSidebarProps) => {
  const { t } = useTranslation(['notebook', 'common']);
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [selectedSourceForViewing, setSelectedSourceForViewing] = useState<any>(null);

  const {
    sources,
    isLoading
  } = useSources(notebookId);

  const {
    deleteSource,
    isDeleting
  } = useSourceDelete();

  // Get the source content for the selected citation
  const getSourceContent = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.content || '';
  };

  // Get the source summary for the selected citation
  const getSourceSummary = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.summary || '';
  };

  // Get the source URL for the selected citation
  const getSourceUrl = (citation: Citation) => {
    const source = sources?.find(s => s.id === citation.source_id);
    return source?.url || '';
  };

  // Get the source summary for a selected source
  const getSelectedSourceSummary = () => {
    return selectedSourceForViewing?.summary || '';
  };

  // Get the source content for a selected source  
  const getSelectedSourceContent = () => {
    return selectedSourceForViewing?.content || '';
  };

  // Get the source URL for a selected source
  const getSelectedSourceUrl = () => {
    return selectedSourceForViewing?.url || '';
  };

  
  const renderSourceIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'pdf': '/file-types/PDF.svg',
      'text': '/file-types/TXT.png',
      'website': '/file-types/WEB.svg',
      'youtube': '/file-types/MP3.png',
      'audio': '/file-types/MP3.png',
      'doc': '/file-types/DOC.png',
      'multiple-websites': '/file-types/WEB.svg',
      'copied-text': '/file-types/TXT.png'
    };

    const iconUrl = iconMap[type] || iconMap['text']; // fallback to TXT icon

    return (
      <img 
        src={iconUrl} 
        alt={`${type} icon`} 
        className="w-full h-full object-contain" 
        onError={(e) => {
          // Fallback to a simple text indicator if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = '📄';
        }} 
      />
    );
  };

  const renderProcessingStatus = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" style={{ color: 'var(--info)' }} />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--info)' }} />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />;
      case 'failed':
        return <XCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-pulse" style={{ color: 'var(--text-muted)' }} />;
      default:
        return null;
    }
  };

  const handleRemoveSource = (source: any) => {
    setSelectedSource(source);
    setShowDeleteDialog(true);
  };

  const handleRenameSource = (source: any) => {
    setSelectedSource(source);
    setShowRenameDialog(true);
  };

  const handleSourceClick = (source: any) => {
    console.log('SourcesSidebar: Source clicked from list', {
      sourceId: source.id,
      sourceTitle: source.title
    });

    // Clear any existing citation state first
    if (setSelectedCitation) {
      setSelectedCitation(null);
    }

    // Set the selected source for viewing
    setSelectedSourceForViewing(source);

    // Create a mock citation for the selected source without line data (this prevents auto-scroll)
    const mockCitation: Citation = {
      citation_id: -1, // Use negative ID to indicate this is a mock citation
      source_id: source.id,
      source_title: source.title,
      source_type: source.type,
      chunk_index: 0,
      excerpt: 'Full document view'
      // Deliberately omitting chunk_lines_from and chunk_lines_to to prevent auto-scroll
    };

    console.log('SourcesSidebar: Created mock citation', mockCitation);

    // Set the mock citation after a small delay to ensure state is clean
    setTimeout(() => {
      if (setSelectedCitation) {
        setSelectedCitation(mockCitation);
      }
    }, 50);
  };

  const handleBackToSources = () => {
    console.log('SourcesSidebar: Back to sources clicked');
    setSelectedSourceForViewing(null);
    onCitationClose?.();
  };

  const confirmDelete = () => {
    if (selectedSource) {
      deleteSource(selectedSource.id);
      setShowDeleteDialog(false);
      setSelectedSource(null);
    }
  };

  // If we have a selected citation, show the content viewer
  if (selectedCitation) {
    console.log('SourcesSidebar: Rendering content viewer for citation', {
      citationId: selectedCitation.citation_id,
      sourceId: selectedCitation.source_id,
      hasLineData: !!(selectedCitation.chunk_lines_from && selectedCitation.chunk_lines_to),
      isFromSourceList: selectedCitation.citation_id === -1
    });

    // Determine which citation to display and get appropriate content/summary/url
    const displayCitation = selectedCitation;
    const sourceContent = selectedSourceForViewing ? getSelectedSourceContent() : getSourceContent(selectedCitation);
    const sourceSummary = selectedSourceForViewing ? getSelectedSourceSummary() : getSourceSummary(selectedCitation);
    const sourceUrl = selectedSourceForViewing ? getSelectedSourceUrl() : getSourceUrl(selectedCitation);

    return (
      <div className="w-full flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={handleBackToSources}>
              {t('sources.title')}
            </h2>
            <Button variant="ghost" onClick={handleBackToSources} className="p-2 [&_svg]:!w-6 [&_svg]:!h-6">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M440-440v240h-80v-160H200v-80h240Zm160-320v160h160v80H520v-240h80Z" />
              </svg>
            </Button>
          </div>
        </div>

        <SourceContentViewer
          citation={displayCitation}
          sourceContent={sourceContent}
          sourceSummary={sourceSummary}
          sourceUrl={sourceUrl}
          className="flex-1 overflow-hidden"
          isOpenedFromSourceList={selectedCitation.citation_id === -1}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
      <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{t('sources.title')}</h2>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddSourcesDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('sources.add')}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('sources.loadingList')}</p>
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-4">
              {sources.map((source) => (
                <ContextMenu key={source.id}>
                  <ContextMenuTrigger>
                    <Card className="p-3 cursor-pointer transition-colors" style={{ border: '1px solid var(--border-primary)' }} onClick={() => handleSourceClick(source)}>
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                            {renderSourceIcon(source.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block" style={{ color: 'var(--text-primary)' }}>{source.title}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 py-[4px]">
                          {renderProcessingStatus(source.processing_status)}
                        </div>
                      </div>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleRenameSource(source)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('sources.rename')}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleRemoveSource(source)} style={{ color: 'var(--error)' }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('sources.delete')}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>📄</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('sources.empty.title')}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t('sources.empty.description')}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AddSourcesDialog 
        open={showAddSourcesDialog} 
        onOpenChange={setShowAddSourcesDialog} 
        notebookId={notebookId} 
      />

      <RenameSourceDialog 
        open={showRenameDialog} 
        onOpenChange={setShowRenameDialog} 
        source={selectedSource} 
        notebookId={notebookId} 
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sources.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sources.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{ backgroundColor: 'var(--error)', color: 'var(--text-inverse)' }}
              className="hover:opacity-90"
              disabled={isDeleting}
            >
              {isDeleting ? t('common:loading.deleting') : t('common:buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SourcesSidebar;
