'use client';

import React, { useState } from 'react';
import {
  Github,
  Globe,
  Video,
  Info,
  Search,
  ChevronsUpDown,
  Check,
  Gitlab,
  Code2,
  AlertCircle,
  Rocket,
  FolderOpen,
} from 'lucide-react';
import {
  CreationInput,
  CreationTextarea,
  CreationImageUpload,
} from '../CreationUI';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

// ── Categories ───────────────────────────────────────────────
const CATEGORIES = [
  { value: 'dex-amm', label: 'DEX / AMM', group: 'DeFi & Finance' },
  {
    value: 'lending-borrowing',
    label: 'Lending & Borrowing',
    group: 'DeFi & Finance',
  },
  { value: 'stablecoins', label: 'Stablecoins', group: 'DeFi & Finance' },
  { value: 'derivatives', label: 'Derivatives', group: 'DeFi & Finance' },
  {
    value: 'yield-aggregators',
    label: 'Yield Aggregators',
    group: 'DeFi & Finance',
  },
  { value: 'liquid-staking', label: 'Liquid Staking', group: 'DeFi & Finance' },
  { value: 'payment-gateways', label: 'Payment Gateways', group: 'Payments' },
  { value: 'remittances', label: 'Remittances', group: 'Payments' },
  { value: 'merchant-tools', label: 'Merchant Tools', group: 'Payments' },
  { value: 'point-of-sale', label: 'Point-of-Sale', group: 'Payments' },
  { value: 'wallets', label: 'Wallets', group: 'Payments' },
  { value: 'dev-tools', label: 'Developer Tools', group: 'Infrastructure' },
  {
    value: 'sdks-libraries',
    label: 'SDKs & Libraries',
    group: 'Infrastructure',
  },
  {
    value: 'analytics',
    label: 'Analytics & Dashboards',
    group: 'Infrastructure',
  },
  { value: 'indexers', label: 'Indexers', group: 'Infrastructure' },
  { value: 'oracles', label: 'Oracles', group: 'Infrastructure' },
  {
    value: 'node-infra',
    label: 'Node Infrastructure',
    group: 'Infrastructure',
  },
  {
    value: 'nft-marketplaces',
    label: 'NFT Marketplaces',
    group: 'NFTs & Gaming',
  },
  { value: 'gaming', label: 'Gaming Platforms', group: 'NFTs & Gaming' },
  { value: 'collectibles', label: 'Collectibles', group: 'NFTs & Gaming' },
  { value: 'metaverse', label: 'Metaverse', group: 'NFTs & Gaming' },
  { value: 'creator-tools', label: 'Creator Tools', group: 'NFTs & Gaming' },
  { value: 'daos', label: 'DAOs & Governance', group: 'Social & Community' },
  {
    value: 'social-networks',
    label: 'Social Networks',
    group: 'Social & Community',
  },
  {
    value: 'messaging',
    label: 'Messaging & Communication',
    group: 'Social & Community',
  },
  {
    value: 'community-platforms',
    label: 'Community Platforms',
    group: 'Social & Community',
  },
  { value: 'did', label: 'DID Solutions', group: 'Identity & Credentials' },
  {
    value: 'credentials',
    label: 'Credential Verification',
    group: 'Identity & Credentials',
  },
  {
    value: 'reputation',
    label: 'Reputation Systems',
    group: 'Identity & Credentials',
  },
  {
    value: 'kyc-compliance',
    label: 'KYC / Compliance',
    group: 'Identity & Credentials',
  },
  { value: 'ai-agents', label: 'AI Agents', group: 'AI & Automation' },
  {
    value: 'machine-learning',
    label: 'Machine Learning',
    group: 'AI & Automation',
  },
  { value: 'automation', label: 'Automation Tools', group: 'AI & Automation' },
  {
    value: 'carbon-credits',
    label: 'Carbon Credits',
    group: 'Sustainability & Impact',
  },
  {
    value: 'regen-finance',
    label: 'Regenerative Finance',
    group: 'Sustainability & Impact',
  },
  {
    value: 'social-impact',
    label: 'Social Impact',
    group: 'Sustainability & Impact',
  },
  { value: 'other', label: 'Other', group: 'Other' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

const categoryGroups = CATEGORIES.reduce<
  Record<string, (typeof CATEGORIES)[number][]>
>((acc, cat) => {
  if (!acc[cat.group]) acc[cat.group] = [];
  acc[cat.group].push(cat);
  return acc;
}, {});

// ── Category combobox ────────────────────────────────────────
function CategoryPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.find(c => c.value === value);

  return (
    <div className='flex flex-col gap-1.5'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            role='combobox'
            aria-expanded={open}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors outline-none',
              'focus:border-primary/40 focus:ring-primary/20 focus:ring-1',
              selected
                ? 'border-white/15 text-white'
                : 'border-white/10 text-white/30',
              error && 'border-red-500/60',
              'bg-white/4 hover:border-white/20'
            )}
          >
            <span className='flex items-center gap-2'>
              {selected ? (
                <>
                  <span className='text-xs text-white/40'>
                    {selected.group}
                  </span>
                  <span className='text-white/20'>/</span>
                  <span className='text-white'>{selected.label}</span>
                </>
              ) : (
                <span>Select a category...</span>
              )}
            </span>
            <ChevronsUpDown className='h-4 w-4 shrink-0 text-white/30' />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className='w-[calc(100vw-2rem)] border-white/10 bg-[#111] p-0 shadow-2xl sm:w-[400px]'
          align='start'
          sideOffset={6}
        >
          <Command className='bg-transparent'>
            <div className='flex items-center border-b border-white/6 px-3'>
              <Search className='h-4 w-4 shrink-0 text-white/30' />
              <CommandInput
                placeholder='Search categories...'
                className='border-0 bg-transparent py-2.5 text-sm text-white placeholder:text-white/25 focus:ring-0 focus:outline-none'
              />
            </div>
            <CommandList className='max-h-[300px] overflow-y-auto'>
              <CommandEmpty className='py-6 text-center text-sm text-white/30'>
                No category found.
              </CommandEmpty>
              {Object.entries(categoryGroups).map(([group, cats], i) => (
                <React.Fragment key={group}>
                  {i > 0 && <CommandSeparator className='bg-white/5' />}
                  <CommandGroup
                    heading={group}
                    className='**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-white/30'
                  >
                    {cats.map(cat => (
                      <CommandItem
                        key={cat.value}
                        value={`${group} ${cat.label}`}
                        onSelect={() => {
                          onChange(cat.value === value ? '' : cat.value);
                          setOpen(false);
                        }}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                          'hover:bg-white/5',
                          cat.value === value ? 'text-primary' : 'text-white/60'
                        )}
                      >
                        {cat.label}
                        {cat.value === value && (
                          <Check className='text-primary h-3.5 w-3.5' />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className='flex items-center gap-1 text-xs text-red-400'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Validation helpers ───────────────────────────────────────
function validateUrl(value: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  try {
    const url = value.startsWith('http') ? value : `https://${value}`;
    new URL(url);
    return undefined;
  } catch {
    return 'Please enter a valid URL';
  }
}

// ── Props ────────────────────────────────────────────────────
interface BasicInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isCampaign: boolean;
  setIsCampaign: (val: boolean) => void;
}

// ── Section header ───────────────────────────────────────────
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <h3 className='text-sm font-semibold text-white sm:text-base'>{title}</h3>
      {description && <p className='text-sm text-white/40'>{description}</p>}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function BasicInfo({
  formData,
  updateFormData,
  isCampaign,
  setIsCampaign,
}: BasicInfoProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const socialLinks: string[] = formData.socialLinks ?? ['', '', ''];
  const visionLength = (formData.vision ?? '').length;

  const markTouched = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  // Inline validation errors (only shown after field is touched)
  const errors: Record<string, string | undefined> = {};
  if (touched.projectName && !(formData.projectName ?? '').trim()) {
    errors.projectName = 'Project name is required';
  } else if (
    touched.projectName &&
    (formData.projectName ?? '').trim().length < 3
  ) {
    errors.projectName = 'Must be at least 3 characters';
  }
  if (touched.tagline && !(formData.tagline ?? '').trim()) {
    errors.tagline = 'Tagline is required';
  }
  if (touched.vision && !(formData.vision ?? '').trim()) {
    errors.vision = 'Vision statement is required';
  } else if (touched.vision && (formData.vision ?? '').trim().length < 10) {
    errors.vision = 'Must be at least 10 characters';
  }
  if (touched.category && !(formData.category ?? '')) {
    errors.category = 'Please select a category';
  }
  if (touched.logoUrl && !(formData.logoUrl ?? '').trim() && !formData.logo) {
    errors.logoUrl = 'Project logo is required';
  }
  if (touched.githubUrl)
    errors.githubUrl = validateUrl(formData.githubUrl ?? '');
  if (touched.gitlabUrl)
    errors.gitlabUrl = validateUrl(formData.gitlabUrl ?? '');
  if (touched.bitbucketUrl)
    errors.bitbucketUrl = validateUrl(formData.bitbucketUrl ?? '');
  if (touched.websiteUrl)
    errors.websiteUrl = validateUrl(formData.websiteUrl ?? '');
  if (touched.demoVideoUrl)
    errors.demoVideoUrl = validateUrl(formData.demoVideoUrl ?? '');
  if (touched.socialLinks && !socialLinks.some(l => l.trim())) {
    errors.socialLinks = 'At least one social link is required';
  }

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    updateFormData({ socialLinks: updated });
  };

  return (
    <div className='flex flex-col gap-8 sm:gap-10'>
      {/* Page header */}
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Let&apos;s start with the basics
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          Fields marked with <span className='text-red-400'>*</span> are
          required.
        </p>
      </div>

      {/* ── PROJECT IDENTITY ─────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader title='Project Identity' />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <CreationInput
            label='Project Name'
            placeholder='Enter your project name'
            value={formData.projectName ?? ''}
            onChange={e => updateFormData({ projectName: e.target.value })}
            onBlur={() => markTouched('projectName')}
            error={errors.projectName}
            required
          />
          <CreationInput
            label='Tagline'
            placeholder='A short, catchy one-liner'
            value={formData.tagline ?? ''}
            onChange={e =>
              updateFormData({ tagline: e.target.value.slice(0, 100) })
            }
            onBlur={() => markTouched('tagline')}
            error={errors.tagline}
            required
            maxLength={100}
          />
        </div>

        <CreationTextarea
          label='Vision Statement'
          placeholder='Describe the future your project is building — its long-term goal or positive change.'
          value={formData.vision ?? ''}
          onChange={e =>
            updateFormData({ vision: e.target.value.slice(0, 300) })
          }
          onBlur={() => markTouched('vision')}
          error={errors.vision}
          required
          maxLength={300}
          rows={3}
          helperText="A compelling vision helps backers understand your project's purpose."
        />
      </section>

      {/* ── VISUAL ASSETS ────────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader
          title='Visual Assets'
          description='Upload a logo and optional banner image.'
        />

        <div className='grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]'>
          <div className='flex flex-col gap-2'>
            <CreationImageUpload
              label='PROJECT LOGO'
              value={formData.logoUrl ?? formData.logo ?? ''}
              onChange={url => updateFormData({ logoUrl: url, logo: null })}
              aspectRatio='square'
              recommendedText='480×480 px · square'
              description='Displayed at 64px and 128px across the platform'
              required
              error={errors.logoUrl}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <CreationImageUpload
              label='BANNER IMAGE'
              value={formData.bannerUrl ?? formData.banner ?? ''}
              onChange={url => updateFormData({ bannerUrl: url, banner: null })}
              aspectRatio='banner'
              recommendedText='1200×400 px · 3:1 ratio'
              description='Cropped to 3:1 on mobile — keep key content centered'
            />
          </div>
        </div>
      </section>

      {/* ── CATEGORY & TAGS ──────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader title='Category & Tags' />

        <div className='flex flex-col gap-1.5'>
          <label className='text-[13px] font-medium text-white/50'>
            Category<span className='ml-0.5 text-red-400'>*</span>
          </label>
          <CategoryPicker
            value={formData.category ?? ''}
            onChange={val => {
              updateFormData({ category: val });
              markTouched('category');
            }}
            error={errors.category}
          />
        </div>

        <CreationInput
          label='Tags'
          placeholder='DeFi, NFT, Soroban (comma separated)'
          value={(formData.tags ?? []).join(', ')}
          onChange={e => {
            const tags = e.target.value
              .split(',')
              .map(t => t.trim())
              .filter(Boolean);
            updateFormData({ tags });
          }}
          helperText='Tags help users discover your project through filtered browsing.'
        />
      </section>

      {/* ── PROJECT LINKS ────────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader
          title='Project Links'
          description='Add repository and project URLs.'
        />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <CreationInput
            label='GitHub'
            placeholder='https://github.com/...'
            value={formData.githubUrl ?? ''}
            onChange={e => updateFormData({ githubUrl: e.target.value })}
            onBlur={() => markTouched('githubUrl')}
            error={errors.githubUrl}
          />
          <CreationInput
            label='GitLab'
            placeholder='https://gitlab.com/...'
            value={formData.gitlabUrl ?? ''}
            onChange={e => updateFormData({ gitlabUrl: e.target.value })}
            onBlur={() => markTouched('gitlabUrl')}
            error={errors.gitlabUrl}
          />
          <CreationInput
            label='Bitbucket'
            placeholder='https://bitbucket.org/...'
            value={formData.bitbucketUrl ?? ''}
            onChange={e => updateFormData({ bitbucketUrl: e.target.value })}
            onBlur={() => markTouched('bitbucketUrl')}
            error={errors.bitbucketUrl}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <CreationInput
            label='Website'
            placeholder='https://yourproject.xyz'
            value={formData.websiteUrl ?? ''}
            onChange={e => updateFormData({ websiteUrl: e.target.value })}
            onBlur={() => markTouched('websiteUrl')}
            error={errors.websiteUrl}
            helperText="Your project's homepage"
          />
          <CreationInput
            label='Demo Video'
            placeholder='https://youtube.com/watch?v=...'
            value={formData.demoVideoUrl ?? ''}
            onChange={e => updateFormData({ demoVideoUrl: e.target.value })}
            onBlur={() => markTouched('demoVideoUrl')}
            error={errors.demoVideoUrl}
            helperText='YouTube links will be embedded on your page'
          />
        </div>
      </section>

      {/* ── SOCIAL LINKS ─────────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader
          title='Social Media'
          description='Add up to 3 social links. At least one is required.'
        />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[0, 1, 2].map(i => (
            <CreationInput
              key={i}
              label={`Social Link ${i + 1}${i === 0 ? ' *' : ''}`}
              placeholder={
                i === 0 ? 'https://x.com/yourproject' : 'https://...'
              }
              value={socialLinks[i] ?? ''}
              onChange={e => updateSocialLink(i, e.target.value)}
              onBlur={() => markTouched('socialLinks')}
              error={i === 0 ? errors.socialLinks : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── FUNDING MODE ─────────────────────────────────── */}
      <section className='flex flex-col gap-5'>
        <SectionHeader title='Project Type' />

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {/* Standard Project Card */}
          <button
            type='button'
            onClick={() => setIsCampaign(false)}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-5 text-left transition-all',
              !isCampaign
                ? 'border-primary/30 bg-primary/5 ring-primary/20 ring-1'
                : 'border-white/10 bg-white/2 hover:border-white/20'
            )}
          >
            <div className='flex items-center gap-3'>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  !isCampaign
                    ? 'bg-primary/15 text-primary'
                    : 'bg-white/5 text-white/30'
                )}
              >
                <FolderOpen className='h-4 w-4' />
              </div>
              <div>
                <p className='text-sm font-semibold text-white'>
                  Standard Project
                </p>
                <p className='text-xs text-white/40'>
                  Showcase only, no funding
                </p>
              </div>
            </div>
            {!isCampaign && (
              <div className='flex items-center gap-1.5'>
                <div className='bg-primary h-1.5 w-1.5 rounded-full' />
                <span className='text-primary text-xs font-medium'>
                  Selected
                </span>
              </div>
            )}
          </button>

          {/* Campaign Card */}
          <button
            type='button'
            onClick={() => setIsCampaign(true)}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-5 text-left transition-all',
              isCampaign
                ? 'border-primary/30 bg-primary/5 ring-primary/20 ring-1'
                : 'border-white/10 bg-white/2 hover:border-white/20'
            )}
          >
            <div className='flex items-center gap-3'>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  isCampaign
                    ? 'bg-primary/15 text-primary'
                    : 'bg-white/5 text-white/30'
                )}
              >
                <Rocket className='h-4 w-4' />
              </div>
              <div>
                <p className='text-sm font-semibold text-white'>
                  Crowdfunding Campaign
                </p>
                <p className='text-xs text-white/40'>
                  Raise funds with milestones
                </p>
              </div>
            </div>
            {isCampaign && (
              <div className='flex items-center gap-1.5'>
                <div className='bg-primary h-1.5 w-1.5 rounded-full' />
                <span className='text-primary text-xs font-medium'>
                  Selected
                </span>
              </div>
            )}
          </button>
        </div>

        {isCampaign && (
          <div className='border-primary/15 bg-primary/3 flex items-start gap-2.5 rounded-lg border p-3.5'>
            <Info className='text-primary mt-0.5 h-4 w-4 shrink-0' />
            <p className='text-sm text-white/50'>
              You&apos;ll configure your funding goal, milestones, and timeline
              in the
              <strong className='text-white/70'>
                {' '}
                Funding & Milestones
              </strong>{' '}
              step.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
