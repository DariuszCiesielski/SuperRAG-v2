import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Plus, Edit, Bot, User, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNotes, Note } from '@/hooks/useNotes';
import { useAudioOverview } from '@/hooks/useAudioOverview';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useSources } from '@/hooks/useSources';
import { useQueryClient } from '@tanstack/react-query';
import NoteEditor from './NoteEditor';
import AudioPlayer from './AudioPlayer';
import { Citation } from '@/types/message';
import { useTranslation } from 'react-i18next';
import { formatShortDate } from '@/lib/i18n-dates';

interface StudioSidebarProps {
  notebookId?: string;
  isExpanded?: boolean;
  onCitationClick?: (citation: Citation) => void;
}

// Feature flag: Audio Overview will be enabled in future versions
const ENABLE_AUDIO_OVERVIEW = false;

const StudioSidebar = ({
  notebookId,
  isExpanded,
  onCitationClick
}: StudioSidebarProps) => {
  const { t } = useTranslation(['notebook', 'common']);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting
  } = useNotes(notebookId);
  const {
    notebooks
  } = useNotebooks();
  const {
    sources
  } = useSources(notebookId);
  const {
    generateAudioOverview,
    refreshAudioUrl,
    autoRefreshIfExpired,
    isGenerating,
    isAutoRefreshing,
    generationStatus,
    checkAudioExpiry
  } = useAudioOverview(notebookId);
  const queryClient = useQueryClient();
  const notebook = notebooks?.find(n => n.id === notebookId);
  const hasValidAudio = notebook?.audio_overview_url && !checkAudioExpiry(notebook.audio_url_expires_at);
  const currentStatus = generationStatus || notebook?.audio_overview_generation_status;
  
  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  // Auto-refresh expired URLs
  useEffect(() => {
    if (!notebookId || !notebook?.audio_overview_url) return;
    
    const checkAndRefresh = async () => {
      if (checkAudioExpiry(notebook.audio_url_expires_at)) {
        console.log('Detected expired audio URL, initiating auto-refresh...');
        await autoRefreshIfExpired(notebookId, notebook.audio_url_expires_at);
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notebookId, notebook?.audio_overview_url, notebook?.audio_url_expires_at, autoRefreshIfExpired, checkAudioExpiry]);

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    console.log('StudioSidebar: Opening note', {
      noteId: note.id,
      sourceType: note.source_type
    });
    setEditingNote(note);
    setIsCreatingNote(false);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (editingNote) {
      // Only allow updating user notes, not AI responses
      if (editingNote.source_type === 'user') {
        updateNote({
          id: editingNote.id,
          title,
          content
        });
      }
    } else {
      createNote({
        title,
        content,
        source_type: 'user'
      });
    }
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleDeleteNote = () => {
    if (editingNote) {
      deleteNote(editingNote.id);
      setEditingNote(null);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsCreatingNote(false);
  };

  const handleGenerateAudio = () => {
    if (notebookId) {
      generateAudioOverview(notebookId);
      setAudioError(false);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
  };

  const handleAudioRetry = () => {
    // Regenerate the audio overview
    handleGenerateAudio();
  };

  const handleAudioDeleted = () => {
    // Refresh the notebooks data to update the UI
    if (notebookId) {
      queryClient.invalidateQueries({
        queryKey: ['notebooks']
      });
    }
    setAudioError(false);
  };

  const handleUrlRefresh = (notebookId: string) => {
    refreshAudioUrl(notebookId);
  };

  const getStatusDisplay = () => {
    if (isAutoRefreshing) {
      return {
        icon: null,
        text: t('studio.audioOverview.status.refreshing'),
        description: t('studio.audioOverview.status.refreshingDesc')
      };
    }

    if (currentStatus === 'generating' || isGenerating) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
        text: t('studio.audioOverview.status.generating'),
        description: t('studio.audioOverview.status.generatingDesc')
      };
    } else if (currentStatus === 'failed') {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        text: t('studio.audioOverview.status.failed'),
        description: t('studio.audioOverview.status.failedDesc')
      };
    } else if (currentStatus === 'completed' && hasValidAudio) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: t('studio.audioOverview.status.ready'),
        description: t('studio.audioOverview.status.readyDesc')
      };
    }
    return null;
  };

  const isEditingMode = editingNote || isCreatingNote;
  const getPreviewText = (note: Note) => {
    if (note.source_type === 'ai_response') {
      // Use extracted_text if available, otherwise parse the content
      if (note.extracted_text) {
        return note.extracted_text;
      }
      try {
        const parsed = JSON.parse(note.content);
        if (parsed.segments && parsed.segments[0]) {
          return parsed.segments[0].text;
        }
      } catch (e) {
        // If parsing fails, use content as-is
      }
    }

    // For user notes or fallback, use the content directly
    const contentToUse = note.content;
    return contentToUse.length > 100 ? contentToUse.substring(0, 100) + '...' : contentToUse;
  };

  if (isEditingMode) {
    return <div className="w-full flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)' }}>
        <NoteEditor note={editingNote || undefined} onSave={handleSaveNote} onDelete={editingNote ? handleDeleteNote : undefined} onCancel={handleCancel} isLoading={isCreating || isUpdating || isDeleting} onCitationClick={onCitationClick} />
      </div>;
  }

  return <div className="w-full flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)' }}>
      <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>{t('studio.title')}</h2>

        {/* Audio Overview - Hidden until future release */}
        {ENABLE_AUDIO_OVERVIEW && <Card className="p-4 mb-4" style={{ border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('studio.audioOverview.title')}</h3>
          </div>

          {hasValidAudio && !audioError && currentStatus !== 'generating' && !isAutoRefreshing ? <AudioPlayer
              audioUrl={notebook.audio_overview_url}
              title={t('studio.audioOverview.deepDive')}
              notebookId={notebookId}
              expiresAt={notebook.audio_url_expires_at}
              onError={handleAudioError}
              onRetry={handleAudioRetry}
              onDeleted={handleAudioDeleted}
              onUrlRefresh={handleUrlRefresh}
            /> : <Card className="p-3" style={{ border: '1px solid var(--border-primary)' }}>
              {/* Hide this div when generating or auto-refreshing */}
              {currentStatus !== 'generating' && !isGenerating && !isAutoRefreshing && <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" style={{ fill: 'var(--text-primary)' }}>
                      <path d="M280-120v-123q-104-14-172-93T40-520h80q0 83 58.5 141.5T320-320h10q5 0 10-1 13 20 28 37.5t32 32.5q-10 3-19.5 4.5T360-243v123h-80Zm20-282q-43-8-71.5-40.5T200-520v-240q0-50 35-85t85-35q50 0 85 35t35 85v160H280v80q0 31 5 60.5t15 57.5Zm340 2q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T640-320q83 0 141.5-58.5T840-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T680-520v-240q0-17-11.5-28.5T640-800q-17 0-28.5 11.5T600-760v240q0 17 11.5 28.5T640-480Zm0-160Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('studio.audioOverview.deepDive')}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('studio.audioOverview.twoHosts')}</p>
                  </div>
                </div>}
              
              {/* Status Display */}
              {getStatusDisplay() && <div className="flex items-center space-x-2 mb-3 p-2 rounded-md bg-transparent">
                  {getStatusDisplay()!.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{getStatusDisplay()!.text}</p>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{getStatusDisplay()!.description}</p>
                  </div>
                </div>}

              {/* Audio error div */}
              {audioError && <div className="flex items-center space-x-2 mb-3 p-2 rounded-md" style={{ backgroundColor: 'var(--error-light)' }}>
                  <AlertCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--error)' }}>{t('studio.audioOverview.status.unavailable')}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleAudioRetry} style={{ color: 'var(--error)', borderColor: 'var(--error)' }} className="hover:opacity-80">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t('common:buttons.retry')}
                  </Button>
                </div>}

              <div className="flex space-x-2">
                <Button size="sm" onClick={handleGenerateAudio} disabled={isGenerating || currentStatus === 'generating' || !hasProcessedSource || isAutoRefreshing} className="flex-1" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)' }}>
                  {isGenerating || currentStatus === 'generating' ? <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('studio.audioOverview.generating')}
                    </> : t('studio.audioOverview.generate')}
                </Button>
              </div>
            </Card>}
        </Card>}

        {/* Notes Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('studio.notes.title')}</h3>

          </div>

          <Button variant="default" size="sm" className="w-full mb-4" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)' }} onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            {t('studio.notes.newNote')}
          </Button>
        </div>
      </div>

      {/* Saved Notes Area */}
      <ScrollArea className="flex-1 h-full">
        <div className="p-4">
          {isLoading ? <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('studio.notes.loading')}</p>
            </div> : notes && notes.length > 0 ? <div className="space-y-3">
              {notes.map(note => <Card key={note.id} className="p-3 cursor-pointer transition-colors" style={{ border: '1px solid var(--border-primary)' }} onClick={() => handleEditNote(note)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {note.source_type === 'ai_response' ? <Bot className="h-3 w-3" style={{ color: 'var(--info)' }} /> : <User className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />}
                        <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
                          {note.source_type === 'ai_response' ? t('studio.notes.types.aiResponse') : t('studio.notes.types.note')}
                        </span>
                      </div>
                      <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{note.title}</h4>
                      <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {getPreviewText(note)}
                      </p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        {formatShortDate(new Date(note.updated_at))}
                      </p>
                    </div>
                    {note.source_type === 'user' && <Button variant="ghost" size="sm" className="ml-2">
                        <Edit className="h-3 w-3" />
                      </Button>}
                  </div>
                </Card>)}
            </div> : <div className="text-center py-8">
              <div className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>📄</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('studio.notes.empty.title')}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('studio.notes.empty.description')}
              </p>
            </div>}
        </div>
      </ScrollArea>
    </div>;
};

export default StudioSidebar;
