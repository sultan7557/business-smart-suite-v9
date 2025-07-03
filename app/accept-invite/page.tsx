'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Accepting invitation...');
  const [isError, setIsError] = useState(false);

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
          setMessage(data.message || 'Invitation accepted successfully!');
          toast.success(data.message || 'Invitation accepted successfully!');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setMessage(data.error || 'Failed to accept invitation.');
          setIsError(true);
          toast.error(data.error || 'Failed to accept invitation.');
        }
      } catch (error) {
        console.error('Error accepting invite:', error);
        setMessage('An unexpected error occurred.');
        setIsError(true);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Invitation Acceptance</CardTitle>
          <CardDescription className="text-center">
            {loading ? 'Please wait while your invitation is being processed.' : message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {loading && <Spinner size="lg" />}
          {!loading && isError && (
            <p className="text-red-500">{message}</p>
          )}
          {!loading && !isError && (
            <p className="text-green-500">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}