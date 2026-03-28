'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Fingerprint,
  Loader2,
  Clock,
  Key,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredCredentials,
  deployPendingCredential,
  deletePendingCredential,
  type StoredCredential,
} from '@/lib/smart-wallet/client';

export default function PasskeysTab() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const creds = await getStoredCredentials();
      setCredentials(creds);
    } catch {
      toast.error('Failed to load passkeys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleDeploy = async (cred: StoredCredential) => {
    setActionLoading(cred.credentialId);
    try {
      const result = await deployPendingCredential(cred.credentialId);
      if (result.success) {
        toast.success('Wallet deployed successfully!');
      } else {
        toast.error(`Deployment failed: ${result.error}`);
      }
      await fetchCredentials();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to deploy credential'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (cred: StoredCredential) => {
    setActionLoading(cred.credentialId);
    try {
      await deletePendingCredential(cred.credentialId);
      toast.success('Credential removed');
      await fetchCredentials();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove credential'
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-6 w-6 animate-spin text-white/40' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-base font-semibold text-white sm:text-lg'>
          Passkeys
        </h3>
        <p className='text-xs text-white/50 sm:text-sm'>
          WebAuthn credentials stored in your browser for signing transactions.
        </p>
      </div>

      {credentials.length === 0 ? (
        <div className='rounded-2xl border border-white/5 bg-white/2 p-8 text-center'>
          <Fingerprint className='mx-auto h-12 w-12 text-white/20' />
          <p className='mt-4 text-sm text-white/40'>
            No passkeys found. Passkeys are created when you register or connect
            a smart wallet.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {credentials.map(cred => {
            const isPending =
              cred.deploymentStatus === 'pending' ||
              cred.deploymentStatus === 'failed';
            const isActioning = actionLoading === cred.credentialId;

            return (
              <div
                key={cred.credentialId}
                className='rounded-2xl border border-white/5 bg-white/2 p-5'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
                      <Key className='text-primary h-5 w-5' />
                    </div>
                    <div className='space-y-1'>
                      <h4 className='text-sm font-semibold text-white'>
                        {cred.nickname || 'Passkey'}
                      </h4>
                      <p className='font-mono text-xs text-white/40'>
                        ID: {cred.credentialId.slice(0, 16)}...
                      </p>
                      {cred.contractId && (
                        <p className='font-mono text-xs text-white/40'>
                          Contract: {cred.contractId.slice(0, 8)}...
                          {cred.contractId.slice(-8)}
                        </p>
                      )}
                      {cred.createdAt && (
                        <div className='flex items-center gap-1 text-xs text-white/30'>
                          <Clock className='h-3 w-3' />
                          Created{' '}
                          {new Date(cred.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cred.deploymentStatus === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : cred.deploymentStatus === 'failed'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-green-500/10 text-green-400'
                      }`}
                    >
                      {cred.deploymentStatus || 'deployed'}
                    </span>
                  </div>
                </div>

                {/* Actions for pending/failed credentials */}
                {isPending && (
                  <div className='mt-4 flex gap-2 border-t border-white/5 pt-4'>
                    <Button
                      size='sm'
                      onClick={() => handleDeploy(cred)}
                      disabled={isActioning}
                      className='bg-primary hover:bg-primary/90 gap-2 text-black'
                    >
                      {isActioning ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      ) : (
                        <RotateCw className='h-3 w-3' />
                      )}
                      Retry Deploy
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleDelete(cred)}
                      disabled={isActioning}
                      className='gap-2 border-white/10 bg-transparent text-white hover:bg-red-500/10 hover:text-red-400'
                    >
                      <Trash2 className='h-3 w-3' />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
