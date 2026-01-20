/**
 * Komponent obszaru czatu dla modułu prawnego
 * Z obsługą cytowań prawnych i wyborem źródeł
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  MessageSquare,
  Scale,
  BookOpen,
  FileText,
  Trash2,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLegalChat, SendLegalMessageParams } from '@/hooks/legal/useLegalChat';
import { LegalChatMessage, LegalCitation, LegalAIResponse } from '@/types/legal';
import { cn } from '@/lib/utils';

interface LegalChatAreaProps {
  caseId: string;
  caseName: string;
  category?: string;
}

// Ikony dla typów źródeł
const sourceTypeIcons: Record<string, React.ReactNode> = {
  regulation: <BookOpen className="h-3 w-3" />,
  ruling: <Scale className="h-3 w-3" />,
  template: <FileText className="h-3 w-3" />,
  case_document: <FileText className="h-3 w-3" />,
};

// Etykiety dla typów źródeł
const sourceTypeLabels: Record<string, string> = {
  regulation: 'Przepis',
  ruling: 'Orzeczenie',
  template: 'Szablon',
  case_document: 'Dokument',
};

const LegalChatArea = ({ caseId, caseName, category }: LegalChatAreaProps) => {
  const { t } = useTranslation('legal');
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    deleteChatHistory,
    isDeletingChatHistory,
  } = useLegalChat(caseId);

  const [messageInput, setMessageInput] = useState('');
  const [includeRegulations, setIncludeRegulations] = useState(true);
  const [includeRulings, setIncludeRulings] = useState(true);
  const [includeCaseDocs, setIncludeCaseDocs] = useState(true);
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Przewiń do końca przy nowych wiadomościach
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim() || isSending) return;

    const params: SendLegalMessageParams = {
      caseId,
      message: messageInput,
      categories: category ? [category as any] : [],
      includeRegulations,
      includeRulings,
      includeTemplates: false,
      includeCaseDocs,
    };

    sendMessage(params);
    setMessageInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (question: string) => {
    setMessageInput(question);
    inputRef.current?.focus();
  };

  // Renderowanie pojedynczej wiadomości
  const renderMessage = (msg: LegalChatMessage) => {
    const isHuman = msg.message.type === 'human';
    const content = msg.message.content;

    return (
      <div
        key={msg.id}
        className={cn(
          'flex gap-3 p-4',
          isHuman ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[80%] rounded-lg',
            isHuman
              ? 'bg-blue-600 text-white px-4 py-2'
              : 'bg-white border border-gray-200 shadow-sm'
          )}
        >
          {isHuman ? (
            // Wiadomość użytkownika
            <p className="text-sm">{content as string}</p>
          ) : (
            // Odpowiedź AI
            <div className="p-4">
              {typeof content === 'string' ? (
                // Zwykły tekst
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
              ) : (
                // Strukturalna odpowiedź z cytowaniami
                <AIResponseContent
                  response={content as LegalAIResponse}
                  expandedCitation={expandedCitation}
                  onCitationClick={setExpandedCitation}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stan ładowania
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{t('loading', 'Ładowanie...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header z opcjami źródeł */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              {t('chatTitle', 'Asystent prawny')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('chatSubtitle', 'Zadaj pytanie dotyczące sprawy: {{caseName}}', { caseName })}
            </p>
          </div>

          {messages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                  disabled={isDeletingChatHistory}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('chat.clearHistory', 'Wyczyść historię?')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(
                      'chat.clearHistoryDesc',
                      'Ta operacja usunie całą historię rozmowy z asystentem dla tej sprawy. Tej operacji nie można cofnąć.'
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel', 'Anuluj')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteChatHistory(caseId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('delete', 'Usuń')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Opcje źródeł */}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeRegulations}
              onCheckedChange={(checked) => setIncludeRegulations(checked as boolean)}
            />
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">{t('chat.sources.regulations', 'Przepisy')}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeRulings}
              onCheckedChange={(checked) => setIncludeRulings(checked as boolean)}
            />
            <Scale className="h-4 w-4 text-purple-600" />
            <span className="text-gray-700">{t('chat.sources.rulings', 'Orzeczenia')}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeCaseDocs}
              onCheckedChange={(checked) => setIncludeCaseDocs(checked as boolean)}
            />
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-gray-700">{t('chat.sources.documents', 'Dokumenty sprawy')}</span>
          </label>
        </div>
      </div>

      {/* Wiadomości */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="min-h-full">
          {messages.length === 0 ? (
            // Pusty stan
            <EmptyState onExampleClick={handleExampleClick} />
          ) : (
            // Lista wiadomości
            <div className="py-4">
              {messages.map(renderMessage)}

              {/* Wskaźnik ładowania odpowiedzi */}
              {isSending && (
                <div className="flex gap-3 p-4 justify-start">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('chat.searching', 'Przeszukuję przepisy...')}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatPlaceholder', 'Zadaj pytanie...')}
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <Button onClick={handleSend} disabled={!messageInput.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Komponent pustego stanu
const EmptyState = ({ onExampleClick }: { onExampleClick: (q: string) => void }) => {
  const { t } = useTranslation('legal');

  const examples = [
    t('example1', 'Jakie mam prawa w tej sprawie?'),
    t('example2', 'Jakie dokumenty powinienem przygotować?'),
    t('example3', 'Jaki jest termin na wniesienie odwołania?'),
  ];

  return (
    <div className="text-center py-12 px-4">
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
        <div className="flex flex-wrap justify-center gap-2">
          {examples.map((question, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onExampleClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Komponent odpowiedzi AI z cytowaniami
const AIResponseContent = ({
  response,
  expandedCitation,
  onCitationClick,
}: {
  response: LegalAIResponse;
  expandedCitation: number | null;
  onCitationClick: (id: number | null) => void;
}) => {
  const { t } = useTranslation('legal');

  return (
    <div className="space-y-4">
      {/* Segmenty tekstu */}
      <div className="text-sm text-gray-800 space-y-2">
        {response.segments.map((segment, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {segment.text}
            {segment.citation_id && (
              <button
                onClick={() =>
                  onCitationClick(
                    expandedCitation === segment.citation_id ? null : segment.citation_id!
                  )
                }
                className="inline-flex items-center ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                [{segment.citation_id}]
              </button>
            )}
          </p>
        ))}
      </div>

      {/* Lista cytowań */}
      {response.citations.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            {t('chat.citations', 'Źródła')} ({response.citations.length})
          </p>
          <div className="space-y-2">
            {response.citations.map((citation) => (
              <CitationCard
                key={citation.citation_id}
                citation={citation}
                isExpanded={expandedCitation === citation.citation_id}
                onToggle={() =>
                  onCitationClick(
                    expandedCitation === citation.citation_id ? null : citation.citation_id
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Karta cytowania
const CitationCard = ({
  citation,
  isExpanded,
  onToggle,
}: {
  citation: LegalCitation;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation('legal');

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {sourceTypeIcons[citation.source_type]}
                <span>{sourceTypeLabels[citation.source_type] || citation.source_type}</span>
              </Badge>
              <span className="text-sm font-medium text-gray-900">
                [{citation.citation_id}] {citation.source_title}
              </span>
              {citation.article && (
                <span className="text-xs text-gray-500">
                  Art. {citation.article}
                  {citation.paragraph && ` § ${citation.paragraph}`}
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-2 py-3 text-sm text-gray-600 bg-gray-50 rounded-b-lg border-t border-gray-100">
          <p className="italic">{citation.excerpt}</p>
          {/* TODO: Dodać link do pełnego źródła */}
          <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-blue-600">
            <ExternalLink className="h-3 w-3 mr-1" />
            {t('chat.viewSource', 'Zobacz pełne źródło')}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LegalChatArea;
