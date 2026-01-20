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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading', 'Ładowanie...')}</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (isError || !legalCase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('caseNotFound', 'Nie znaleziono sprawy')}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || t('caseNotFoundDesc', 'Sprawa nie istnieje lub nie masz do niej dostępu.')}
          </p>
          <Button onClick={() => navigate('/legal')}>
            {t('backToDashboard', 'Wróć do listy spraw')}
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<CaseStatus, string> = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    won: 'bg-blue-100 text-blue-800',
    lost: 'bg-red-100 text-red-800',
    settled: 'bg-yellow-100 text-yellow-800',
    dismissed: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/legal')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{legalCase.icon}</span>
              <div>
                <h1 className="font-semibold text-lg text-gray-900">
                  {legalCase.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[legalCase.category]}
                  </Badge>
                  <Badge className={statusColors[legalCase.status]}>
                    {CASE_STATUS_LABELS[legalCase.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('settings', 'Ustawienia')}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full justify-start px-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t('chat', 'Chat')}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('documents', 'Dokumenty')} ({legalCase.documents_count})
            </TabsTrigger>
            <TabsTrigger value="proceedings" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              {t('proceedings', 'Etapy')} ({legalCase.proceedings_count})
            </TabsTrigger>
            <TabsTrigger value="generated" className="flex items-center gap-2">
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
      <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">
              {t('documents', 'Dokumenty')}
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {documents.length} {t('documentsCount', 'dokumentów')}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {t('noDocuments', 'Brak dokumentów')}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setShowAddDialog(true)}
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
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {doc.document_type && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.document_type}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
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
                        onClick={() => handleOpenFile(doc.file_path!)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('open', 'Otwórz')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
