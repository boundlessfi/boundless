'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { rejectTeamInvitation } from '@/lib/api/hackathons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const REDIRECT_DELAY_MS = 1500;

const RejectTeamInvitationPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const hackathonSlug = params.slug as string;
  const token = params.token as string;
  const redirectToken = searchParams.get('token');
  const invitationToken = token || redirectToken;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      router.push('/hackathons');
      return;
    }

    if (!isAuthenticated && !authLoading) {
      redirectToAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, invitationToken]);

  const redirectToAuth = () => {
    // Match the rest of the app: /auth?mode=signin&callbackUrl=...
    // (the previous /auth/login?redirect=... was a non-existent route and
    // got the user stuck.)
    const callbackUrl = `/hackathons/${hackathonSlug}/team-invitations/${invitationToken}/reject`;
    router.push(
      `/auth?mode=signin&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  };

  const handleReject = async () => {
    if (!invitationToken || !hackathonSlug) return;

    setIsProcessing(true);
    setError(null);
    setErrorStatus(null);

    try {
      const response = await rejectTeamInvitation(
        hackathonSlug,
        invitationToken
      );

      if (response.success) {
        setSuccess(true);
        const finalSlug =
          response.data?.invitation?.hackathon?.slug || hackathonSlug;
        toast.success('Invitation declined');
        setTimeout(() => {
          router.push(finalSlug ? `/hackathons/${finalSlug}` : '/hackathons');
        }, REDIRECT_DELAY_MS);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        status?: number;
        response?: { status?: number };
      };
      const errorMessage = errorObj?.message || 'Failed to decline invitation';
      const status = errorObj?.status ?? errorObj?.response?.status ?? null;
      setError(errorMessage);
      setErrorStatus(status);

      if (status === 403) {
        toast.error('Authentication required');
        redirectToAuth();
      } else if (status === 404) {
        toast.error('Invitation not found or has expired');
      } else if (status === 400 && /already/i.test(errorMessage)) {
        // Backend uses 400 for "Invitation has already been {accepted|rejected|expired}"
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
            </div>
            <CardTitle>Verifying Invitation</CardTitle>
            <CardDescription>
              Please wait while we verify your invitation...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error && !success) {
    const isAlreadyResponded = errorStatus === 400 && /already/i.test(error);
    const isNotFound = errorStatus === 404;

    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                isAlreadyResponded ? 'bg-muted' : 'bg-destructive/10'
              }`}
            >
              {isAlreadyResponded ? (
                <CheckCircle2 className='text-muted-foreground h-10 w-10' />
              ) : (
                <AlertCircle className='text-destructive h-10 w-10' />
              )}
            </div>
            <CardTitle className='text-2xl'>
              {isAlreadyResponded
                ? 'Already Responded'
                : isNotFound
                  ? 'Invitation Not Found'
                  : 'Unable to Process'}
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
            >
              Back to Hackathon
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-muted mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              <XCircle className='text-muted-foreground h-10 w-10' />
            </div>
            <CardTitle className='text-2xl'>Invitation Declined</CardTitle>
            <CardDescription>
              You've declined this team invitation. Redirecting...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-secondary h-1 w-full overflow-hidden rounded-full'>
              <div className='bg-primary h-full w-full animate-[loading_1.5s_ease-in-out]' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='border-border bg-card w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
            <XCircle className='text-destructive h-10 w-10' />
          </div>
          <CardTitle className='text-2xl'>Decline Team Invitation</CardTitle>
          <CardDescription>
            Are you sure you want to decline this team invitation? This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className='flex flex-col gap-3'>
          <Button
            variant='destructive'
            className='w-full gap-2'
            onClick={handleReject}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Declining...
              </>
            ) : (
              <>
                <XCircle className='h-4 w-4' />
                Decline Invitation
              </>
            )}
          </Button>
          <Button
            variant='ghost'
            className='w-full'
            onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RejectTeamInvitationPage;
