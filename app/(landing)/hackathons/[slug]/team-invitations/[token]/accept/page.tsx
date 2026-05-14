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

const REDIRECT_DELAY_MS = 1500;

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
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [successHackathonName, setSuccessHackathonName] = useState<string>('');
  const [autoEnrolled, setAutoEnrolled] = useState(false);
  const [showAcceptButton, setShowAcceptButton] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      router.push('/hackathons');
      return;
    }

    if (isAuthenticated && !authLoading) {
      setShowAcceptButton(true);
    }

    if (!isAuthenticated && !authLoading) {
      redirectToAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, invitationToken]);

  const redirectToAuth = (mode: 'signin' | 'signup' = 'signin') => {
    // The rest of the app uses `callbackUrl`, not `redirect`. Match it so
    // the auth page actually honors where we want to send the user back.
    const callbackUrl = `/hackathons/${hackathonSlug}/team-invitations/${invitationToken}/accept`;
    router.push(
      `/auth?mode=${mode}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  };

  const handleAcceptInvitation = async () => {
    if (!invitationToken || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setErrorStatus(null);

    try {
      const response = await acceptTeamInvitation(
        hackathonSlug,
        invitationToken
      );

      if (response.success) {
        const hackathonName =
          response.data?.hackathon?.name ||
          response.data?.invitation?.hackathon?.name ||
          '';
        setSuccessHackathonName(hackathonName);
        setAutoEnrolled(!!response.data?.autoEnrolled);

        toast.success(
          response.data?.autoEnrolled && hackathonName
            ? `Joined ${hackathonName} and the team!`
            : 'Successfully joined the team!'
        );

        // Prefer the slug from the response, fall back to the slug in the
        // URL (we know it's correct), then finally the hackathons list.
        const finalSlug =
          response.data?.invitation?.hackathon?.slug || hackathonSlug;
        setTimeout(() => {
          router.push(
            finalSlug
              ? `/hackathons/${finalSlug}?tab=team-formation`
              : '/hackathons'
          );
        }, REDIRECT_DELAY_MS);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        status?: number;
        response?: { status?: number };
      };
      const errorMessage = errorObj?.message || 'Failed to accept invitation';
      const status = errorObj?.status ?? errorObj?.response?.status ?? null;
      setError(errorMessage);
      setErrorStatus(status);

      // Status-specific toasts. The error card below has the full copy and
      // the right action button — toast is a quick attention grab.
      if (status === 403) {
        if (errorMessage.toLowerCase().includes('different email')) {
          toast.error('This invitation was sent to a different email address');
        } else {
          toast.error('Authentication required');
          redirectToAuth();
        }
      } else if (status === 404) {
        toast.error('Invitation not found or has expired');
      } else if (status === 409) {
        toast.error("You're already on this team");
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

  if (showAcceptButton && !error && !successHackathonName) {
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
    const isWrongEmail =
      errorStatus === 403 && error.toLowerCase().includes('different email');
    const isAlreadyMember =
      errorStatus === 409 || error.toLowerCase().includes('already');
    const isNotFound = errorStatus === 404;

    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                isAlreadyMember ? 'bg-primary/10' : 'bg-destructive/10'
              }`}
            >
              {isAlreadyMember ? (
                <CheckCircle2 className='text-primary h-10 w-10' />
              ) : (
                <AlertCircle className='text-destructive h-10 w-10' />
              )}
            </div>
            <CardTitle className='text-2xl'>
              {isAlreadyMember
                ? "You're already on this team"
                : isNotFound
                  ? 'Invitation not found'
                  : isWrongEmail
                    ? 'Wrong account'
                    : 'Unable to Join'}
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            {isWrongEmail && (
              <Alert variant='destructive'>
                <Mail className='h-4 w-4' />
                <AlertTitle>Sign in with the invited email</AlertTitle>
                <AlertDescription>
                  This invitation was sent to a different email address than the
                  one you're signed in with. Sign out, then sign back in with
                  the email the invitation was sent to.
                </AlertDescription>
              </Alert>
            )}
            {isNotFound && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Expired or revoked</AlertTitle>
                <AlertDescription>
                  Invitations expire after 7 days. Ask the team leader to send
                  you a fresh one.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className='flex flex-col gap-3'>
            {isWrongEmail && (
              // Signin (not signup) — they already have an account, they
              // just need to switch to the right one.
              <Button
                className='w-full'
                onClick={() => redirectToAuth('signin')}
              >
                Switch Account
              </Button>
            )}
            {isAlreadyMember && (
              <Button
                className='w-full'
                onClick={() =>
                  router.push(`/hackathons/${hackathonSlug}?tab=team-formation`)
                }
              >
                View Team
              </Button>
            )}
            <Button
              variant={isWrongEmail || isAlreadyMember ? 'outline' : 'default'}
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

  if (successHackathonName || (!error && !showAcceptButton && !authLoading)) {
    // Render the success card if we got a hackathon name back, or as a
    // generic fallback if no other state matches (defensive — should be
    // rare since the auth/error/accept-button branches above cover most
    // paths, but stops the page rendering blank if response shape shifts).
    const showingSuccess = !!successHackathonName;
    return (
      <div className='bg-background flex min-h-screen items-center justify-center p-4'>
        <Card className='border-border bg-card w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
              {showingSuccess ? (
                <CheckCircle2 className='text-primary h-10 w-10' />
              ) : (
                <Loader2 className='text-primary h-10 w-10 animate-spin' />
              )}
            </div>
            <CardTitle className='text-2xl'>
              {showingSuccess ? 'Welcome!' : 'Loading...'}
            </CardTitle>
            <CardDescription>
              {showingSuccess
                ? autoEnrolled
                  ? `You've joined ${successHackathonName} and the team. Redirecting...`
                  : `You've successfully joined the team in ${successHackathonName}. Redirecting...`
                : 'Preparing your invitation.'}
            </CardDescription>
          </CardHeader>
          {showingSuccess && (
            <CardContent>
              <div className='bg-secondary h-1 w-full overflow-hidden rounded-full'>
                <div className='bg-primary h-full w-full animate-[loading_1.5s_ease-in-out]' />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptTeamInvitationPage;
