'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { acceptTeamInvitation } from '@/lib/api/hackathons';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AcceptTeamInvitationPage = () => {
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
  const [successTeamName, setSuccessTeamName] = useState<string>('');
  const [showAcceptButton, setShowAcceptButton] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      router.push('/hackathons');
      return;
    }

    // If user is authenticated, show accept button
    if (isAuthenticated && !authLoading) {
      setShowAcceptButton(true);
    }

    // If user is not authenticated and not loading, redirect to auth
    if (!isAuthenticated && !authLoading) {
      redirectToAuth();
    }
  }, [isAuthenticated, authLoading, invitationToken]);

  const redirectToAuth = () => {
    const redirectUrl = `/hackathons/${hackathonSlug}/team-invitations/${invitationToken}/accept`;
    const authUrl = `/auth?mode=signin&redirect=${encodeURIComponent(redirectUrl)}`;
    router.push(authUrl);
  };

  const handleAcceptInvitation = async () => {
    if (!invitationToken || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await acceptTeamInvitation(
        hackathonSlug,
        invitationToken
      );

      if (response.success) {
        setSuccessTeamName(response.data?.teamId || 'the team');
        // Use the slug from the response if available, otherwise go to hackathons list
        const finalSlug = response.data?.invitation?.hackathon?.slug;
        toast.success('Successfully joined the team!');
        setTimeout(() => {
          if (finalSlug) {
            router.push(`/hackathons/${finalSlug}?tab=team-formation`);
          } else {
            router.push('/hackathons');
          }
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to accept invitation';
      setError(errorMessage);

      if (err?.status === 403) {
        if (errorMessage.includes('different email address')) {
          toast.error('This invitation was sent to a different email address');
        } else {
          toast.error('Authentication required');
          redirectToAuth();
        }
      } else if (err?.status === 404) {
        toast.error('Invitation not found or has expired');
      } else if (err?.status === 409) {
        toast.error('You are already a member of this team');
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

  if (showAcceptButton && !error && !successTeamName) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              <Users className='text-primary h-10 w-10' />
            </div>
            <CardTitle className='text-2xl'>Team Invitation</CardTitle>
            <CardDescription>
              You've been invited to join a team for this hackathon.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert className='border-primary/20 bg-primary/5'>
              <Shield className='text-primary h-4 w-4' />
              <AlertTitle className='text-primary'>Ready to join?</AlertTitle>
              <AlertDescription>
                By accepting this invitation, you'll be added to the team and
                can start collaborating immediately.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            <Button
              className='w-full gap-2'
              size='lg'
              onClick={handleAcceptInvitation}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Accepting...
                </>
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </Button>
            <Button
              variant='outline'
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
  }

  if (error && !isProcessing) {
    const isWrongEmail = error.includes('different email address');
    const isAlreadyMember = error.includes('already a member');

    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              {isAlreadyMember ? (
                <CheckCircle2 className='text-primary h-10 w-10' />
              ) : (
                <AlertCircle className='text-destructive h-10 w-10' />
              )}
            </div>
            <CardTitle className='text-2xl'>
              {isAlreadyMember ? 'Already a Member' : 'Unable to Join'}
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            {isWrongEmail && (
              <Alert variant='destructive'>
                <Mail className='h-4 w-4' />
                <AlertTitle>Wrong Account</AlertTitle>
                <AlertDescription>
                  Please sign in with the email address this invitation was sent
                  to.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            {isWrongEmail ? (
              <>
                <Button
                  className='w-full'
                  onClick={() => {
                    const redirectUrl = `/hackathons/${hackathonSlug}/team-invitations/${invitationToken}/accept`;
                    router.push(
                      `/auth?mode=signup&redirect=${encodeURIComponent(redirectUrl)}`
                    );
                  }}
                >
                  Switch Account
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => router.push('/hackathons')}
                >
                  Back to Hackathons
                </Button>
              </>
            ) : (
              <Button
                className='w-full'
                onClick={() => router.push('/hackathons')}
              >
                Back to Hackathons
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (successTeamName) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              <CheckCircle2 className='text-primary h-10 w-10' />
            </div>
            <CardTitle className='text-2xl'>Welcome!</CardTitle>
            <CardDescription>
              You've successfully joined {successTeamName}. Redirecting...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='bg-secondary h-1 w-full overflow-hidden rounded-full'>
              <div className='bg-primary h-full w-full animate-[loading_2s_ease-in-out]' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptTeamInvitationPage;
