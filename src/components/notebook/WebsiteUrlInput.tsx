
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';

interface WebsiteUrlInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
}

const WebsiteUrlInput = ({ open, onOpenChange, onSubmit }: WebsiteUrlInputProps) => {
  const { t } = useTranslation(['notebook', 'common']);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(url.trim());
      setUrl('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding website source:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>{t('dialogs.websiteUrl.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">{t('dialogs.websiteUrl.label')}</Label>
            <Input
              id="website-url"
              type="url"
              placeholder={t('dialogs.websiteUrl.placeholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              {t('dialogs.websiteUrl.helper')}
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!url.trim() || isLoading}
            >
              {isLoading ? t('dialogs.websiteUrl.submitting') : t('dialogs.websiteUrl.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteUrlInput;
