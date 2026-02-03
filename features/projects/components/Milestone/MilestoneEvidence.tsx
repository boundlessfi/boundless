'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

interface MilestoneEvidenceProps {
  evidence: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    name?: string;
  }>;
}

export function MilestoneEvidence({
  evidence,
  attachments,
}: MilestoneEvidenceProps) {
  return (
    <Card className='bg-background-card border-gray-800'>
      <CardHeader>
        <CardTitle className='text-white'>Evidence & Proof of Work</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Text Evidence */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-400'>Description</h4>
          <div className='rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-4'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-white'>
              {evidence}
            </p>
          </div>
        </div>

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-gray-400'>Attachments</h4>
            <div className='grid gap-3'>
              {attachments.map((attachment, index) => (
                <AttachmentItem key={index} {...attachment} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttachmentItem({
  type,
  url,
  name,
}: {
  type: string;
  url: string;
  name?: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className='h-5 w-5' />;
      case 'video':
        return <Video className='h-5 w-5' />;
      case 'document':
        return <FileText className='h-5 w-5' />;
      case 'link':
        return <LinkIcon className='h-5 w-5' />;
      default:
        return <FileText className='h-5 w-5' />;
    }
  };

  if (type === 'image') {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='group relative overflow-hidden rounded-lg border border-[#2B2B2B]'
      >
        <Image
          src={url}
          alt={name || 'Evidence image'}
          width={400}
          height={300}
          className='h-48 w-full object-cover transition-transform group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
          <div className='flex h-full items-center justify-center'>
            <ExternalLink className='h-6 w-6 text-white' />
          </div>
        </div>
      </a>
    );
  }

  if (type === 'video') {
    return (
      <div className='overflow-hidden rounded-lg border border-[#2B2B2B]'>
        <video controls className='h-auto w-full'>
          <source src={url} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='hover:border-primary flex items-center gap-3 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-4 transition-colors hover:bg-[#1A1A1A]/80'
    >
      <div className='text-gray-400'>{getIcon()}</div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-white'>{name || 'Attachment'}</p>
        <p className='text-xs text-gray-400'>{type}</p>
      </div>
      <ExternalLink className='h-4 w-4 text-gray-400' />
    </a>
  );
}
