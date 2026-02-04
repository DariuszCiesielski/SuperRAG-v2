/**
 * Strona widoku pojedynczej sprawy prawnej
 * Layout 3-kolumnowy: dokumenty | chat | etapy postępowania
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Plus,
  FileText,
  Scale,
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  FilePlus,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useLegalCase } from '@/hooks/legal/useLegalCases';
import { useCaseProceedings } from '@/hooks/legal/useCaseProceedings';
import { useCaseDocuments } from '@/hooks/legal/useCaseDocuments';
import { useAuth } from '@/contexts/AuthContext';
import CaseProceedings from '@/components/legal/CaseProceedings';
import LegalChatArea from '@/components/legal/LegalChatArea';
import GeneratedDocumentsList from '@/components/legal/GeneratedDocumentsList';
import AddCaseDocumentDialog from '@/components/legal/AddCaseDocumentDialog';
import {
  CATEGORY_LABELS,
  CASE_STATUS_LABELS,
  type CaseStatus,
} from '@/types/legal';

// Mapowanie statusów na kolory
const statusAccentColors: Record<CaseStatus, { bg: string; text: string }> = {
  active: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
  archived: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' },
  won: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
  lost: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
  settled: { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' },
  dismissed: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316' },
};

const LegalCase = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('legal');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { legalCase, isLoading, error, isError } = useLegalCase(id);
  const { proceedings, isLoading: proceedingsLoading } = useCaseProceedings(id);
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'proceedings' | 'generated'>('chat');

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--accent-primary)' }}
          ></div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('loading', 'Ładowanie...')}</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (isError || !legalCase) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <Scale className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('caseNotFound', 'Nie znaleziono sprawy')}
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {error || t('caseNotFoundDesc', 'Sprawa nie istnieje lub nie masz do niej dostępu.')}
          </p>
          <Button
            onClick={() => navigate('/legal')}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-inverse)'
            }}
          >
            {t('backToDashboard', 'Wróć do listy spraw')}
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = statusAccentColors[legalCase.status] || statusAccentColors.active;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--header-bg)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/legal')}
              style={{ color: 'var(--header-text)' }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{legalCase.icon}</span>
              <div>
                <h1
                  className="font-semibold text-lg"
                  style={{ color: 'var(--header-text)' }}
                >
                  {legalCase.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: 'var(--border-primary)',
                      color: 'var(--header-text)'
                    }}
                  >
                    {CATEGORY_LABELS[legalCase.category]}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: statusColors.bg,
                      color: statusColors.text
                    }}
                  >
                    {CASE_STATUS_LABELS[legalCase.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--header-text)'
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('settings', 'Ustawienia')}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div
        className="md:hidden border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList
            className="w-full justify-start px-4"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <MessageSquare className="h-4 w-4" />
              {t('chat', 'Chat')}
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FileText className="h-4 w-4" />
              {t('documents', 'Dokumenty')} ({legalCase.documents_count})
            </TabsTrigger>
            <TabsTrigger
              value="proceedings"
              className="flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Scale className="h-4 w-4" />
              {t('proceedings', 'Etapy')} ({legalCase.proceedings_count})
            </TabsTrigger>
            <TabsTrigger
              value="generated"
              className="flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FilePlus className="h-4 w-4" />
              {t('generator.tab', 'Pisma')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: 3-column layout */}
        <div className="hidden md:flex flex-1">
          <ResizablePanelGroup direction="horizontal">
            {/* Left: Documents sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <DocumentsSidebar caseId={id!} documentsCount={legalCase.documents_count} />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center: Chat area */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <LegalChatArea caseId={id!} caseName={legalCase.title} category={legalCase.category} />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right: Proceedings timeline */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <CaseProceedings
                caseId={id!}
                proceedings={proceedings}
                isLoading={proceedingsLoading}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Tab content */}
        <div className="md:hidden flex-1 overflow-auto">
          {activeTab === 'chat' && <LegalChatArea caseId={id!} caseName={legalCase.title} category={legalCase.category} />}
          {activeTab === 'documents' && (
            <DocumentsSidebar caseId={id!} documentsCount={legalCase.documents_count} />
          )}
          {activeTab === 'proceedings' && (
            <CaseProceedings
              caseId={id!}
              proceedings={proceedings}
              isLoading={proceedingsLoading}
            />
          )}
          {activeTab === 'generated' && (
            <GeneratedDocumentsList caseId={id!} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Sidebar z dokumentami sprawy
 */
const DocumentsSidebar = ({
  caseId,
  documentsCount,
}: {
  caseId: string;
  documentsCount: number;
}) => {
  const { t } = useTranslation('legal');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    documents,
    isLoading,
    deleteDocument,
    isDeleting,
    getFileUrl,
  } = useCaseDocuments(caseId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleOpenFile = (filePath: string) => {
    const url = getFileUrl(filePath);
    window.open(url, '_blank');
  };

  return (
    <>
      <div
        className="h-full flex flex-col border-r"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <div
          className="p-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('documents', 'Dokumenty')}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDialog(true)}
              style={{
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {documents.length} {t('documentsCount', 'dokumentów')}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('noDocuments', 'Brak dokumentów')}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setShowAddDialog(true)}
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addDocument', 'Dodaj dokument')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: 'var(--glass-bg, var(--bg-tertiary))',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {doc.document_type && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent-primary)'
                            }}
                          >
                            {doc.document_type}
                          </Badge>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {doc.file_path && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={() => handleOpenFile(doc.file_path!)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('open', 'Otwórz')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      style={{ color: 'var(--error)' }}
                      onClick={() => deleteDocument(doc.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCaseDocumentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        caseId={caseId}
      />
    </>
  );
};

export default LegalCase;
