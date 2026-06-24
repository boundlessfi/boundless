'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Loader2, ImageIcon, LayoutTemplate } from 'lucide-react';
import { uploadService } from '@/lib/api/upload';
import { toast } from 'sonner';
import type { CampaignWizardData } from '../NewCampaignWizard';

const CATEGORIES = [
  'DeFi',
  'Payments',
  'Infrastructure',
  'Developer Tooling',
  'NFT',
  'Gaming',
  'DAO',
  'Social',
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
  required,
  value,
  onChange,
  aspectClass,
}: {
  label: string;
  hint: string;
  required?: boolean;
  value: string;
  onChange: (url: string) => void;
  aspectClass: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await uploadService.uploadSingle(file, {
        folder: 'campaigns',
      });
      onChange(res.data.secure_url);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='space-y-1.5'>
      <Label className='text-sm font-medium text-zinc-300'>
        {label}
        {required && <span className='ml-0.5 text-red-400'>*</span>}
      </Label>
      <p className='text-xs text-zinc-500'>{hint}</p>

      <div
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          isUploading
            ? 'border-primary/40 bg-primary/5 cursor-not-allowed'
            : value
              ? 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
              : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
        } ${aspectClass}`}
        onClick={() => {
          if (!isUploading) inputRef.current?.click();
        }}
      >
        {value && !isUploading ? (
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
              className='absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-black'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </>
        ) : isUploading ? (
          <div className='text-primary flex flex-col items-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span className='text-xs font-medium'>Uploading...</span>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-2 text-zinc-500'>
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
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function BasicsStep({ data, onChange }: Props) {
  return (
    <div className='space-y-8'>
      {/* Identity */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <LayoutTemplate className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Identity
          </span>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='title' className='text-sm font-medium text-zinc-300'>
            Campaign title <span className='text-red-400'>*</span>
          </Label>
          <Input
            id='title'
            placeholder='Give your campaign a clear, memorable name'
            value={data.title}
            onChange={e => onChange({ title: e.target.value })}
            className='focus:border-primary/50 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
          />
          <p className='text-xs text-zinc-600'>Min 3 characters</p>
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
      </section>

      {/* Media */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <ImageIcon className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Media
          </span>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]'>
          <ImageUploadField
            label='Logo'
            required
            hint='Square, min 200×200px'
            value={data.logoUrl}
            onChange={url => onChange({ logoUrl: url })}
            aspectClass='h-32 w-32'
          />

          <ImageUploadField
            label='Banner'
            hint='Wide image, min 1200×400px (optional)'
            value={data.bannerUrl}
            onChange={url => onChange({ bannerUrl: url })}
            aspectClass='h-32 w-full'
          />
        </div>
      </section>
    </div>
  );
}
