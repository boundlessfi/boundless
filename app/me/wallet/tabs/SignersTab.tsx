'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Fingerprint, UserPlus, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAvailableSigners,
  getCredentialIdFromSigner,
  addDelegatedSigner,
  type ContractSigner,
} from '@/lib/smart-wallet/client';

export default function SignersTab() {
  const [signers, setSigners] = useState<ContractSigner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [delegatedAddress, setDelegatedAddress] = useState('');
  const [contextRuleId, setContextRuleId] = useState('0');
  const [adding, setAdding] = useState(false);

  const fetchSigners = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getAvailableSigners();
      setSigners(s);
    } catch {
      toast.error('Failed to load signers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSigners();
  }, [fetchSigners]);

  const handleAddDelegated = async () => {
    if (!delegatedAddress.trim()) {
      toast.error('Please enter a Stellar address');
      return;
    }
    if (!delegatedAddress.startsWith('G') || delegatedAddress.length !== 56) {
      toast.error('Invalid Stellar G-address');
      return;
    }

    setAdding(true);
    try {
      await addDelegatedSigner(
        parseInt(contextRuleId, 10),
        delegatedAddress.trim()
      );
      toast.success('Delegated signer added');
      setDelegatedAddress('');
      setShowAddForm(false);
      await fetchSigners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add signer');
    } finally {
      setAdding(false);
    }
  };

  const getSignerType = (
    signer: ContractSigner
  ): { label: string; icon: typeof Key } => {
    if ('tag' in signer) {
      if (signer.tag === 'External') {
        return { label: 'Passkey', icon: Fingerprint };
      }
      if (signer.tag === 'Delegated') {
        return { label: 'Delegated', icon: Key };
      }
    }
    return { label: 'Unknown', icon: Key };
  };

  const getSignerDisplay = (signer: ContractSigner): string => {
    const credId = getCredentialIdFromSigner(signer);
    if (credId) {
      return `Passkey: ${credId.slice(0, 16)}...`;
    }
    if ('tag' in signer && signer.tag === 'Delegated' && signer.values) {
      const addr = String(signer.values[0]);
      return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
    }
    return 'Unknown signer';
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
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-base font-semibold text-white sm:text-lg'>
            On-chain Signers
          </h3>
          <p className='text-xs text-white/50 sm:text-sm'>
            Signers authorized to act on your smart wallet via context rules.
          </p>
        </div>
        <Button
          size='sm'
          onClick={() => setShowAddForm(!showAddForm)}
          className='bg-primary hover:bg-primary/90 w-full gap-2 text-black sm:w-auto'
        >
          {showAddForm ? (
            <>
              <X className='h-4 w-4' /> Cancel
            </>
          ) : (
            <>
              <UserPlus className='h-4 w-4' /> Add Signer
            </>
          )}
        </Button>
      </div>

      {/* Add delegated signer form */}
      {showAddForm && (
        <div className='border-primary/20 bg-primary/5 rounded-2xl border p-4 sm:p-5'>
          <h4 className='mb-3 text-sm font-semibold text-white'>
            Add Delegated Signer (G-address)
          </h4>
          <div className='space-y-3'>
            <Input
              placeholder='G-address (e.g. GABCD...)'
              value={delegatedAddress}
              onChange={e => setDelegatedAddress(e.target.value)}
              className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
            <Input
              placeholder='Context Rule ID (default: 0)'
              value={contextRuleId}
              onChange={e => setContextRuleId(e.target.value)}
              type='number'
              className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
            <Button
              onClick={handleAddDelegated}
              disabled={adding}
              className='bg-primary hover:bg-primary/90 w-full text-black sm:w-auto'
            >
              {adding ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Add Delegated Signer
            </Button>
          </div>
        </div>
      )}

      {/* Signers list */}
      {signers.length === 0 ? (
        <div className='rounded-2xl border border-white/5 bg-white/2 p-8 text-center'>
          <Key className='mx-auto h-12 w-12 text-white/20' />
          <p className='mt-4 text-sm text-white/40'>
            No signers found. Signers are added through context rules on your
            smart wallet contract.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {signers.map((signer, index) => {
            const { label, icon: Icon } = getSignerType(signer);
            return (
              <div
                key={index}
                className='flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 sm:p-5'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
                  <Icon className='text-primary h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-white'>
                      {label}
                    </span>
                    <span className='rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40'>
                      #{index + 1}
                    </span>
                  </div>
                  <p className='mt-0.5 truncate font-mono text-xs text-white/40'>
                    {getSignerDisplay(signer)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
