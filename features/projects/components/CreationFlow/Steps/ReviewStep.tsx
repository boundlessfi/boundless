'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Rocket,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ProjectDraft,
  CreationStep,
} from '../../../hooks/use-project-creation';

interface ReviewStepProps {
  formData: Partial<ProjectDraft>;
  onNavigate: (step: CreationStep) => void;
}

export default function ReviewStep({ formData, onNavigate }: ReviewStepProps) {
  const isFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some(v => isFilled(v));
    }
    if (typeof value === 'number') return true;
    return true;
  };

  interface ReviewField {
    label: string;
    value: any;
    required: boolean;
    customLabel?: string | null;
  }

  interface ReviewSection {
    title: string;
    step: CreationStep;
    fields: ReviewField[];
  }

  const sections: ReviewSection[] = [
    {
      title: 'Basic Information',
      step: 'basic' as CreationStep,
      fields: [
        { label: 'Project Name', value: formData.projectName, required: true },
        { label: 'Tagline', value: formData.tagline, required: true },
        { label: 'Category', value: formData.category, required: true },
        {
          label: 'Logo',
          value: formData.logoUrl || formData.logo,
          required: true,
        },
        {
          label: 'Banner',
          value: formData.bannerUrl || formData.banner,
          required: false,
        },
        {
          label: 'Repository',
          value:
            formData.githubUrl || formData.gitlabUrl || formData.bitbucketUrl,
          required: false,
          customLabel: formData.githubUrl
            ? 'GitHub'
            : formData.gitlabUrl
              ? 'GitLab'
              : formData.bitbucketUrl
                ? 'Bitbucket'
                : null,
        },
        {
          label: 'Tags',
          value: formData.tags,
          required: false,
          customLabel: `${formData.tags?.length || 0} tags`,
        },
      ],
    },
    {
      title: 'Project Details',
      step: 'details' as CreationStep,
      fields: [
        { label: 'Description', value: formData.description, required: true },
        { label: 'Vision', value: formData.vision, required: true },
        { label: 'Summary', value: formData.summary, required: true },
        { label: 'Website', value: formData.websiteUrl, required: false },
        { label: 'Demo Video', value: formData.demoVideoUrl, required: false },
      ],
    },
    {
      title: 'Team',
      step: 'team' as CreationStep,
      fields: [
        {
          label: 'Team Members',
          value: formData.team,
          required: false,
          customLabel: `${formData.team?.length || 0} members`,
        },
      ],
    },
    {
      title: 'Contact',
      step: 'social' as CreationStep,
      fields: [
        { label: 'Email', value: formData.contact?.email, required: true },
        {
          label: 'Telegram',
          value: formData.contact?.telegram,
          required: true,
        },
        {
          label: 'Backup Contact',
          value: formData.contact?.discord || formData.contact?.backup,
          required: false,
        },
      ],
    },
  ];

  if (formData.isCampaign) {
    sections.push({
      title: 'Funding & Milestones',
      step: 'funding' as CreationStep,
      fields: [
        {
          label: 'Funding Goal',
          value:
            formData.fundingAmount && formData.fundingAmount > 0
              ? formData.fundingAmount
              : null,
          required: true,
          customLabel: formData.fundingAmount
            ? `${formData.fundingAmount} USDC`
            : null,
        },
        {
          label: 'Milestones',
          value: formData.milestones,
          required: true,
          customLabel: `${formData.milestones?.length || 0} milestones`,
        },
      ],
    });
  }

  const allFields = sections.flatMap(s => s.fields);
  const requiredFields = allFields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => isFilled(f.value));
  const allFilled = allFields.filter(f => isFilled(f.value));
  const isReady = filledRequired.length === requiredFields.length;
  const completionPct =
    requiredFields.length > 0
      ? Math.round((filledRequired.length / requiredFields.length) * 100)
      : 100;

  return (
    <div className='flex flex-col gap-8 sm:gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Review & Submit
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          Double-check everything before publishing.
        </p>
      </div>

      {/* Completion summary */}
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border p-4 text-center sm:flex-row sm:gap-4 sm:text-left',
          isReady
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-amber-500/20 bg-amber-500/5'
        )}
      >
        {/* Progress ring */}
        <div className='relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12'>
          <svg
            className='h-10 w-10 -rotate-90 sm:h-12 sm:w-12'
            viewBox='0 0 48 48'
          >
            <circle
              cx='24'
              cy='24'
              r='20'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              className='text-white/5'
            />
            <circle
              cx='24'
              cy='24'
              r='20'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeDasharray={`${completionPct * 1.257} 125.7`}
              strokeLinecap='round'
              className={isReady ? 'text-emerald-400' : 'text-amber-400'}
            />
          </svg>
          <span
            className={cn(
              'absolute text-[11px] font-semibold',
              isReady ? 'text-emerald-400' : 'text-amber-400'
            )}
          >
            {completionPct}%
          </span>
        </div>
        <div className='flex flex-col gap-0.5'>
          <p
            className={cn(
              'text-sm font-medium',
              isReady ? 'text-emerald-300' : 'text-amber-300'
            )}
          >
            {isReady
              ? 'All required fields complete!'
              : `${requiredFields.length - filledRequired.length} required field${requiredFields.length - filledRequired.length !== 1 ? 's' : ''} missing`}
          </p>
          <p className='text-xs text-white/30'>
            {allFilled.length} of {allFields.length} total fields filled
          </p>
        </div>
      </div>

      {/* Section cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {sections.map(section => {
          const sectionFilled = section.fields.filter(f => isFilled(f.value));
          const sectionRequired = section.fields.filter(f => f.required);
          const sectionComplete =
            sectionRequired.length === 0 ||
            sectionRequired.every(f => isFilled(f.value));

          return (
            <div
              key={section.title}
              className='group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/2 p-3.5 transition-colors hover:border-white/15 sm:p-5'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-white'>
                  {section.title}
                </h3>
                <button
                  onClick={() => onNavigate(section.step)}
                  className='text-primary flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 hover:underline'
                >
                  Edit <ArrowRight className='h-3 w-3' />
                </button>
              </div>

              <div className='flex flex-col gap-2'>
                {section.fields.map(field => {
                  const filled = isFilled(field.value);
                  return (
                    <div
                      key={field.label}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        {filled ? (
                          <CheckCircle2 className='text-primary h-3.5 w-3.5' />
                        ) : (
                          <AlertCircle
                            className={cn(
                              'h-3.5 w-3.5',
                              field.required ? 'text-red-400' : 'text-white/15'
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            filled ? 'text-white/70' : 'text-white/25'
                          )}
                        >
                          {field.label}
                        </span>
                      </div>
                      {filled && (
                        <span className='max-w-[80px] truncate text-xs text-white/35 sm:max-w-[130px]'>
                          {field.customLabel ||
                            (typeof field.value === 'string'
                              ? field.value
                              : 'Done')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ready to launch callout */}
      <div className='border-primary/15 bg-primary/3 flex items-start gap-3 rounded-xl border p-4 sm:p-5'>
        <div className='bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'>
          <Rocket className='h-4 w-4' />
        </div>
        <div className='flex flex-col gap-0.5'>
          <h4 className='text-sm font-semibold text-white'>Ready to launch?</h4>
          <p className='text-sm text-white/40'>
            Once published, your project will be visible to the community.
            Funding projects undergo admin review to verify milestones.
          </p>
        </div>
      </div>
    </div>
  );
}
