'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { uploadService } from '@/lib/api/upload';
import { toast } from 'sonner';
import type { CampaignWizardData } from '../NewCampaignWizard';

const CATEGORIES = [
  'DeFi',
  'Infrastructure',
  'NFT',
  'Gaming',
  'DAO',
  'Social',
  'Developer Tooling',
  'Education',
  'Identity',
  'Other',
];

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  aspectClass,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (url: string) => void;
  aspectClass: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const res = await uploadService.uploadSingle(file, {
        folder: 'campaigns',
      });
      onChange(res.data.secure_url);
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <div className='space-y-1.5'>
      <Label className='text-sm font-medium text-zinc-300'>{label}</Label>
      <p className='text-xs text-zinc-600'>{hint}</p>

      <div
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 transition hover:border-zinc-600 ${aspectClass}`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className='h-full w-full object-cover'
            />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                onChange('');
              }}
              className='absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 text-zinc-600'>
            <Upload className='h-6 w-6' />
            <span className='text-xs'>Click to upload</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export default function BasicsStep({ data, onChange }: Props) {
  return (
    <div className='space-y-6'>
      <div className='space-y-1.5'>
        <Label htmlFor='title' className='text-sm font-medium text-zinc-300'>
          Campaign title <span className='text-red-400'>*</span>
        </Label>
        <Input
          id='title'
          placeholder='Give your campaign a clear, memorable name'
          value={data.title}
          onChange={e => onChange({ title: e.target.value })}
          className='border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='tagline' className='text-sm font-medium text-zinc-300'>
          Tagline
        </Label>
        <Input
          id='tagline'
          placeholder='One sentence that captures your project (max 120 chars)'
          maxLength={120}
          value={data.tagline}
          onChange={e => onChange({ tagline: e.target.value })}
          className='border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
        />
        <p className='text-right text-xs text-zinc-600'>
          {data.tagline.length}/120
        </p>
      </div>

      <div className='space-y-1.5'>
        <Label className='text-sm font-medium text-zinc-300'>
          Category <span className='text-red-400'>*</span>
        </Label>
        <Select
          value={data.category}
          onValueChange={v => onChange({ category: v })}
        >
          <SelectTrigger className='border-zinc-800 bg-zinc-950 text-white'>
            <SelectValue placeholder='Select a category' />
          </SelectTrigger>
          <SelectContent className='border-zinc-800 bg-zinc-950 text-white'>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ImageUploadField
        label='Logo'
        hint='Square image, min 200×200px. Shown in campaign cards.'
        value={data.logoUrl}
        onChange={url => onChange({ logoUrl: url })}
        aspectClass='h-32 w-32'
      />

      <ImageUploadField
        label='Banner'
        hint='Wide image, min 1200×400px. Shown at the top of your campaign page.'
        value={data.bannerUrl}
        onChange={url => onChange({ bannerUrl: url })}
        aspectClass='h-40 w-full'
      />
    </div>
  );
}
