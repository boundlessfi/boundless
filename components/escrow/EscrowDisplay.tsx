'use client';

import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { MultiReleaseMilestone } from '@trustless-work/escrow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/wallet-utils';

/**
 * Component to display all properties of a MultiReleaseEscrow
 * Shows the escrow data returned directly from sendTransaction
 */
export const EscrowDisplay = () => {
  const { contractId, escrow, clearEscrowData } = useEscrowContext();

  if (!contractId || !escrow) {
    return null;
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const getStellarViewerUrl = (contractId: string): string => {
    const network =
      process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ||
      process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
        ? 'public'
        : 'testnet';
    return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
  };

  const formatAmount = (amount: number): string => {
    // Assuming 7 decimals for USDC (10000000 = 1 USDC)
    return (amount / 10000000).toFixed(7);
  };

  return (
    <div className='space-y-6'>
      {/* Success Header */}
      <Card className='border-green-200 bg-green-50'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            <CardTitle className='text-green-800'>
              Escrow Initialized Successfully!
            </CardTitle>
          </div>
          <CardDescription className='text-green-700'>
            All escrow data returned from sendTransaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <p className='mb-1 text-sm font-medium text-gray-700'>
                Contract ID:
              </p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-gray-100 px-3 py-1.5 font-mono text-sm'>
                  {contractId}
                </code>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopyAddress(contractId)}
                  className='h-8 w-8 p-0'
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            </div>
            <a
              href={getStellarViewerUrl(contractId)}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
            >
              <ExternalLink className='h-4 w-4' />
              View on Stellar Viewer
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Escrow identification and description
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Engagement ID
            </label>
            <p className='mt-1 font-mono text-sm'>{escrow.engagementId}</p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>Title</label>
            <p className='mt-1 text-sm'>{escrow.title}</p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Description
            </label>
            <p className='mt-1 text-sm text-gray-700'>{escrow.description}</p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>Signer</label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.signer)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.signer)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Platform fee and balance details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Platform Fee
            </label>
            <p className='mt-1 text-sm'>{escrow.platformFee}%</p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>Balance</label>
            <p className='mt-1 font-mono text-sm'>
              {formatAmount(escrow.balance)} USDC
            </p>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Trustline Address
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.trustline.address)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.trustline.address)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Addresses assigned to different escrow roles
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Approver
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.roles.approver)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.roles.approver)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Service Provider
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.roles.serviceProvider)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.roles.serviceProvider)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Platform Address
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.roles.platformAddress)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.roles.platformAddress)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Release Signer
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.roles.releaseSigner)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.roles.releaseSigner)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-gray-500'>
              Dispute Resolver
            </label>
            <div className='mt-1 flex items-center gap-2'>
              <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                {formatAddress(escrow.roles.disputeResolver)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleCopyAddress(escrow.roles.disputeResolver)}
                className='h-6 w-6 p-0'
              >
                <Copy className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Multi-release milestones with amounts and receivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {escrow.milestones.map(
              (milestone: MultiReleaseMilestone, index: number) => (
                <div
                  key={index}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <Badge variant='outline' className='font-mono'>
                      Milestone {index + 1}
                    </Badge>
                    {milestone.flags?.approved && (
                      <Badge variant='default' className='bg-green-600'>
                        Approved
                      </Badge>
                    )}
                    {milestone.flags?.disputed && (
                      <Badge variant='destructive'>Disputed</Badge>
                    )}
                    {milestone.flags?.released && (
                      <Badge variant='default' className='bg-blue-600'>
                        Released
                      </Badge>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>
                        Description
                      </label>
                      <p className='mt-1 text-sm'>{milestone.description}</p>
                    </div>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>
                        Amount
                      </label>
                      <p className='mt-1 font-mono text-sm'>
                        {formatAmount(milestone.amount)} USDC
                      </p>
                    </div>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>
                        Receiver
                      </label>
                      <div className='mt-1 flex items-center gap-2'>
                        <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                          {formatAddress(milestone.receiver)}
                        </code>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleCopyAddress(milestone.receiver)}
                          className='h-6 w-6 p-0'
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                    {milestone.status && (
                      <div>
                        <label className='text-xs font-medium text-gray-500'>
                          Status
                        </label>
                        <p className='mt-1 text-sm'>{milestone.status}</p>
                      </div>
                    )}
                    {milestone.evidence && (
                      <div>
                        <label className='text-xs font-medium text-gray-500'>
                          Evidence
                        </label>
                        <p className='mt-1 text-sm text-gray-700'>
                          {milestone.evidence}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end'>
        <Button variant='outline' onClick={clearEscrowData}>
          Clear Escrow Data
        </Button>
      </div>
    </div>
  );
};
