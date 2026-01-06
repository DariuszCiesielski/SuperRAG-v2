
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';

type AuthMode = 'sign-in' | 'sign-up' | 'reset-password';

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting sign in for:', email);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else {
          throw error;
        }
      }

      console.log('Sign in successful:', data.user?.email);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

    } catch (error: any) {
      console.error('Auth form error:', error);
      toast({
        title: "Sign In Error",
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
        throw new Error('Passwords do not match. Please try again.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
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
        title: "Account Created!",
        description: "Please check your email to confirm your account.",
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Error",
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
        title: "Reset Email Sent!",
        description: "Please check your email for password reset instructions.",
      });

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset Password Error",
        description: error.message,
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
    if (mode === 'sign-in') return 'Sign In';
    if (mode === 'sign-up') return 'Create Account';
    if (mode === 'reset-password') return 'Reset Password';
  };

  const getDescription = () => {
    if (mode === 'sign-in') return 'Enter your credentials to access your notebooks';
    if (mode === 'sign-up') return 'Create a new account to get started';
    if (mode === 'reset-password') return 'Enter your email to receive reset instructions';
  };

  const getButtonText = () => {
    if (loading) {
      if (mode === 'sign-in') return 'Signing In...';
      if (mode === 'sign-up') return 'Creating Account...';
      if (mode === 'reset-password') return 'Sending Email...';
    }
    if (mode === 'sign-in') return 'Sign In';
    if (mode === 'sign-up') return 'Create Account';
    if (mode === 'reset-password') return 'Send Reset Link';
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
              <strong>Check your email!</strong>
              <p className="mt-1">
                We've sent you an email with {mode === 'reset-password' ? 'password reset instructions' : 'a confirmation link'}.
                Please check your inbox and spam folder.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={emailSent}
            />
          </div>

          {mode !== 'reset-password' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
                disabled={emailSent}
              />
            </div>
          )}

          {mode === 'sign-up' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                minLength={6}
                disabled={emailSent}
              />
            </div>
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
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Don't have an account? Sign up
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setMode('reset-password');
                    setEmailSent(false);
                    setPassword('');
                  }}
                >
                  Forgot password?
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
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                Back to sign in
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
