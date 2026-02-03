'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { uploadService } from '@/lib/api/upload';
import { cn } from '@/lib/utils';

interface BasicInfoSectionProps {
  data: {
    title: string;
    logo: string;
    vision: string;
    category: string;
  };
  onChange: (field: string, value: any) => void;
}

const categories = [
  'DeFi & Finance',
  'Gaming & Metaverse',
  'Social & Community',
  'Infrastructure & Tooling',
  'AI & Machine Learning',
  'Sustainability & Impact',
  'Other',
];

export function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.uploadSingle(file);
      onChange('logo', result.data.url);
    } catch {
      // Error handled silently
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadService.uploadSingle(file);
      onChange('logo', result.data.url);
    } catch {
      // Error handled silently
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onChange('logo', '');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Two Column Grid Layout */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left Column - Title and Logo */}
        <div className='space-y-6'>
          {/* Title */}
          <div className='space-y-3'>
            <Label
              htmlFor='title'
              className='text-foreground text-sm font-semibold'
            >
              Project Title <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              value={data.title}
              onChange={e => onChange('title', e.target.value)}
              placeholder='Enter project name/title'
              className='bg-card text-foreground placeholder:text-muted-foreground'
            />
          </div>

          {/* Logo */}
          <div className='space-y-3'>
            <Label className='text-foreground text-sm font-semibold'>
              Logo <span className='text-red-500'>*</span>
            </Label>
            <div className='border-border bg-card/50 flex flex-col items-center gap-4 rounded-lg border p-6'>
              {data.logo ? (
                <div className='relative w-full'>
                  <div className='flex items-center justify-center'>
                    <Image
                      src={data.logo || '/placeholder.svg'}
                      alt='Project logo'
                      width={120}
                      height={120}
                      className='border-border rounded-lg border object-cover'
                    />
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-7 w-7 rounded-full bg-red-500 p-0 hover:bg-red-600'
                    onClick={removeLogo}
                  >
                    <X className='h-4 w-4 text-white' />
                  </Button>
                </div>
              ) : null}
              <label
                htmlFor='logo-upload'
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  isDragOver
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/30 hover:border-primary/50',
                  uploading && 'cursor-not-allowed opacity-50'
                )}
              >
                <Upload className='text-muted-foreground mb-2 h-6 w-6' />
                <p className='text-foreground text-center text-sm font-medium'>
                  {uploading
                    ? 'Uploading...'
                    : data.logo
                      ? 'Change logo'
                      : 'Upload logo'}
                </p>
                <p className='text-muted-foreground mt-1 text-xs'>
                  PNG, JPG (max 2MB)
                </p>
                <input
                  id='logo-upload'
                  type='file'
                  accept='image/png,image/jpeg'
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className='hidden'
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Vision and Category */}
        <div className='space-y-6'>
          {/* Vision */}
          <div className='space-y-3'>
            <Label
              htmlFor='vision'
              className='text-foreground text-sm font-semibold'
            >
              Vision <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='vision'
              value={data.vision}
              onChange={e => onChange('vision', e.target.value)}
              placeholder='Share the future your project is building'
              className='bg-card text-foreground placeholder:text-muted-foreground min-h-32 resize-none'
              maxLength={300}
            />
            <div className='flex justify-end pt-1'>
              <span className='text-muted-foreground text-xs'>
                {data.vision.length}/300
              </span>
            </div>
          </div>

          {/* Category */}
          <div className='space-y-3'>
            <Label
              htmlFor='category'
              className='text-foreground text-sm font-semibold'
            >
              Category <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={data.category}
              onValueChange={value => onChange('category', value)}
            >
              <SelectTrigger id='category' className='bg-card text-foreground'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
