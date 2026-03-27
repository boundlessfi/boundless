'use client';

import { useState, useEffect, useCallback } from 'react';
import { Fingerprint, Loader2, Clock, Key } from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredCredentials,
  type StoredCredential,
} from '@/lib/smart-wallet/client';

export default function PasskeysTab() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-6 w-6 animate-spin text-white/40' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>Passkeys</h3>
          <p className='text-sm text-white/50'>
            WebAuthn credentials stored in your browser for signing
            transactions.
          </p>
        </div>
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
        <div className='space-y-3'>
          {credentials.map(cred => (
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
                        Created {new Date(cred.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
