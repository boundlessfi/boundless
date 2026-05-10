'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Mail,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  invitePartner,
  listContributions,
  cancelPartnerInvite,
  type PartnerContributionWithAllocation,
  type PartnerContributionStatus,
} from '@/lib/api/hackathons/partners';
import { extractApiErrorMessage } from '@/lib/api/api';
import { reportError } from '@/lib/error-reporting';
import AllocateContributionModal from './AllocateContributionModal';

interface PartnersSettingsTabProps {
  organizationId: string;
  hackathonId: string;
}

const STATUS_LABEL: Record<PartnerContributionStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
};

const STATUS_VARIANT: Record<
  PartnerContributionStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  FAILED: 'destructive',
  REFUNDED: 'outline',
  CANCELLED: 'outline',
};

const formatAmount = (raw: string | number) => {
  const value = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (Number.isNaN(value)) return raw.toString();
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const buildContributeUrl = (token: string) => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/partners/contribute/${token}`;
};

export default function PartnersSettingsTab({
  organizationId,
  hackathonId,
}: PartnersSettingsTabProps) {
  const [contributions, setContributions] = useState<
    PartnerContributionWithAllocation[]
  >([]);
  const [unallocatedTotal, setUnallocatedTotal] = useState<string>('0');
  const [allocateTarget, setAllocateTarget] =
    useState<PartnerContributionWithAllocation | null>(null);
  const [summary, setSummary] = useState<
    Record<string, { total: string; count: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogo, setPartnerLogo] = useState('');
  const [partnerLink, setPartnerLink] = useState('');
  const [pledgedAmount, setPledgedAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showPublicly, setShowPublicly] = useState(true);

  const resetForm = () => {
    setPartnerEmail('');
    setPartnerName('');
    setPartnerLogo('');
    setPartnerLink('');
    setPledgedAmount('');
    setMessage('');
    setShowPublicly(true);
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listContributions(organizationId, hackathonId, {
        limit: 100,
      });
      setContributions(res.data?.items ?? []);
      setSummary(res.data?.summary ?? {});
      setUnallocatedTotal(res.data?.unallocatedBonusTotal ?? '0');
    } catch (err) {
      reportError(err, { context: 'partner-contributions-list' });
      toast.error(
        extractApiErrorMessage(err, 'Failed to load partner contributions')
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, hackathonId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(pledgedAmount);
    if (!partnerEmail.trim() || !partnerName.trim()) {
      toast.error('Partner email and name are required');
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Pledged amount must be greater than zero');
      return;
    }

    try {
      setSubmitting(true);
      await invitePartner(organizationId, hackathonId, {
        partnerEmail: partnerEmail.trim(),
        partnerName: partnerName.trim(),
        partnerLogo: partnerLogo.trim() || undefined,
        partnerLink: partnerLink.trim() || undefined,
        pledgedAmount: amount,
        message: message.trim() || undefined,
        showPublicly,
      });
      toast.success('Partner invitation sent');
      setOpen(false);
      resetForm();
      await refresh();
    } catch (err: unknown) {
      reportError(err, { context: 'partner-invite' });
      toast.error(
        extractApiErrorMessage(err, 'Failed to send partner invitation')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (contributionId: string) => {
    if (
      !confirm(
        'Cancel this pending invitation? The partner will no longer be able to contribute via this link.'
      )
    ) {
      return;
    }
    try {
      await cancelPartnerInvite(organizationId, hackathonId, contributionId);
      toast.success('Invitation cancelled');
      await refresh();
    } catch (err) {
      reportError(err, { context: 'partner-invite-cancel' });
      toast.error(extractApiErrorMessage(err, 'Failed to cancel invitation'));
    }
  };

  const handleCopy = async (contributionId: string, token: string) => {
    const url = buildContributeUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(contributionId);
      toast.success('Contribution link copied');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const totalConfirmed = summary.CONFIRMED?.total
    ? parseFloat(summary.CONFIRMED.total)
    : 0;
  const totalPending = summary.PENDING?.total
    ? parseFloat(summary.PENDING.total)
    : 0;

  return (
    <div className='bg-background-card space-y-6 rounded-xl border border-gray-900 p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold text-white'>
            Partner Contributions
          </h2>
          <p className='mt-1 text-sm text-gray-400'>
            Invite partners to contribute USDC directly into the hackathon prize
            pool.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Invite partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Invite a partner</DialogTitle>
                <DialogDescription>
                  We&apos;ll email the partner a unique link. They&apos;ll
                  connect a wallet and contribute the pledged amount in USDC
                  directly into the prize pool.
                </DialogDescription>
              </DialogHeader>

              <div className='mt-4 space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='partner-name'>Partner name</Label>
                    <Input
                      id='partner-name'
                      value={partnerName}
                      onChange={e => setPartnerName(e.target.value)}
                      placeholder='Acme Corp'
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='partner-email'>Partner email</Label>
                    <Input
                      id='partner-email'
                      type='email'
                      value={partnerEmail}
                      onChange={e => setPartnerEmail(e.target.value)}
                      placeholder='sponsor@acme.io'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='pledged-amount'>Pledged amount (USDC)</Label>
                  <Input
                    id='pledged-amount'
                    type='number'
                    inputMode='decimal'
                    min='0.01'
                    step='0.01'
                    value={pledgedAmount}
                    onChange={e => setPledgedAmount(e.target.value)}
                    placeholder='1000'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='partner-logo'>Logo URL (optional)</Label>
                    <Input
                      id='partner-logo'
                      type='url'
                      value={partnerLogo}
                      onChange={e => setPartnerLogo(e.target.value)}
                      placeholder='https://...'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='partner-link'>Website (optional)</Label>
                    <Input
                      id='partner-link'
                      type='url'
                      value={partnerLink}
                      onChange={e => setPartnerLink(e.target.value)}
                      placeholder='https://acme.io'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='partner-message'>
                    Message to partner (optional)
                  </Label>
                  <Textarea
                    id='partner-message'
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder='Thanks for sponsoring our hackathon...'
                  />
                </div>

                <div className='flex items-center justify-between rounded-lg border border-gray-800 p-3'>
                  <div>
                    <Label
                      htmlFor='show-publicly'
                      className='text-sm text-white'
                    >
                      Show on public hackathon page
                    </Label>
                    <p className='text-xs text-gray-400'>
                      Display partner name and logo in the Sponsors section once
                      confirmed.
                    </p>
                  </div>
                  <Switch
                    id='show-publicly'
                    checked={showPublicly}
                    onCheckedChange={setShowPublicly}
                  />
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending invite...
                    </>
                  ) : (
                    <>
                      <Mail className='mr-2 h-4 w-4' />
                      Send invite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <SummaryCard
          label='Confirmed contributions'
          value={`${formatAmount(totalConfirmed)} USDC`}
          sub={`${summary.CONFIRMED?.count || 0} partners`}
        />
        <SummaryCard
          label='Pending pledges'
          value={`${formatAmount(totalPending)} USDC`}
          sub={`${summary.PENDING?.count || 0} invitations`}
        />
        <SummaryCard
          label='Total invited'
          value={`${contributions.length}`}
          sub='all-time'
        />
      </div>

      {parseFloat(unallocatedTotal) > 0 && (
        <div className='flex items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10'>
            <span className='h-2 w-2 animate-pulse rounded-full bg-amber-400' />
          </div>
          <div className='flex-1'>
            <div className='text-sm font-semibold text-amber-200'>
              {formatAmount(unallocatedTotal)} USDC awaiting allocation
            </div>
            <div className='mt-0.5 text-xs text-amber-200/70'>
              You must allocate every confirmed contribution into prize tiers
              before winners can be announced.
            </div>
          </div>
        </div>
      )}

      <div className='overflow-hidden rounded-lg border border-gray-900'>
        <Table>
          <TableHeader>
            <TableRow className='border-gray-900'>
              <TableHead>Partner</TableHead>
              <TableHead>Pledged</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='py-12 text-center text-gray-400'
                >
                  <Loader2 className='mx-auto h-5 w-5 animate-spin' />
                </TableCell>
              </TableRow>
            ) : contributions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='py-12 text-center text-gray-400'
                >
                  No partners invited yet. Send your first invitation to start
                  building the prize pool.
                </TableCell>
              </TableRow>
            ) : (
              contributions.map(c => (
                <TableRow key={c.id} className='border-gray-900'>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      {c.partnerLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.partnerLogo}
                          alt={c.partnerName}
                          className='h-8 w-8 rounded object-contain'
                        />
                      ) : (
                        <div className='flex h-8 w-8 items-center justify-center rounded bg-gray-800 text-xs text-gray-400'>
                          {c.partnerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className='font-medium text-white'>
                          {c.partnerName}
                        </div>
                        <div className='text-xs text-gray-400'>
                          {c.partnerEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-sm text-white'>
                    {formatAmount(c.pledgedAmount)} {c.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AllocationCell contribution={c} currency={c.currency} />
                  </TableCell>
                  <TableCell className='text-sm text-gray-400'>
                    {new Date(c.invitedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      {c.status === 'PENDING' && (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleCopy(c.id, c.inviteToken)}
                            title='Copy contribution link'
                          >
                            {copiedId === c.id ? (
                              <Check className='h-4 w-4 text-green-500' />
                            ) : (
                              <Copy className='h-4 w-4' />
                            )}
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleCancel(c.id)}
                            title='Cancel invitation'
                          >
                            <Trash2 className='h-4 w-4 text-red-400' />
                          </Button>
                        </>
                      )}
                      {c.status === 'CONFIRMED' && (
                        <Button
                          variant={
                            c.allocationSummary?.requiresAllocation
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => setAllocateTarget(c)}
                        >
                          {c.allocationSummary?.requiresAllocation
                            ? 'Allocate'
                            : 'Manage'}
                        </Button>
                      )}
                      {c.txHash && (
                        <Button
                          variant='ghost'
                          size='sm'
                          asChild
                          title='View transaction'
                        >
                          <a
                            href={`https://stellar.expert/explorer/public/tx/${c.txHash}`}
                            target='_blank'
                            rel='noreferrer'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {allocateTarget && (
        <AllocateContributionModal
          open={!!allocateTarget}
          onOpenChange={open => !open && setAllocateTarget(null)}
          organizationId={organizationId}
          hackathonId={hackathonId}
          contribution={allocateTarget}
          onAllocated={() => {
            void refresh();
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className='rounded-lg border border-gray-900 bg-gray-950/40 p-4'>
      <div className='text-xs tracking-wide text-gray-400 uppercase'>
        {label}
      </div>
      <div className='mt-1 text-2xl font-semibold text-white'>{value}</div>
      <div className='text-xs text-gray-500'>{sub}</div>
    </div>
  );
}

function AllocationCell({
  contribution,
  currency,
}: {
  contribution: PartnerContributionWithAllocation;
  currency: string;
}) {
  if (contribution.status !== 'CONFIRMED') {
    return <span className='text-xs text-gray-600'>—</span>;
  }
  const summary = contribution.allocationSummary;
  if (!summary) {
    return <span className='text-xs text-gray-600'>—</span>;
  }

  const allocatable = parseFloat(summary.allocatableAmount);
  const allocated = parseFloat(summary.allocatedAmount);
  const pct =
    allocatable > 0 ? Math.min(100, (allocated / allocatable) * 100) : 0;

  if (summary.isFullyAllocated) {
    return (
      <div className='space-y-1'>
        <Badge className='bg-emerald-400/10 text-[10px] text-emerald-400 hover:bg-emerald-400/15'>
          Fully allocated
        </Badge>
        <div className='font-mono text-[11px] text-gray-500'>
          {formatAmount(summary.allocatedAmount)} /{' '}
          {formatAmount(summary.allocatableAmount)} {currency}
        </div>
      </div>
    );
  }

  if (summary.requiresAllocation && allocated === 0) {
    return (
      <div className='space-y-1'>
        <Badge className='bg-amber-400/10 text-[10px] text-amber-300 hover:bg-amber-400/15'>
          Awaiting allocation
        </Badge>
        <div className='font-mono text-[11px] text-gray-500'>
          0 / {formatAmount(summary.allocatableAmount)} {currency}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-1'>
      <Badge className='bg-amber-400/10 text-[10px] text-amber-300 hover:bg-amber-400/15'>
        Partial · {pct.toFixed(0)}%
      </Badge>
      <div className='font-mono text-[11px] text-gray-500'>
        {formatAmount(summary.allocatedAmount)} /{' '}
        {formatAmount(summary.allocatableAmount)} {currency}
      </div>
    </div>
  );
}
