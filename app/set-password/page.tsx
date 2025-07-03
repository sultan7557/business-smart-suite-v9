'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying your token...');
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams?.get('t') || searchParams?.get('token');
    
    if (!tokenFromUrl) {
      setMessage('Invalid or missing password reset token. Please check your email and try again.');
      setIsError(true);
      setLoading(false);
      return;
    }

    setToken(tokenFromUrl);
    setLoading(false);
    setMessage('Please set your new password');
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!token) {
      toast.error('No token found. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password set successfully!');
        setPasswordSet(true);
        setMessage('Your password has been set successfully. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(data.error || 'Failed to set password');
        setMessage(data.error || 'Failed to set password. Please try again or contact support.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('An unexpected error occurred');
      setMessage('An unexpected error occurred. Please try again or contact support.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set Your Password</CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {loading && !passwordSet && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500">Verifying your token...</p>
            </div>
          )}
          
          {!loading && !passwordSet && !isError && token && (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter your new password"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm your new password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Set Password'}
              </Button>
            </form>
          )}
          
          {!loading && isError && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline" 
                className="mt-4 w-full"
              >
                Return to Login
              </Button>
            </Alert>
          )}
          
          {!loading && passwordSet && (
            <Alert className="w-full bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline" 
                className="mt-4 w-full"
              >
                Go to Login
              </Button>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 