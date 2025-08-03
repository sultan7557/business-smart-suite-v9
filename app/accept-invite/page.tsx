'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Processing your invitation...');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Ensure searchParams is not null before proceeding
    if (!searchParams) {
      setLoading(false);
      setMessage('Error: Search parameters not available.');
      setIsError(true);
      toast.error('Error: Search parameters not available.');
      return;
    }
    const token = searchParams?.get('token');

    if (!token) {
      setMessage('No invitation token found.');
      setIsError(true);
      setLoading(false);
      toast.error('No invitation token found.');
      return;
    }

    const acceptInvite = async () => {
      try {
        const response = await fetch(`/api/accept-invite?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setMessage('Invitation accepted successfully! Your account has been created.');
          setIsSuccess(true);
          setUserEmail(data.user?.email || '');
          toast.success('Invitation accepted successfully!');
          
          // Show success message for 5 seconds before redirecting
          setTimeout(() => {
            router.push('/login');
          }, 5000);
        } else {
          setMessage(data.error || 'Failed to accept invitation.');
          setIsError(true);
          toast.error(data.error || 'Failed to accept invitation.');
        }
      } catch (error) {
        console.error('Error accepting invite:', error);
        setMessage('An unexpected error occurred while processing your invitation.');
        setIsError(true);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {loading ? 'Processing Invitation' : isSuccess ? 'Welcome!' : 'Invitation Status'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {loading ? 'Please wait while we set up your account...' : message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500">Setting up your account...</p>
            </div>
          )}
          
          {!loading && isSuccess && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-green-600 font-medium">Account Created Successfully!</p>
                <p className="text-sm text-gray-600">
                  You will receive an email at <span className="font-medium">{userEmail}</span> with instructions to set your password.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4">
                  <Mail className="w-4 h-4" />
                  <span>Check your email for password setup</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/login')}
                className="mt-4"
              >
                Go to Login
              </Button>
            </div>
          )}
          
          {!loading && isError && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-red-600 font-medium">Invitation Error</p>
                <p className="text-sm text-gray-600">{message}</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
                className="mt-4"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}