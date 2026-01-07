import React, { useState } from 'react';
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

const CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';

export const DeleteAccountDialog = () => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { deleteAccount, isDeleting } = useAccountDelete();

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
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account Permanently</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="text-red-600 font-semibold">
              Warning: This action cannot be undone!
            </div>

            <div>
              Deleting your account will permanently remove:
            </div>

            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Your profile and account information</li>
              <li>All notebooks you have created</li>
              <li>All sources and documents</li>
              <li>All notes and chat histories</li>
              <li>All uploaded files and generated audio</li>
            </ul>

            <div className="pt-4">
              <Label htmlFor="confirmation" className="text-foreground">
                Type <span className="font-mono font-bold">{CONFIRMATION_TEXT}</span> to confirm:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={CONFIRMATION_TEXT}
                className="mt-2 font-mono"
                disabled={isDeleting}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
