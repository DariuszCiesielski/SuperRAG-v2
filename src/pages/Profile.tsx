import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';
import { formatShortDate } from '@/lib/i18n-dates';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['profile', 'common']);
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating, updatePassword, isUpdatingPassword } = useProfile();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    updatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <DashboardHeader userEmail={user?.email} />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: 'var(--accent-primary)' }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DashboardHeader userEmail={user?.email} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <h1
          className="text-3xl font-medium mb-8"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInfo.title')}</CardTitle>
              <CardDescription>
                {t('profileInfo.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profileInfo.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('profileInfo.emailHelper')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profileInfo.fullName')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('profileInfo.fullNamePlaceholder')}
                  />
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? t('common:loading.saving') : t('profileInfo.saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>{t('changePassword.title')}</CardTitle>
              <CardDescription>
                {t('changePassword.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('changePassword.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('changePassword.newPasswordPlaceholder')}
                    minLength={6}
                  />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('changePassword.minCharacters')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('changePassword.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('changePassword.confirmPasswordPlaceholder')}
                    minLength={6}
                  />
                </div>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm" style={{ color: 'var(--error)' }}>{t('changePassword.mismatch')}</p>
                )}

                <Button
                  type="submit"
                  disabled={
                    isUpdatingPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 6
                  }
                >
                  {isUpdatingPassword ? t('common:loading.updating') : t('changePassword.updatePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accountInfo.title')}</CardTitle>
              <CardDescription>
                {t('accountInfo.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{t('accountInfo.memberSince')}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile?.created_at && formatShortDate(new Date(profile.created_at))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{t('accountInfo.lastUpdated')}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {profile?.updated_at && formatShortDate(new Date(profile.updated_at))}
                </span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">{t('dangerZone.title')}</CardTitle>
              <CardDescription>
                {t('dangerZone.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t('dangerZone.warning')}
                </div>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
