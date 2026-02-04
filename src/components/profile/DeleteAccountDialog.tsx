import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { useAccountDelete } from '@/hooks/useAccountDelete';

export const DeleteAccountDialog = () => {
  const { t } = useTranslation(['profile', 'common']);
  const [confirmationText, setConfirmationText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAccount, isDeleting } = useAccountDelete();

  const CONFIRMATION_TEXT = t('dangerZone.deleteAccount.confirmPlaceholder');

  const handleDelete = () => {
    deleteAccount();
    setIsOpen(false);
    setConfirmationText('');
  };

  const handleCancel = () => {
    setIsOpen(false);
    setConfirmationText('');
  };

  const isConfirmed = confirmationText === CONFIRMATION_TEXT;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          {t('dangerZone.deleteButton')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dangerZone.deleteAccount.title')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="text-red-600 font-semibold">
              {t('dangerZone.deleteAccount.warning')}
            </div>

            <div>
              {t('dangerZone.deleteAccount.description')}
            </div>

            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('dangerZone.deleteAccount.items.profile')}</li>
              <li>{t('dangerZone.deleteAccount.items.notebooks')}</li>
              <li>{t('dangerZone.deleteAccount.items.sources')}</li>
              <li>{t('dangerZone.deleteAccount.items.notes')}</li>
              <li>{t('dangerZone.deleteAccount.items.files')}</li>
            </ul>

            <div className="pt-4">
              <Label htmlFor="confirmation" className="text-foreground">
                {t('dangerZone.deleteAccount.confirmLabel', { text: CONFIRMATION_TEXT })}
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                autoComplete="off"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={t('dangerZone.deleteAccount.confirmPlaceholder')}
                className="mt-2 font-mono"
                disabled={isDeleting}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            {t('common:buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? t('common:loading.deleting') : t('common:buttons.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
