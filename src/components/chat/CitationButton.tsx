
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CitationButtonProps {
  chunkIndex: number;
  sourceTitle?: string;
  excerpt?: string;
  onClick: () => void;
  className?: string;
}

const CitationButton = ({
  chunkIndex,
  sourceTitle,
  excerpt,
  onClick,
  className = ''
}: CitationButtonProps) => {
  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`inline-flex items-center justify-center w-6 h-6 p-0 ml-1 text-xs font-medium text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-full ${className}`}
    >
      {chunkIndex + 1}
    </Button>
  );

  // If we have tooltip content, wrap in tooltip
  if (sourceTitle || excerpt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-sm p-3 bg-white border shadow-lg"
        >
          {sourceTitle && (
            <p className="text-xs font-semibold text-gray-900 mb-1">
              {sourceTitle}
            </p>
          )}
          {excerpt && (
            <p className="text-xs text-gray-600 line-clamp-3">
              {excerpt}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Fallback without tooltip
  return button;
};

export default CitationButton;
