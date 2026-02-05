'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { rejectTeamInvitation } from '@/lib/api/hackathons';
import { toast } from 'sonner';

const RejectTeamInvitationPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hackathonSlug = params.slug as string;
  const token = params.token as string;
  const redirectToken = searchParams.get('token');
  const invitationToken = token || redirectToken;

  useEffect(() => {
    if (!invitationToken) {
      router.push(`/hackathons/${hackathonSlug}`);
      return;
    }

    if (!isAuthenticated && !authLoading) {
      redirectToAuth();
    }
  }, [isAuthenticated, authLoading, invitationToken, hackathonSlug]);

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
        toast.success('Invitation declined');
        setTimeout(() => {
          router.push(`/hackathons/${hackathonSlug}`);
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

  // Loading authentication state
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4'>
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

            <div className='flex justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-[#a7f950]' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-red-500/20 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            <div className='mb-6 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10'>
                <AlertCircle className='h-10 w-10 text-red-500' />
              </div>
            </div>

            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              Unable to Process Invitation
            </h1>

            <p className='mb-6 text-center text-white/70'>{error}</p>

            <button
              onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
              className='w-full rounded-lg bg-[#a7f950] px-6 py-3 font-semibold text-black transition-all hover:bg-[#8fd93f]'
            >
              Return to Hackathon
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
            <div className='mb-6 flex justify-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full border border-gray-500/20 bg-gray-500/10'>
                <XCircle className='h-10 w-10 text-gray-400' />
              </div>
            </div>

            <h1 className='mb-2 text-center text-2xl font-bold text-white'>
              Invitation Declined
            </h1>

            <p className='mb-6 text-center text-white/70'>
              You've declined this team invitation. Redirecting...
            </p>

            <div className='flex justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-[#a7f950]' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main decline confirmation
  return (
    <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-2xl border border-white/10 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm'>
          <div className='mb-6 flex justify-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10'>
              <XCircle className='h-10 w-10 text-red-500' />
            </div>
          </div>

          <h1 className='mb-2 text-center text-2xl font-bold text-white'>
            Decline Team Invitation
          </h1>

          <p className='mb-8 text-center text-white/70'>
            Are you sure you want to decline this team invitation? This action
            cannot be undone.
          </p>

          <div className='space-y-3'>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className='w-full rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50'
            >
              {isProcessing ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Declining...
                </span>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  <XCircle className='h-5 w-5' />
                  Decline Invitation
                </span>
              )}
            </button>

            <button
              onClick={() => router.push(`/hackathons/${hackathonSlug}`)}
              className='w-full rounded-lg border border-white/10 bg-transparent px-6 py-3 font-semibold text-white transition-all hover:bg-white/5'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectTeamInvitationPage;
