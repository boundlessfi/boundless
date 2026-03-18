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
} from 'lucide-react';
import {
  CreationInput,
  CreationTextarea,
  CreationToggle,
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

// ── Full category list (value + label + group) ───────────────
const CATEGORIES = [
  // DeFi & Finance
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
  // Payments
  { value: 'payment-gateways', label: 'Payment Gateways', group: 'Payments' },
  { value: 'remittances', label: 'Remittances', group: 'Payments' },
  { value: 'merchant-tools', label: 'Merchant Tools', group: 'Payments' },
  { value: 'point-of-sale', label: 'Point-of-Sale', group: 'Payments' },
  { value: 'wallets', label: 'Wallets', group: 'Payments' },
  // Infrastructure
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
  // NFTs & Gaming
  {
    value: 'nft-marketplaces',
    label: 'NFT Marketplaces',
    group: 'NFTs & Gaming',
  },
  { value: 'gaming', label: 'Gaming Platforms', group: 'NFTs & Gaming' },
  { value: 'collectibles', label: 'Collectibles', group: 'NFTs & Gaming' },
  { value: 'metaverse', label: 'Metaverse', group: 'NFTs & Gaming' },
  { value: 'creator-tools', label: 'Creator Tools', group: 'NFTs & Gaming' },
  // Social & Community
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
  // Identity & Credentials
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
  // AI & Automation
  { value: 'ai-agents', label: 'AI Agents', group: 'AI & Automation' },
  {
    value: 'machine-learning',
    label: 'Machine Learning',
    group: 'AI & Automation',
  },
  { value: 'automation', label: 'Automation Tools', group: 'AI & Automation' },
  // Sustainability & Impact
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
  // Other
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

// ── Category combobox ────────────────────────────────────────────────────────
function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.find(c => c.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border px-5 py-4 text-sm transition-all outline-none',
            'focus:border-primary/40 focus:ring-primary/20 focus:ring-1',
            selected
              ? 'border-primary/30 bg-primary/5 text-white'
              : 'border-white/5 bg-white/5 text-white/30',
            'hover:border-white/20'
          )}
        >
          <span className='flex items-center gap-2'>
            {selected ? (
              <>
                <span className='text-[10px] font-bold tracking-wider text-white/30 uppercase'>
                  {selected.group}
                </span>
                <span className='text-white/20'>/</span>
                <span className='font-semibold text-white'>
                  {selected.label}
                </span>
              </>
            ) : (
              <span>Select a category…</span>
            )}
          </span>
          <ChevronsUpDown className='h-4 w-4 shrink-0 text-white/30' />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className='w-[420px] border-white/10 bg-[#0d0d0d] p-0 shadow-2xl'
        align='start'
        sideOffset={8}
      >
        <Command className='bg-transparent'>
          <div className='flex items-center border-b border-white/5 px-3'>
            <Search className='h-4 w-4 shrink-0 text-white/30' />
            <CommandInput
              placeholder='Search categories…'
              className='border-0 bg-transparent py-3 text-sm text-white placeholder:text-white/20 focus:ring-0 focus:outline-none'
            />
          </div>
          <CommandList className='max-h-[340px] overflow-y-auto'>
            <CommandEmpty className='py-8 text-center text-sm text-white/30'>
              No category found.
            </CommandEmpty>
            {Object.entries(categoryGroups).map(([group, cats], i) => (
              <React.Fragment key={group}>
                {i > 0 && <CommandSeparator className='bg-white/5' />}
                <CommandGroup
                  heading={group}
                  className='**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:tracking-widest **:[[cmdk-group-heading]]:text-white/30 **:[[cmdk-group-heading]]:uppercase'
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
                        'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        'hover:bg-white/5 hover:text-white',
                        cat.value === value
                          ? 'bg-primary/10 text-primary'
                          : 'text-white/60'
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
  );
}

// ── Props ────────────────────────────────────────────────────
interface BasicInfoProps {
  formData: any;
  updateFormData: (updates: any) => void;
  isCampaign: boolean;
  setIsCampaign: (val: boolean) => void;
}

// ── Section header helper ────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-3 border-b border-white/5 pb-2'>
      <div className='bg-primary h-1.5 w-1.5 rounded-full' />
      <h3 className='text-xs font-black tracking-[0.2em] text-white/70 uppercase'>
        {children}
      </h3>
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
  const socialLinks: string[] = formData.socialLinks ?? ['', '', ''];
  const visionLength = (formData.vision ?? '').length;

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    updateFormData({ socialLinks: updated });
  };

  return (
    <div className='mx-auto w-full'>
      {/* Page header */}
      <div className='mb-12 flex flex-col gap-2'>
        <h2 className='text-3xl font-bold tracking-tight text-white'>
          Let's start with the basics
        </h2>
        <p className='text-sm font-medium text-white/40'>
          Required fields are marked with{' '}
          <span className='text-red-400'>*</span>
        </p>
      </div>

      <div className='flex flex-col gap-12'>
        {/* ── IDENTITY ────────────────────────────────────── */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>Project Identity</SectionTitle>

          <CreationInput
            label='Project Name'
            placeholder='Enter your project name'
            value={formData.projectName ?? ''}
            onChange={e => updateFormData({ projectName: e.target.value })}
            required
          />

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
                Vision Statement <span className='text-red-400'>*</span>
              </label>
              <span
                className={cn(
                  'text-[10px] font-bold tabular-nums transition-colors',
                  visionLength >= 290
                    ? 'text-red-400'
                    : visionLength >= 250
                      ? 'text-amber-400'
                      : 'text-white/30'
                )}
              >
                {visionLength}/300
              </span>
            </div>
            <CreationTextarea
              label=''
              placeholder='Describe the future your project is building — its long-term goal or positive change it will bring.'
              value={formData.vision ?? ''}
              onChange={e =>
                updateFormData({ vision: e.target.value.slice(0, 300) })
              }
              rows={4}
            />
            <p className='flex items-start gap-1.5 text-[10px] font-medium text-white/30'>
              <Info className='mt-0.5 h-3 w-3 shrink-0' />A compelling vision
              helps backers understand your project's purpose and long-term
              goals.
            </p>
          </div>
        </div>

        {/* ── VISUAL ASSETS ───────────────────────────────── */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>Visual Assets</SectionTitle>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='flex flex-col gap-3'>
              <CreationImageUpload
                label='Project Logo'
                value={formData.logoUrl ?? formData.logo ?? ''}
                onChange={url => updateFormData({ logoUrl: url, logo: null })}
                aspectRatio='square'
                description='JPEG or PNG · max 2 MB'
                required
              />
              <p className='rounded-lg border border-white/5 bg-white/2 px-3 py-2 text-[10px] font-medium text-white/30'>
                <span className='font-bold text-white/50'>Recommended:</span>{' '}
                480×480 px minimum, square format
              </p>
            </div>

            <div className='flex flex-col gap-3'>
              <CreationImageUpload
                label='Banner Image'
                value={formData.bannerUrl ?? formData.banner ?? ''}
                onChange={url =>
                  updateFormData({ bannerUrl: url, banner: null })
                }
                aspectRatio='banner'
                description='JPEG or PNG · max 5 MB'
              />
              <p className='rounded-lg border border-white/5 bg-white/2 px-3 py-2 text-[10px] font-medium text-white/30'>
                <span className='font-bold text-white/50'>Recommended:</span>{' '}
                1200×400 px, 3:1 aspect ratio
              </p>
            </div>
          </div>
        </div>

        {/* ── CATEGORY ────────────────────────────────────── */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>
            Category <span className='ml-1 text-red-400'>*</span>
          </SectionTitle>

          <CategoryPicker
            value={formData.category ?? ''}
            onChange={val => updateFormData({ category: val })}
          />

          <p className='flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-[10px] font-medium text-blue-400/80'>
            <Info className='mt-0.5 h-3 w-3 shrink-0' />
            Choose the category that best describes your project. This helps
            users discover your project through filtered browsing.
          </p>
        </div>

        {/* ── LINKS ───────────────────────────────────────── */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>Project Links</SectionTitle>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <CreationInput
                label='Repository URL'
                placeholder='https://github.com/username/repo'
                value={formData.githubUrl ?? ''}
                onChange={e => updateFormData({ githubUrl: e.target.value })}
              />
              <p className='flex items-center gap-1.5 text-[10px] font-medium text-white/30'>
                <Github className='h-3 w-3' />
                GitHub, GitLab, or Bitbucket
              </p>
            </div>

            <div className='flex flex-col gap-2'>
              <CreationInput
                label='Project Website'
                placeholder='https://yourproject.xyz'
                value={formData.websiteUrl ?? ''}
                onChange={e => updateFormData({ websiteUrl: e.target.value })}
              />
              <p className='flex items-center gap-1.5 text-[10px] font-medium text-white/30'>
                <Globe className='h-3 w-3' />
                Your project's homepage
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <CreationInput
              label='Demo Video URL'
              placeholder='https://youtube.com/watch?v=…'
              value={formData.demoVideoUrl ?? ''}
              onChange={e => updateFormData({ demoVideoUrl: e.target.value })}
            />
            <p className='border-primary/20 bg-primary/5 text-primary/90 flex items-center gap-2 rounded-lg border px-4 py-3 text-[10px] font-medium'>
              <Video className='h-3 w-3 shrink-0' />
              YouTube links will be embedded as a video player on your project
              page.
            </p>
          </div>
        </div>

        {/* ── SOCIAL LINKS ────────────────────────────────── */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>
            Social Media{' '}
            <span className='ml-1 text-red-400'>* at least one</span>
          </SectionTitle>

          <p className='-mt-2 text-xs font-medium text-white/40'>
            Add up to 3 social links — X/Twitter, Farcaster, Instagram,
            Substack, Facebook, etc.
          </p>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {[0, 1, 2].map(i => (
              <CreationInput
                key={i}
                label={`Social Link ${i + 1}${i === 0 ? ' *' : ''}`}
                placeholder={
                  i === 0 ? 'https://x.com/yourproject' : 'https://…'
                }
                value={socialLinks[i] ?? ''}
                onChange={e => updateSocialLink(i, e.target.value)}
              />
            ))}
          </div>

          <p className='flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] font-medium text-amber-400/80'>
            <Info className='mt-0.5 h-3 w-3 shrink-0' />
            At least one social link is required. This helps build trust and
            allows the community to follow your progress.
          </p>
        </div>

        {/* ── FUNDING MODE ─────────────────────────────────- */}
        <div className='flex flex-col gap-6'>
          <SectionTitle>Funding Mode</SectionTitle>

          <div className='rounded-xl border border-white/10 bg-white/2 p-6'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <p className='mb-1 text-sm font-bold text-white'>
                    Enable Crowdfunding Campaign
                  </p>
                  <p className='text-xs font-medium text-white/40'>
                    Turn on milestone-based crowdfunding to raise funds from the
                    community. Funds are released as you complete verified
                    milestones.
                  </p>
                </div>
                <CreationToggle
                  label=''
                  enabled={isCampaign}
                  onToggle={setIsCampaign}
                />
              </div>

              {isCampaign && (
                <p className='border-primary/20 bg-primary/5 text-primary/90 flex items-start gap-2 rounded-lg border px-4 py-3 text-[10px] font-medium'>
                  <Info className='mt-0.5 h-3 w-3 shrink-0' />
                  You'll configure your funding goal, milestones, and timeline
                  in the next steps.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
