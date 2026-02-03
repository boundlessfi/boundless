'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Mail,
  Users,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { acceptTeamInvitation } from '@/lib/api/hackathons';
import { toast } from 'sonner';

const AcceptTeamInvitationPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTeamName, setSuccessTeamName] = useState<string>('');
  const [showAcceptButton, setShowAcceptButton] = useState(false);

  const hackathonSlug = params.slug as string;
  const token = params.token as string;
  const redirectToken = searchParams.get('token');
  const invitationToken = token || redirectToken;

  useEffect(() => {
    if (!invitationToken) {
      router.push(`/hackathons/${hackathonSlug}`);
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
  }, [isAuthenticated, authLoading, invitationToken, hackathonSlug]);

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
      const response = await acceptTeamInvitation(hackathonSlug, {
        token: invitationToken,
      });

      if (response.success) {
        setSuccessTeamName(response.data.teamName);
        toast.success(`Successfully joined ${response.data.teamName}!`);
        setTimeout(() => {
          router.push(`/hackathons/${hackathonSlug}`);
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to accept invitation';
      setError(errorMessage);

      // Handle specific error cases
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

  // Loading authentication state
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            <div className='mb-6 flex justify-center'>
              <div className='relative'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full border border-[#a7f950]/20 bg-[#a7f950]/10'>
                  <Users className='h-10 w-10 text-[#a7f950]' />
                </div>
                <div className='absolute -top-1 -right-1'>
                  <Loader2 className='h-6 w-6 animate-spin text-[#a7f950]' />
                </div>
              </div>
            </div>

            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              Verifying Invitation
            </h1>

            <p className='mb-6 text-center text-white/70'>
              Please wait while we verify your invitation...
            </p>

            <div className='space-y-3'>
              <div className='flex items-center gap-3 text-sm'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-[#a7f950]' />
                <span className='text-white/70'>Checking authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show accept button (user is authenticated and ready to accept)
  if (showAcceptButton && !error && !successTeamName) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            {/* Icon */}
            <div className='mb-6 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border border-[#a7f950]/20 bg-[#a7f950]/10'>
                <Users className='h-10 w-10 text-[#a7f950]' />
              </div>
            </div>

            {/* Title */}
            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              Team Invitation
            </h1>

            {/* Description */}
            <p className='mb-6 text-center text-white/70'>
              You've been invited to join a team for this hackathon. Click below
              to accept the invitation and become a team member.
            </p>

            {/* Info box */}
            <div className='mb-6 rounded-lg border border-[#a7f950]/20 bg-[#a7f950]/10 p-4'>
              <div className='flex items-start gap-3'>
                <Shield className='mt-0.5 h-5 w-5 flex-shrink-0 text-[#a7f950]' />
                <div className='text-sm'>
                  <p className='mb-1 font-medium text-[#a7f950]'>
                    Ready to join?
                  </p>
                  <p className='text-white/70'>
                    By accepting this invitation, you'll be added to the team
                    and can start collaborating immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className='space-y-3'>
              <button
                onClick={handleAcceptInvitation}
                disabled={isProcessing}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#a7f950] px-6 py-3 font-medium text-black transition-colors hover:bg-[#8ae63a] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isProcessing ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Accepting Invitation...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </button>
              <button
                onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
                disabled={isProcessing}
                className='w-full rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isProcessing) {
    const isWrongEmail = error.includes('different email address');
    const isExpired = error.includes('expired') || error.includes('not found');
    const isAlreadyMember = error.includes('already a member');

    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            {/* Icon */}
            <div className='mb-6 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border border-[#a7f950]/20 bg-[#a7f950]/10'>
                {isAlreadyMember ? (
                  <CheckCircle2 className='h-10 w-10 text-[#a7f950]' />
                ) : (
                  <AlertCircle className='h-10 w-10 text-[#a7f950]' />
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              {isAlreadyMember
                ? 'Already a Team Member'
                : isWrongEmail
                  ? 'Wrong Account'
                  : isExpired
                    ? 'Invitation Expired'
                    : 'Invitation Error'}
            </h1>

            {/* Description */}
            <p className='mb-6 text-center text-white/70'>{error}</p>

            {/* Additional info for wrong email */}
            {isWrongEmail && (
              <div className='mb-6 rounded-lg border border-[#a7f950]/20 bg-[#a7f950]/10 p-4'>
                <div className='flex items-start gap-3'>
                  <Mail className='mt-0.5 h-5 w-5 flex-shrink-0 text-[#a7f950]' />
                  <div className='text-sm'>
                    <p className='mb-1 font-medium text-[#a7f950]'>
                      Sign up with the correct email
                    </p>
                    <p className='text-white/70'>
                      Create an account with the email this invitation was sent
                      to.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional info for already member */}
            {isAlreadyMember && (
              <div className='mb-6 rounded-lg border border-[#a7f950]/20 bg-[#a7f950]/10 p-4'>
                <div className='flex items-start gap-3'>
                  <Shield className='mt-0.5 h-5 w-5 flex-shrink-0 text-[#a7f950]' />
                  <div className='text-sm'>
                    <p className='mb-1 font-medium text-[#a7f950]'>
                      You're all set!
                    </p>
                    <p className='text-white/70'>
                      You're already part of this team. Head back to the
                      hackathon page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className='space-y-3'>
              {isWrongEmail ? (
                <>
                  <button
                    onClick={() => {
                      const redirectUrl = `/hackathons/${hackathonSlug}/team-invitations/${invitationToken}/accept`;
                      router.push(
                        `/auth?mode=signup&redirect=${encodeURIComponent(redirectUrl)}`
                      );
                    }}
                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#a7f950] px-6 py-3 font-medium text-black transition-colors hover:bg-[#8ae63a]'
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
                    className='w-full rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10'
                  >
                    Visit Hackathon
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
                  className='w-full rounded-lg bg-[#a7f950] px-6 py-3 font-medium text-black transition-colors hover:bg-[#8ae63a]'
                >
                  Go to Hackathon
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state (brief moment before redirect)
  if (successTeamName) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            {/* Icon */}
            <div className='mb-6 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border border-[#a7f950]/20 bg-[#a7f950]/10'>
                <CheckCircle2 className='h-10 w-10 text-[#a7f950]' />
              </div>
            </div>

            {/* Title */}
            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              Successfully Joined!
            </h1>

            {/* Description */}
            <p className='mb-6 text-center text-white/70'>
              Welcome to {successTeamName}! Redirecting to hackathon page...
            </p>

            {/* Progress bar */}
            <div className='h-1 overflow-hidden rounded-full bg-white/10'>
              <div className='h-full animate-[loading_2s_ease-in-out] bg-[#a7f950]' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AcceptTeamInvitationPage;
