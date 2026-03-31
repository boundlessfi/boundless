'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Plus, X, Fingerprint, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  addContextRule,
  createCredential,
  createDelegatedSigner,
  createWebAuthnSigner,
  getCredentialIdFromSigner,
  LEDGERS_PER_DAY,
  type ContractSigner,
  type ContextRule,
  type PolicyParams,
  type ContextTypeOption,
  type StoredCredential,
} from '@/lib/smart-wallet/client';
import {
  knownPolicies,
  webauthnVerifierAddress,
  type PolicyInfo,
} from '@/lib/smart-wallet/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignerEntry = {
  id: string;
  type: 'passkey' | 'delegated';
  address?: string;
  credentialId?: string;
  publicKey?: Uint8Array;
  label: string;
  /** Pre-built signer object (for existing signers) */
  signer?: ContractSigner;
};

type SelectedPolicy = {
  policy: PolicyInfo;
  threshold?: number;
  spendingLimit?: string;
  spendingPeriodDays?: number;
  weightedThreshold?: number;
};

type SignerAddMode = 'new_passkey' | 'g_address';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContextRuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Existing signers on the smart wallet (for "existing" tab) */
  existingSigners?: ContractSigner[];
  /** Pending credentials from storage */
  pendingCredentials?: StoredCredential[];
  /** Active credential ID (to label active signer) */
  activeCredentialId?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContextRuleBuilder({
  isOpen,
  onClose,
  onSuccess,
  existingSigners = [],
  pendingCredentials = [],
  activeCredentialId,
}: ContextRuleBuilderProps) {
  // Form state
  const [name, setName] = useState('');
  const [contextType, setContextType] = useState<ContextTypeOption>('default');
  const [contractAddress, setContractAddress] = useState('');
  const [wasmHash, setWasmHash] = useState('');
  const [signers, setSigners] = useState<SignerEntry[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<SelectedPolicy[]>(
    []
  );
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(30);

  // Signer add state
  const [addMode, setAddMode] = useState<SignerAddMode>('new_passkey');
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [gAddress, setGAddress] = useState('');
  const [addingPasskey, setAddingPasskey] = useState(false);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Existing signer helpers
  // -------------------------------------------------------------------------

  const isSignerAlreadyAdded = useCallback(
    (signer: ContractSigner): boolean => {
      const credId = getCredentialIdFromSigner(signer);
      if (credId) return signers.some(s => s.credentialId === credId);
      if ('tag' in signer && signer.tag === 'Delegated' && signer.values) {
        const addr = String(signer.values[0]);
        return signers.some(s => s.address === addr);
      }
      return false;
    },
    [signers]
  );

  const handleAddExistingSigner = (signer: ContractSigner) => {
    if (isSignerAlreadyAdded(signer)) return;

    const credId = getCredentialIdFromSigner(signer);
    const isDelegated = 'tag' in signer && signer.tag === 'Delegated';
    const addr = isDelegated ? String(signer.values?.[0]) : undefined;

    setSigners(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: isDelegated ? 'delegated' : 'passkey',
        credentialId: credId ?? undefined,
        address: addr,
        label: credId
          ? `Passkey: ${credId.slice(0, 12)}...${credId === activeCredentialId ? ' (active)' : ''}`
          : addr
            ? `${addr.slice(0, 8)}...${addr.slice(-8)}`
            : 'Unknown',
        signer,
      },
    ]);
  };

  const handleAddPendingCredential = (cred: StoredCredential) => {
    if (signers.some(s => s.credentialId === cred.credentialId)) return;

    setSigners(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'passkey',
        credentialId: cred.credentialId,
        publicKey: cred.publicKey,
        label: cred.nickname || `Passkey: ${cred.credentialId.slice(0, 12)}...`,
      },
    ]);
  };

  // -------------------------------------------------------------------------
  // New signer creation
  // -------------------------------------------------------------------------

  const handleCreatePasskey = async () => {
    setAddingPasskey(true);
    setError(null);
    try {
      const label = newPasskeyName.trim() || `Signer ${signers.length + 1}`;
      const credential = await createCredential(label);

      setSigners(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: 'passkey',
          credentialId: credential.credentialId,
          publicKey: credential.publicKey,
          label,
        },
      ]);
      setNewPasskeyName('');
      toast.success(`Created passkey: ${label}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create passkey';
      setError(msg);
      toast.error(msg);
    } finally {
      setAddingPasskey(false);
    }
  };

  const handleAddGAddress = () => {
    const address = gAddress.trim();
    if (!address.startsWith('G') || address.length !== 56) {
      setError('Invalid Stellar G-address');
      return;
    }
    if (signers.some(s => s.address === address)) {
      setError('This address is already added');
      return;
    }
    setSigners(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'delegated',
        address,
        label: `${address.slice(0, 8)}...${address.slice(-8)}`,
      },
    ]);
    setGAddress('');
    setError(null);
  };

  const handleRemoveSigner = (id: string) => {
    setSigners(prev => prev.filter(s => s.id !== id));
  };

  // -------------------------------------------------------------------------
  // Policy management
  // -------------------------------------------------------------------------

  const addPolicy = (policy: PolicyInfo) => {
    if (selectedPolicies.some(sp => sp.policy.address === policy.address))
      return;
    setSelectedPolicies(prev => [
      ...prev,
      {
        policy,
        threshold: 1,
        spendingLimit: '1000',
        spendingPeriodDays: 1,
        weightedThreshold: 1,
      },
    ]);
  };

  const removePolicy = (index: number) => {
    setSelectedPolicies(prev => prev.filter((_, i) => i !== index));
  };

  const updatePolicy = (index: number, updates: Partial<SelectedPolicy>) => {
    setSelectedPolicies(prev =>
      prev.map((sp, i) => (i === index ? { ...sp, ...updates } : sp))
    );
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Rule name is required');
      return;
    }
    if (signers.length === 0 && selectedPolicies.length === 0) {
      setError('At least one signer or policy is required');
      return;
    }
    if (contextType === 'call_contract') {
      if (!contractAddress.startsWith('C') || contractAddress.length !== 56) {
        setError('Invalid contract address');
        return;
      }
    }
    if (contextType === 'create_contract') {
      const clean = wasmHash.startsWith('0x') ? wasmHash.slice(2) : wasmHash;
      if (clean.length !== 64 || !/^[0-9a-fA-F]+$/.test(clean)) {
        setError('Invalid WASM hash (must be 64 hex chars)');
        return;
      }
    }

    // Validate threshold
    const thresholdPolicies = selectedPolicies.filter(
      p => p.policy.type === 'threshold'
    );
    for (const tp of thresholdPolicies) {
      if ((tp.threshold || 1) > signers.length) {
        setError(
          `Threshold (${tp.threshold}) cannot exceed number of signers (${signers.length})`
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Build signer objects
      const builtSigners: ContractSigner[] = signers.map(entry => {
        if (entry.signer) return entry.signer;
        if (entry.type === 'delegated' && entry.address) {
          return createDelegatedSigner(entry.address);
        }
        if (entry.type === 'passkey' && entry.publicKey && entry.credentialId) {
          return createWebAuthnSigner(
            webauthnVerifierAddress,
            entry.publicKey,
            entry.credentialId
          );
        }
        throw new Error(`Cannot build signer for entry: ${entry.label}`);
      });

      // Build policy params
      const policyParams: PolicyParams[] = selectedPolicies.map(sp => ({
        policy: sp.policy,
        threshold: sp.threshold,
        spendingLimit: sp.spendingLimit,
        spendingPeriodDays: sp.spendingPeriodDays,
        weightedThreshold: sp.weightedThreshold,
      }));

      const result = await addContextRule({
        name: name.trim(),
        contextType,
        contractAddress:
          contextType === 'call_contract' ? contractAddress : undefined,
        wasmHash: contextType === 'create_contract' ? wasmHash : undefined,
        signers: builtSigners,
        policies: policyParams,
        validUntilLedgers: hasExpiration
          ? expirationDays * LEDGERS_PER_DAY
          : undefined,
      });

      if (result.success) {
        toast.success(`Context rule "${name}" created!`);
        resetForm();
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create rule');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create rule';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setContextType('default');
    setContractAddress('');
    setWasmHash('');
    setSigners([]);
    setSelectedPolicies([]);
    setHasExpiration(false);
    setExpirationDays(30);
    setError(null);
  };

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const availableExistingSigners = existingSigners.filter(
    s => !isSignerAlreadyAdded(s)
  );
  const availablePendingCredentials = pendingCredentials.filter(
    cred => !signers.some(s => s.credentialId === cred.credentialId)
  );
  const unselectedPolicies = knownPolicies.filter(
    p => !selectedPolicies.some(sp => sp.policy.address === p.address)
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a0a0a] text-white sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Context Rule</DialogTitle>
        </DialogHeader>

        {error && (
          <div className='flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            {error}
          </div>
        )}

        {/* Rule Name */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-white/70'>
            Rule Name *
          </label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g., Primary Signers, Daily Spending'
            className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
          />
        </div>

        {/* Context Type */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-white/70'>
            Context Type
          </label>
          <div className='flex gap-2'>
            {(
              [
                ['default', 'Default'],
                ['call_contract', 'Call Contract'],
                ['create_contract', 'Create Contract'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setContextType(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  contextType === value
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {contextType === 'call_contract' && (
            <Input
              value={contractAddress}
              onChange={e => setContractAddress(e.target.value)}
              placeholder='Contract address (C...)'
              className='mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
          )}
          {contextType === 'create_contract' && (
            <Input
              value={wasmHash}
              onChange={e => setWasmHash(e.target.value)}
              placeholder='WASM hash (64 hex chars)'
              className='mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/30'
            />
          )}
        </div>

        {/* Signers */}
        <div className='space-y-3'>
          <label className='text-sm font-medium text-white/70'>Signers</label>

          {/* Current signers list */}
          {signers.length > 0 && (
            <div className='space-y-2'>
              {signers.map(signer => (
                <div
                  key={signer.id}
                  className='flex items-center justify-between rounded-lg bg-white/5 px-3 py-2'
                >
                  <div className='flex items-center gap-2'>
                    {signer.type === 'passkey' ? (
                      <Fingerprint className='text-primary h-4 w-4' />
                    ) : (
                      <Key className='text-primary h-4 w-4' />
                    )}
                    <span className='text-xs text-white/70'>
                      {signer.label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSigner(signer.id)}
                    className='rounded p-1 text-white/30 hover:bg-white/10 hover:text-red-400'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing signers from on-chain */}
          {availableExistingSigners.length > 0 && (
            <div className='space-y-1'>
              <p className='text-xs text-white/40'>Add existing signer:</p>
              <div className='flex flex-wrap gap-1'>
                {availableExistingSigners.map((signer, idx) => {
                  const credId = getCredentialIdFromSigner(signer);
                  const isDelegated =
                    'tag' in signer && signer.tag === 'Delegated';
                  const display = credId
                    ? `Passkey: ${credId.slice(0, 8)}...`
                    : isDelegated
                      ? `${String(signer.values?.[0]).slice(0, 8)}...`
                      : 'Unknown';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAddExistingSigner(signer)}
                      className='rounded-md bg-white/5 px-2 py-1 text-xs text-white/60 hover:bg-white/10'
                    >
                      + {display}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending credentials */}
          {availablePendingCredentials.length > 0 && (
            <div className='space-y-1'>
              <p className='text-xs text-white/40'>Add pending passkey:</p>
              <div className='flex flex-wrap gap-1'>
                {availablePendingCredentials.map(cred => (
                  <button
                    key={cred.credentialId}
                    onClick={() => handleAddPendingCredential(cred)}
                    className='rounded-md bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/20'
                  >
                    + {cred.nickname || cred.credentialId.slice(0, 8)}...
                    (pending)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add new signer */}
          <div className='rounded-lg border border-white/5 bg-white/2 p-3'>
            <div className='mb-2 flex gap-2'>
              <button
                onClick={() => setAddMode('new_passkey')}
                className={`rounded px-2 py-1 text-xs ${
                  addMode === 'new_passkey'
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                New Passkey
              </button>
              <button
                onClick={() => setAddMode('g_address')}
                className={`rounded px-2 py-1 text-xs ${
                  addMode === 'g_address'
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-white/50'
                }`}
              >
                G-Address
              </button>
            </div>

            {addMode === 'new_passkey' && (
              <div className='flex gap-2'>
                <Input
                  value={newPasskeyName}
                  onChange={e => setNewPasskeyName(e.target.value)}
                  placeholder='Passkey name (optional)'
                  disabled={addingPasskey}
                  className='border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30'
                />
                <Button
                  size='sm'
                  onClick={handleCreatePasskey}
                  disabled={addingPasskey}
                  className='bg-primary hover:bg-primary/90 text-black'
                >
                  {addingPasskey ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            )}

            {addMode === 'g_address' && (
              <div className='flex gap-2'>
                <Input
                  value={gAddress}
                  onChange={e => setGAddress(e.target.value)}
                  placeholder='Stellar address (G...)'
                  className='border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30'
                />
                <Button
                  size='sm'
                  onClick={handleAddGAddress}
                  disabled={!gAddress.trim()}
                  className='bg-primary hover:bg-primary/90 text-black'
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Policies */}
        <div className='space-y-3'>
          <label className='text-sm font-medium text-white/70'>
            Policies (Optional)
          </label>

          {/* Selected policies */}
          {selectedPolicies.map((sp, index) => (
            <div
              key={sp.policy.address}
              className='rounded-lg border border-white/5 bg-white/2 p-3'
            >
              <div className='mb-2 flex items-center justify-between'>
                <div>
                  <span className='text-xs font-semibold text-white'>
                    {sp.policy.name}
                  </span>
                  <span className='ml-2 text-xs text-white/30'>
                    {sp.policy.type}
                  </span>
                </div>
                <button
                  onClick={() => removePolicy(index)}
                  className='rounded p-1 text-white/30 hover:bg-white/10 hover:text-red-400'
                >
                  <X className='h-3 w-3' />
                </button>
              </div>

              {/* Threshold params */}
              {sp.policy.type === 'threshold' && (
                <div className='flex items-center gap-2 text-xs text-white/60'>
                  <span>Required signatures:</span>
                  <Input
                    type='number'
                    min={1}
                    max={signers.length || 15}
                    value={sp.threshold || 1}
                    onChange={e =>
                      updatePolicy(index, {
                        threshold: parseInt(e.target.value) || 1,
                      })
                    }
                    className='h-7 w-16 border-white/10 bg-white/5 text-center text-xs text-white'
                  />
                  <span>of {signers.length} signers</span>
                </div>
              )}

              {/* Spending limit params */}
              {sp.policy.type === 'spending_limit' && (
                <div className='flex flex-wrap items-center gap-2 text-xs text-white/60'>
                  <span>Max:</span>
                  <Input
                    type='text'
                    value={sp.spendingLimit || '1000'}
                    onChange={e =>
                      updatePolicy(index, { spendingLimit: e.target.value })
                    }
                    className='h-7 w-24 border-white/10 bg-white/5 text-center text-xs text-white'
                  />
                  <span>XLM per</span>
                  <Input
                    type='number'
                    min={1}
                    value={sp.spendingPeriodDays || 1}
                    onChange={e =>
                      updatePolicy(index, {
                        spendingPeriodDays: parseInt(e.target.value) || 1,
                      })
                    }
                    className='h-7 w-16 border-white/10 bg-white/5 text-center text-xs text-white'
                  />
                  <span>day(s)</span>
                </div>
              )}

              {/* Weighted threshold params */}
              {sp.policy.type === 'weighted_threshold' && (
                <div className='flex items-center gap-2 text-xs text-white/60'>
                  <span>Required weight:</span>
                  <Input
                    type='number'
                    min={1}
                    value={sp.weightedThreshold || 1}
                    onChange={e =>
                      updatePolicy(index, {
                        weightedThreshold: parseInt(e.target.value) || 1,
                      })
                    }
                    className='h-7 w-16 border-white/10 bg-white/5 text-center text-xs text-white'
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add policy */}
          {unselectedPolicies.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {unselectedPolicies.map(policy => (
                <button
                  key={policy.address}
                  onClick={() => addPolicy(policy)}
                  className='flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/50 hover:bg-white/10'
                >
                  <Plus className='h-3 w-3' />
                  {policy.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expiration */}
        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={hasExpiration}
              onChange={e => setHasExpiration(e.target.checked)}
              className='rounded border-white/20'
            />
            <span className='text-white/70'>Set expiration</span>
          </label>
          {hasExpiration && (
            <div className='flex items-center gap-2 text-xs text-white/60'>
              <span>Expires in:</span>
              <Input
                type='number'
                min={1}
                value={expirationDays}
                onChange={e => setExpirationDays(parseInt(e.target.value) || 1)}
                className='h-7 w-20 border-white/10 bg-white/5 text-center text-xs text-white'
              />
              <span>days</span>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading}
            className='border-white/10 bg-transparent text-white hover:bg-white/5'
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className='bg-primary hover:bg-primary/90 text-black'
          >
            {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
