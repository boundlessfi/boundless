'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const invitationId = params.invitationId as string;

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!invitationId) {
        setStatus('error');
        setErrorMessage('No invitation ID provided');
        return;
      }

      try {
        const result = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (result.data) {
          // Extract organizationId from the response structure
          // Better Auth returns: { invitation: {...}, member: {...} }
          const response = result.data as {
            invitation?: { organizationId: string };
            member?: { organizationId: string };
          };

          const organizationId =
            response.invitation?.organizationId ||
            response.member?.organizationId;

          if (!organizationId) {
            throw new Error('Organization ID not found in response');
          }

          toast.success('Invitation accepted! Redirecting...');
          setStatus('success');

          setTimeout(() => {
            router.push(`/organizations/${organizationId}`);
          }, 1500);
        } else {
          throw new Error('Failed to accept invitation');
        }
      } catch (error) {
        console.error('Error accepting invitation:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to accept invitation. It may be expired or invalid.';
        setErrorMessage(message);
        toast.error(message);
        setStatus('error');
      }
    };

    acceptInvitation();
  }, [invitationId, router]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-black'>
      <div className='w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur-sm'>
        {status === 'loading' && (
          <div className='space-y-4'>
            <Loader2 className='text-primary mx-auto h-12 w-12 animate-spin' />
            <h1 className='text-2xl font-semibold text-white'>
              Accepting Invitation
            </h1>
            <p className='text-zinc-400'>
              Please wait while we process your invitation...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className='space-y-4'>
            <CheckCircle2 className='mx-auto h-12 w-12 text-green-500' />
            <h1 className='text-2xl font-semibold text-white'>
              Invitation Accepted!
            </h1>
            <p className='text-zinc-400'>
              Redirecting you to the organization...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className='space-y-4'>
            <XCircle className='mx-auto h-12 w-12 text-red-500' />
            <h1 className='text-2xl font-semibold text-white'>
              Failed to Accept Invitation
            </h1>
            <p className='text-zinc-400'>
              {errorMessage || 'The invitation may be expired or invalid.'}
            </p>
            <button
              onClick={() => router.push('/organizations')}
              className='bg-primary hover:bg-primary/90 mt-4 rounded-lg px-6 py-2 text-white transition-colors'
            >
              Go to Organizations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
