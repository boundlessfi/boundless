'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, Loader2, XCircle } from 'lucide-react';
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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      router.push('/hackathons');
      return;
    }

    if (!isAuthenticated && !authLoading) {
      redirectToAuth();
    }
  }, [isAuthenticated, authLoading, invitationToken]);

  const redirectToAuth = () => {
    const currentUrl = window.location.href;
    const encodedRedirect = encodeURIComponent(currentUrl);
    router.push(`/auth/login?redirect=${encodedRedirect}`);
  };

  const handleReject = async () => {
    if (!invitationToken || !hackathonSlug) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await rejectTeamInvitation(
        hackathonSlug,
        invitationToken
      );

      if (response.success) {
        setSuccess(true);
        // Use the slug from the response if available, otherwise go to hackathons list
        const finalSlug = response.data?.invitation?.hackathon?.slug;
        toast.success('Invitation declined');
        setTimeout(() => {
          if (finalSlug) {
            router.push(`/hackathons/${finalSlug}`);
          } else {
            router.push('/hackathons');
          }
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to decline invitation';
      setError(errorMessage);

      if (err?.status === 403) {
        toast.error('Authentication required');
        redirectToAuth();
      } else if (err?.status === 404) {
        toast.error('Invitation not found or has expired');
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
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              <AlertCircle className='text-destructive h-10 w-10' />
            </div>
            <CardTitle className='text-destructive text-2xl'>
              Unable to Process
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => router.push('/hackathons')}
            >
              Return to Hackathons
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
            <div className='flex justify-center'>
              <Loader2 className='text-primary h-6 w-6 animate-spin' />
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
            onClick={() => router.push('/hackathons')}
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
