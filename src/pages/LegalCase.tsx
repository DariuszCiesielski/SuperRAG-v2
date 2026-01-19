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
import { useAuth } from '@/contexts/AuthContext';
import CaseProceedings from '@/components/legal/CaseProceedings';
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
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'proceedings'>('chat');

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
              <ChatArea caseId={id!} caseName={legalCase.title} />
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
          {activeTab === 'chat' && <ChatArea caseId={id!} caseName={legalCase.title} />}
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

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">
            {t('documents', 'Dokumenty')}
          </h2>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {documentsCount} {t('documentsCount', 'dokumentów')}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {documentsCount === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {t('noDocuments', 'Brak dokumentów')}
            </p>
            <Button size="sm" variant="outline" className="mt-3">
              <Plus className="h-4 w-4 mr-2" />
              {t('addDocument', 'Dodaj dokument')}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* TODO: Lista dokumentów */}
            <p className="text-sm text-gray-500">
              {t('documentsListPlaceholder', 'Lista dokumentów będzie tutaj...')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Obszar czatu z AI
 */
const ChatArea = ({ caseId, caseName }: { caseId: string; caseName: string }) => {
  const { t } = useTranslation('legal');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Wysłanie wiadomości
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900">
          {t('chatTitle', 'Asystent prawny')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('chatSubtitle', 'Zadaj pytanie dotyczące sprawy: {{caseName}}', { caseName })}
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">
            {t('chatEmpty.title', 'Rozpocznij rozmowę')}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {t(
              'chatEmpty.description',
              'Zadaj pytanie dotyczące Twojej sprawy. Asystent przeszuka przepisy prawne, orzecznictwa oraz Twoje dokumenty, aby udzielić odpowiedzi.'
            )}
          </p>

          {/* Przykładowe pytania */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-gray-400 uppercase">
              {t('exampleQuestions', 'Przykładowe pytania')}
            </p>
            {[
              t('example1', 'Jakie mam prawa w tej sprawie?'),
              t('example2', 'Jakie dokumenty powinienem przygotować?'),
              t('example3', 'Jaki jest termin na wniesienie odwołania?'),
            ].map((question, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="mx-1"
                onClick={() => setMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatPlaceholder', 'Zadaj pytanie...')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            {t('send', 'Wyślij')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegalCase;
