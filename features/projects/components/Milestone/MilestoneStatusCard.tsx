'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface MilestoneStatusCardProps {
  status: string;
  evidence?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  submitted: {
    label: 'Submitted for Review',
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  'in-review': {
    label: 'Under Review',
    icon: AlertCircle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export function MilestoneStatusCard({
  status,
  evidence,
  submittedAt,
  approvedAt,
  rejectedAt,
}: MilestoneStatusCardProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Card className={`border-2 ${config.borderColor} bg-background-card`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span className='text-white'>Milestone Status</span>
          <Badge className={`${config.bgColor} ${config.color} border-0`}>
            <StatusIcon className='mr-1 h-4 w-4' />
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Status Timeline */}
        <div className='space-y-3'>
          {submittedAt && (
            <div className='flex items-start gap-3'>
              <div className='mt-1 h-2 w-2 rounded-full bg-blue-500' />
              <div>
                <p className='text-sm font-medium text-white'>
                  Submitted for Review
                </p>
                <p className='text-xs text-gray-400'>
                  {new Date(submittedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}

          {approvedAt && (
            <div className='flex items-start gap-3'>
              <div className='mt-1 h-2 w-2 rounded-full bg-green-500' />
              <div>
                <p className='text-sm font-medium text-white'>Approved</p>
                <p className='text-xs text-gray-400'>
                  {new Date(approvedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}

          {rejectedAt && (
            <div className='flex items-start gap-3'>
              <div className='mt-1 h-2 w-2 rounded-full bg-red-500' />
              <div>
                <p className='text-sm font-medium text-white'>Rejected</p>
                <p className='text-xs text-gray-400'>
                  {new Date(rejectedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Section */}
        {evidence && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-400'>
              Proof of Completion
            </h4>
            <div className='rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-4'>
              <p className='text-sm whitespace-pre-wrap text-white'>
                {evidence}
              </p>
            </div>
          </div>
        )}

        {/* Status-specific messages */}
        {status === 'pending' && (
          <div className='rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3'>
            <p className='text-xs text-yellow-200'>
              This milestone is awaiting work to begin. Check back later for
              updates.
            </p>
          </div>
        )}

        {status === 'in-progress' && (
          <div className='rounded-lg border border-blue-500/30 bg-blue-500/5 p-3'>
            <p className='text-xs text-blue-200'>
              The creator is currently working on this milestone.
            </p>
          </div>
        )}

        {status === 'in-review' && (
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/5 p-3'>
            <p className='text-xs text-purple-200'>
              This milestone submission is currently under review by the
              community.
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className='rounded-lg border border-red-500/30 bg-red-500/5 p-3'>
            <p className='text-xs text-red-200'>
              This milestone was rejected. The creator will need to resubmit
              with corrections.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
