'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Rocket } from 'lucide-react';
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
  // Helper to check if a field is "completed"
  const isFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      // For objects like contact, check if any of the values are filled
      return Object.values(value).some(v => isFilled(v));
    }
    if (typeof value === 'number') return true; // fundingAmount > 0 check handled separately
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
          customLabel: `${formData.tags?.length || 0} tags added`,
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
      title: 'Team Information',
      step: 'team' as CreationStep,
      fields: [
        {
          label: 'Team Members',
          value: formData.team,
          required: false,
          customLabel: `${formData.team?.length || 0} members added`,
        },
      ],
    },
    {
      title: 'Contact Information',
      step: 'social' as CreationStep,
      fields: [
        { label: 'Email', value: formData.contact?.email, required: true },
        {
          label: 'Telegram',
          value: formData.contact?.telegram,
          required: false,
        },
        { label: 'Discord', value: formData.contact?.discord, required: false },
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
          customLabel: `${formData.milestones?.length || 0} milestones defined`,
        },
      ],
    });
  }

  return (
    <div className='flex flex-col gap-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-4xl font-black tracking-tight text-white'>
          Review & Submit
        </h2>
        <p className='text-sm font-medium text-white/40'>
          Double-check your highlights before publishing to the Boundless
          ecosystem.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {sections.map(section => (
          <div
            key={section.title}
            className='group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/4'
          >
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-black tracking-[0.2em] text-white/60 uppercase'>
                {section.title}
              </h3>
              <button
                onClick={() => onNavigate(section.step)}
                className='text-primary hover:text-primary/80 flex items-center gap-1.5 text-[10px] font-bold opacity-0 transition-all group-hover:opacity-100 hover:underline'
              >
                Edit Section <ArrowRight className='h-3.5 w-3.5' />
              </button>
            </div>

            <div className='flex flex-col gap-3'>
              {section.fields.map(field => {
                const filled = isFilled(field.value);
                return (
                  <div
                    key={field.label}
                    className='flex items-center justify-between text-sm'
                  >
                    <div className='flex items-center gap-3'>
                      {filled ? (
                        <CheckCircle2 className='text-primary h-4 w-4' />
                      ) : (
                        <AlertCircle
                          className={cn(
                            'h-4 w-4',
                            field.required ? 'text-red-500' : 'text-white/10'
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          filled ? 'text-white/80' : 'text-white/20'
                        )}
                      >
                        {field.label}
                      </span>
                    </div>
                    {filled && (
                      <span className='max-w-[150px] truncate font-mono text-[10px] text-white/40'>
                        {field.customLabel ||
                          (typeof field.value === 'string'
                            ? field.value
                            : 'Completed')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className='border-primary/20 bg-primary/5 rounded-2xl border p-8'>
        <div className='flex gap-4'>
          <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
            <Rocket className='h-5 w-5' />
          </div>
          <div className='flex flex-col gap-1'>
            <h4 className='font-bold text-white'>Ready to launch?</h4>
            <p className='text-sm leading-relaxed font-medium text-white/50'>
              Once you publish, your project will be visible to the entire
              community. Projects seeking funding will undergo a brief admin
              review to verify milestones and technical identifiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
