'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Key,
  Fingerprint,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getContextRules,
  removeContextRule,
  getCredentialIdFromSigner,
  getAvailableSigners,
  getStoredCredentials,
  type ContextRule,
  type ContractSigner,
  type StoredCredential,
} from '@/lib/smart-wallet/client';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import ContextRuleBuilder from './ContextRuleBuilder';

export default function ContextRulesTab() {
  const { credentialId: activeCredentialId } = useSmartWallet();
  const [rules, setRules] = useState<ContextRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [removingRuleId, setRemovingRuleId] = useState<number | null>(null);

  // Builder modal
  const [builderOpen, setBuilderOpen] = useState(false);
  const [existingSigners, setExistingSigners] = useState<ContractSigner[]>([]);
  const [pendingCredentials, setPendingCredentials] = useState<
    StoredCredential[]
  >([]);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getContextRules();
      setRules(r);
    } catch {
      toast.error('Failed to load context rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSignersAndCredentials = useCallback(async () => {
    try {
      const [signers, creds] = await Promise.all([
        getAvailableSigners(),
        getStoredCredentials(),
      ]);
      setExistingSigners(signers);
      setPendingCredentials(creds);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchSignersAndCredentials();
  }, [fetchRules, fetchSignersAndCredentials]);

  const toggleRule = (index: number) => {
    setExpandedRule(expandedRule === index ? null : index);
  };

  const handleRemoveRule = async (ruleId: number) => {
    setRemovingRuleId(ruleId);
    try {
      const result = await removeContextRule(ruleId);
      if (result.success) {
        toast.success(`Rule #${ruleId} removed`);
        await fetchRules();
      } else {
        toast.error(result.error || 'Failed to remove rule');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove rule');
    } finally {
      setRemovingRuleId(null);
    }
  };

  const handleBuilderSuccess = async () => {
    await fetchRules();
    await fetchSignersAndCredentials();
  };

  const handleOpenBuilder = async () => {
    // Refresh signers/credentials before opening
    await fetchSignersAndCredentials();
    setBuilderOpen(true);
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
            Context Rules
          </h3>
          <p className='text-xs text-white/50 sm:text-sm'>
            On-chain authorization rules that define who can perform what
            operations on your smart wallet.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchRules}
            disabled={loading}
            className='flex-1 gap-2 border-white/10 bg-transparent text-white hover:bg-white/5 sm:flex-none'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size='sm'
            onClick={handleOpenBuilder}
            className='bg-primary hover:bg-primary/90 flex-1 gap-2 text-black sm:flex-none'
          >
            <Plus className='h-4 w-4' />
            Add Rule
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className='rounded-2xl border border-white/5 bg-white/2 p-8 text-center'>
          <Shield className='mx-auto h-12 w-12 text-white/20' />
          <p className='mt-4 text-sm text-white/40'>
            No context rules found. Context rules are created automatically when
            your smart wallet is deployed, or you can add them manually.
          </p>
          <Button
            variant='outline'
            onClick={handleOpenBuilder}
            className='mt-4 gap-2 border-white/10 bg-transparent text-white hover:bg-white/5'
          >
            <Plus className='h-4 w-4' />
            Create Your First Rule
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {rules.map((rule, index) => (
            <div
              key={index}
              className='rounded-2xl border border-white/5 bg-white/2'
            >
              {/* Rule header */}
              <button
                onClick={() => toggleRule(index)}
                className='flex w-full items-center justify-between p-5'
              >
                <div className='flex items-center gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
                    <Shield className='text-primary h-5 w-5' />
                  </div>
                  <div className='text-left'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold text-white'>
                        {rule.name || `Rule #${index}`}
                      </span>
                      <span className='rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40'>
                        {rule.signers?.length ?? 0} signer
                        {(rule.signers?.length ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className='rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40'>
                        {rule.policies?.length ?? 0} polic
                        {(rule.policies?.length ?? 0) !== 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                    <p className='mt-0.5 text-xs text-white/40'>
                      Context: Default
                      {rule.valid_until
                        ? ` | Expires at ledger ${rule.valid_until}`
                        : ''}
                    </p>
                  </div>
                </div>
                {expandedRule === index ? (
                  <ChevronDown className='h-5 w-5 text-white/30' />
                ) : (
                  <ChevronRight className='h-5 w-5 text-white/30' />
                )}
              </button>

              {/* Rule details */}
              {expandedRule === index && (
                <div className='border-t border-white/5 p-5'>
                  {/* Signers */}
                  <div className='mb-4'>
                    <h5 className='mb-2 text-xs font-semibold tracking-wider text-white/40 uppercase'>
                      Signers
                    </h5>
                    <div className='space-y-2'>
                      {rule.signers && rule.signers.length > 0 ? (
                        rule.signers.map(
                          (signer: ContractSigner, sIdx: number) => {
                            const credId = getCredentialIdFromSigner(signer);
                            const isPasskey =
                              'tag' in signer && signer.tag === 'External';
                            const isActive = credId === activeCredentialId;
                            return (
                              <div
                                key={sIdx}
                                className='flex items-center gap-3 rounded-lg bg-white/3 p-3'
                              >
                                {isPasskey ? (
                                  <Fingerprint className='text-primary h-4 w-4' />
                                ) : (
                                  <Key className='text-primary h-4 w-4' />
                                )}
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-xs font-medium text-white'>
                                      {isPasskey ? 'Passkey' : 'Delegated'}
                                    </span>
                                    {isActive && (
                                      <span className='bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-medium'>
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className='font-mono text-xs text-white/40'>
                                    {credId
                                      ? `${credId.slice(0, 20)}...`
                                      : 'tag' in signer &&
                                          signer.tag === 'Delegated' &&
                                          signer.values
                                        ? `${String(signer.values[0]).slice(0, 8)}...${String(signer.values[0]).slice(-8)}`
                                        : 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <p className='text-xs text-white/30'>
                          No signers configured
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Policies */}
                  <div className='mb-4'>
                    <h5 className='mb-2 text-xs font-semibold tracking-wider text-white/40 uppercase'>
                      Policies
                    </h5>
                    {rule.policies && rule.policies.length > 0 ? (
                      <div className='space-y-2'>
                        {rule.policies.map((addr: string, pIdx: number) => (
                          <div key={pIdx} className='rounded-lg bg-white/3 p-3'>
                            <span className='font-mono text-xs text-white/50'>
                              {addr.slice(0, 8)}...
                              {addr.slice(-8)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs text-white/30'>
                        No policies attached
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 border-t border-white/5 pt-4'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleRemoveRule(rule.id)}
                      disabled={removingRuleId === rule.id}
                      className='gap-2 border-white/10 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    >
                      {removingRuleId === rule.id ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      ) : (
                        <Trash2 className='h-3 w-3' />
                      )}
                      Remove Rule
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div className='rounded-2xl border border-white/5 bg-white/2 p-5'>
        <h4 className='text-sm font-semibold text-white'>
          About Context Rules
        </h4>
        <ul className='mt-2 space-y-1 text-sm text-white/40'>
          <li>
            <strong className='text-white/60'>Default</strong> — General
            authorization for all operations.
          </li>
          <li>
            <strong className='text-white/60'>CallContract</strong> — Rules
            specific to calling a particular contract.
          </li>
          <li>
            <strong className='text-white/60'>CreateContract</strong> — Rules
            for deploying new contracts.
          </li>
          <li>
            Policies like <strong className='text-white/60'>Threshold</strong>,{' '}
            <strong className='text-white/60'>Spending Limit</strong>, and{' '}
            <strong className='text-white/60'>Weighted Threshold</strong> add
            additional constraints to each rule.
          </li>
        </ul>
      </div>

      {/* Context Rule Builder Modal */}
      <ContextRuleBuilder
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSuccess={handleBuilderSuccess}
        existingSigners={existingSigners}
        pendingCredentials={pendingCredentials}
        activeCredentialId={activeCredentialId}
      />
    </div>
  );
}
