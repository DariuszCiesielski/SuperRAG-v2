import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, STRIPE_PRICE_ID_PRO } from '@/hooks/useSubscription';
import { Mail } from 'lucide-react';

type AuthMode = 'sign-in' | 'sign-up' | 'reset-password';

const AuthForm = () => {
  const { t } = useTranslation('auth');
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { createCheckoutSession } = useSubscription();

  // Check for upgrade intent from landing page
  const upgradeIntent = searchParams.get('intent');

  // Handle email confirmation and password reset from URL hash
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type) {
        console.log('Auth callback detected:', type);

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (error) throw error;

          console.log('Session set successfully');

          // Clear hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);

          toast({
            title: type === 'signup' ? 'Email Confirmed!' : 'Password Reset Success!',
            description: type === 'signup'
              ? 'Your account has been verified. Welcome!'
              : 'You can now sign in with your new password.',
          });

          // Navigate to dashboard if signup, stay on auth page if password reset
          if (type === 'signup') {
            navigate('/', { replace: true });
          }
        } catch (error: any) {
          console.error('Error setting session:', error);
          toast({
            title: 'Authentication Error',
            description: error.message || 'Failed to complete authentication',
            variant: 'destructive',
          });
        }
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Redirect to dashboard or checkout if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (upgradeIntent === 'upgrade_pro') {
        console.log('User is authenticated, initiating checkout for Pro plan');
        createCheckoutSession(STRIPE_PRICE_ID_PRO);
      } else {
        console.log('User is authenticated, redirecting to dashboard');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, upgradeIntent, createCheckoutSession]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting sign in for:', email);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('account_not_found');
          return;
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else {
          throw error;
        }
      }

      console.log('Sign in successful:', data.user?.email);

      toast({
        title: t('success.welcomeBack'),
        description: t('success.welcomeBackDesc'),
      });

    } catch (error: any) {
      console.error('Auth form error:', error);
      toast({
        title: t('errors.genericError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error(t('errors.passwordsDoNotMatch'));
      }

      if (password.length < 6) {
        throw new Error(t('errors.passwordTooShort'));
      }

      console.log('Attempting sign up for:', email);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful:', data.user?.email);

      setEmailSent(true);
      toast({
        title: t('success.accountCreated'),
        description: t('signUp.checkEmailDesc'),
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: t('errors.genericError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      console.log('Password reset email sent');

      setEmailSent(true);
      toast({
        title: t('success.resetLinkSent'),
        description: t('success.resetLinkSentDesc'),
      });

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: t('errors.genericError'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Resending verification email for:', email);

      // Resend by attempting to sign up again with the same email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      console.log('Verification email resent');

      setEmailSent(true);
      toast({
        title: "Verification Email Sent!",
        description: "Please check your email (and spam folder) for the verification link.",
      });

    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Resend Error",
        description: error.message || 'Failed to resend verification email',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'sign-in') return handleSignIn(e);
    if (mode === 'sign-up') return handleSignUp(e);
    if (mode === 'reset-password') return handleResetPassword(e);
  };

  const getTitle = () => {
    if (mode === 'sign-in') return t('signIn.title');
    if (mode === 'sign-up') return t('signUp.title');
    if (mode === 'reset-password') return t('resetPassword.title');
  };

  const getDescription = () => {
    if (mode === 'sign-in') return t('signIn.title');
    if (mode === 'sign-up') return t('signUp.title');
    if (mode === 'reset-password') return t('resetPassword.title');
  };

  const getButtonText = () => {
    if (loading) {
      if (mode === 'sign-in') return t('signIn.buttonLoading');
      if (mode === 'sign-up') return t('signUp.buttonLoading');
      if (mode === 'reset-password') return t('resetPassword.buttonLoading');
    }
    if (mode === 'sign-in') return t('signIn.button');
    if (mode === 'sign-up') return t('signUp.button');
    if (mode === 'reset-password') return t('resetPassword.button');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent && (
          <Alert className="mb-4">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>{mode === 'reset-password' ? t('resetPassword.checkEmail') : t('signUp.checkEmail')}</strong>
              <p className="mt-1">
                {mode === 'reset-password' ? t('resetPassword.checkEmailDesc') : t('signUp.checkEmailDesc')}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="email">{t('fields.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              required
              placeholder={t('fields.emailPlaceholder')}
              disabled={emailSent}
            />
          </div>

          {mode !== 'reset-password' && (
            <div className="space-y-2">
              <Label htmlFor="password">{t('fields.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
                placeholder={t('fields.passwordPlaceholder')}
                minLength={6}
                disabled={emailSent}
              />
            </div>
          )}

          {mode === 'sign-up' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('fields.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={t('fields.confirmPasswordPlaceholder')}
                minLength={6}
                disabled={emailSent}
              />
            </div>
          )}

          {error === 'account_not_found' && mode === 'sign-in' && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription>
                <p className="text-sm text-gray-700">
                  {t('errors.accountNotFound')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('sign-up');
                      setError(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    {t('errors.createNewAccount')}
                  </button>
                  {' '}{t('errors.checkCredentials')}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading || emailSent}>
            {getButtonText()}
          </Button>

          <div className="space-y-2 pt-4 border-t">
            {mode === 'sign-in' && (
              <>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setMode('sign-up');
                    setEmailSent(false);
                    setError(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  {t('signIn.noAccount')} {t('signIn.signUpLink')}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setMode('reset-password');
                    setEmailSent(false);
                    setError(null);
                    setPassword('');
                  }}
                >
                  {t('signIn.forgotPassword')} {t('signIn.resetLink')}
                </Button>
              </>
            )}

            {(mode === 'sign-up' || mode === 'reset-password') && (
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => {
                  setMode('sign-in');
                  setEmailSent(false);
                  setError(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                {t('resetPassword.backToSignIn')}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
