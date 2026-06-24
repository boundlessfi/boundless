'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, GitBranch } from 'lucide-react';

interface RepoLinksSectionProps {
  data: {
    githubUrl: string;
    gitlabUrl: string;
    bitbucketUrl: string;
  };
  onChange: (field: string, value: string) => void;
}

export function RepoLinksSection({ data, onChange }: RepoLinksSectionProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {/* GitHub */}
      <div className='space-y-2'>
        <Label
          htmlFor='githubUrl'
          className='flex items-center gap-2 text-white'
        >
          <Github className='h-4 w-4' />
          GitHub URL <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='githubUrl'
          value={data.githubUrl}
          onChange={e => onChange('githubUrl', e.target.value)}
          placeholder='Link to GitHub repo or profile'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>

      {/* GitLab */}
      <div className='space-y-2'>
        <Label
          htmlFor='gitlabUrl'
          className='flex items-center gap-2 text-white'
        >
          <GitBranch className='h-4 w-4' />
          GitLab URL (Optional)
        </Label>
        <Input
          id='gitlabUrl'
          value={data.gitlabUrl}
          onChange={e => onChange('gitlabUrl', e.target.value)}
          placeholder='Link to GitLab repo'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>

      {/* Bitbucket */}
      <div className='space-y-2'>
        <Label
          htmlFor='bitbucketUrl'
          className='flex items-center gap-2 text-white'
        >
          <GitBranch className='h-4 w-4' />
          Bitbucket URL (Optional)
        </Label>
        <Input
          id='bitbucketUrl'
          value={data.bitbucketUrl}
          onChange={e => onChange('bitbucketUrl', e.target.value)}
          placeholder='Link to Bitbucket repo'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>
    </div>
  );
}
