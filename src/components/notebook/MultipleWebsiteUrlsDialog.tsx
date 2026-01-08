
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';

interface MultipleWebsiteUrlsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (urls: string[]) => void;
}

const MultipleWebsiteUrlsDialog = ({
  open,
  onOpenChange,
  onSubmit
}: MultipleWebsiteUrlsDialogProps) => {
  const { t } = useTranslation(['dialogs', 'common']);
  const [urlsText, setUrlsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Parse URLs from textarea - split by newlines and filter out empty lines
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');
    
    if (urls.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(urls);
      setUrlsText('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting URLs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUrlsText('');
    onOpenChange(false);
  };

  // Count valid URLs for display
  const validUrls = urlsText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url !== '');
  
  const isValid = validUrls.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-green-600" />
            <span>{t('multipleWebsites.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">{t('multipleWebsites.label')}</Label>
            <p className="text-sm text-gray-600 mb-3">
              {t('multipleWebsites.description')}
            </p>
          </div>

          <div>
            <Textarea
              placeholder={`Enter URLs one per line, for example:
https://example.com
https://another-site.com
https://third-website.org`}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              className="min-h-32 resize-y"
              rows={6}
            />
            {validUrls.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {t('multipleWebsites.urlsDetected', { count: validUrls.length })}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              {t('common:buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? t('multipleWebsites.submitting') : t('multipleWebsites.submit', { count: validUrls.length })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleWebsiteUrlsDialog;
