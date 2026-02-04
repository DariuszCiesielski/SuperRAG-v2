
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Citation } from '@/types/message';

interface SourceViewerProps {
  citation: Citation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SourceViewer = ({ citation, open, onOpenChange }: SourceViewerProps) => {
  if (!citation) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'text':
        return '📝';
      case 'website':
        return '🌐';
      case 'youtube':
        return '📺';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-xl">{getSourceIcon(citation.source_type)}</span>
            <span>{citation.source_title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Citation {citation.citation_id}
            </Badge>
            {citation.chunk_lines_from && citation.chunk_lines_to && (
              <Badge variant="outline" className="text-xs">
                Lines {citation.chunk_lines_from}-{citation.chunk_lines_to}
              </Badge>
            )}
          </div>
          
          {citation.excerpt && (
            <div className="border-l-4 pl-4" style={{ borderColor: 'var(--accent-primary)' }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Source Excerpt</h4>
              <ScrollArea className="max-h-64">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {citation.excerpt}
                </p>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SourceViewer;
