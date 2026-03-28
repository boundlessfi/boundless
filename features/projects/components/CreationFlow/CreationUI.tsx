'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { uploadService } from '@/lib/api/upload';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════
// CreationInput
// ═══════════════════════════════════════════════════════════
export const CreationInput = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  error,
  required = false,
  disabled = false,
  helperText,
  maxLength,
  pattern,
  name,
  id,
  className,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'url' | 'number' | 'tel' | 'date' | 'password';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  maxLength?: number;
  pattern?: string;
  name?: string;
  id?: string;
  className?: string;
}) => {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const charCount = value?.length ?? 0;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className='text-[13px] font-medium text-white/50'
          >
            {label}
            {required && <span className='ml-0.5 text-red-400'>*</span>}
          </Label>
          {maxLength !== undefined && value !== undefined && (
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount >= maxLength
                  ? 'text-red-400'
                  : charCount >= maxLength * 0.9
                    ? 'text-amber-400'
                    : 'text-white/30'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <Input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        className={cn(
          'h-10 rounded-lg border px-3.5 text-sm text-white placeholder:text-white/25',
          'focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:ring-1',
          'bg-white/4 transition-colors',
          error
            ? 'border-red-500/60 bg-red-500/4 focus-visible:border-red-500/60 focus-visible:ring-red-500/20'
            : 'border-white/10 hover:border-white/20',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />

      {error && (
        <p className='flex items-center gap-1 text-xs text-red-400'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className='text-xs text-white/30'>{helperText}</p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CreationTextarea
// ═══════════════════════════════════════════════════════════
export const CreationTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  helperText,
  maxLength,
  rows = 4,
  name,
  id,
  className,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  name?: string;
  id?: string;
  className?: string;
}) => {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const charCount = value?.length ?? 0;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className='text-[13px] font-medium text-white/50'
          >
            {label}
            {required && <span className='ml-0.5 text-red-400'>*</span>}
          </Label>
          {maxLength !== undefined && value !== undefined && (
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount >= maxLength
                  ? 'text-red-400'
                  : charCount >= maxLength * 0.9
                    ? 'text-amber-400'
                    : 'text-white/30'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}

      <Textarea
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        required={required}
        className={cn(
          'resize-none rounded-lg border px-3.5 py-2.5 text-sm text-white placeholder:text-white/25',
          'focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:ring-1',
          'bg-white/4 transition-colors',
          error
            ? 'border-red-500/60 bg-red-500/4 focus-visible:border-red-500/60 focus-visible:ring-red-500/20'
            : 'border-white/10 hover:border-white/20',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />

      {error && (
        <p className='flex items-center gap-1 text-xs text-red-400'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className='text-xs text-white/30'>{helperText}</p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CreationButton
// ═══════════════════════════════════════════════════════════
export const CreationButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  className,
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}) => {
  const variants = {
    primary:
      'bg-primary text-black hover:bg-primary/90 shadow-sm shadow-primary/10',
    outline:
      'border border-white/10 text-white hover:bg-white/5 hover:border-white/20 bg-transparent',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5 bg-transparent',
    danger:
      'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
    success:
      'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-8',
    default: 'px-4 py-2 text-sm h-9',
    lg: 'px-5 py-2.5 text-sm h-10',
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className='h-4 w-4 animate-spin' />}
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
    </Button>
  );
};

// ═══════════════════════════════════════════════════════════
// CreationToggle
// ═══════════════════════════════════════════════════════════
export const CreationToggle = ({
  label,
  description,
  enabled,
  onToggle,
  disabled = false,
  className,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors sm:gap-4 sm:p-4',
      disabled
        ? 'cursor-not-allowed border-white/5 opacity-50'
        : enabled
          ? 'border-primary/20 bg-primary/4'
          : 'border-white/10 bg-white/2 hover:border-white/15',
      className
    )}
  >
    <div className='flex flex-col gap-0.5'>
      {label && (
        <Label
          className={cn(
            'cursor-pointer text-sm font-medium transition-colors',
            disabled ? 'cursor-not-allowed text-white/40' : 'text-white'
          )}
        >
          {label}
        </Label>
      )}
      {description && (
        <span className='text-xs text-white/40'>{description}</span>
      )}
    </div>

    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      disabled={disabled}
      className={cn(
        'data-[state=checked]:bg-primary shrink-0 data-[state=unchecked]:bg-white/10'
      )}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════
// CreationImageUpload
// ═══════════════════════════════════════════════════════════
export const CreationImageUpload = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  description,
  required = false,
  disabled = false,
  error,
  maxSizeMB = 10,
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  recommendedText,
  className,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'video' | 'banner';
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  recommendedText?: string;
  className?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid type. Accepted: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max ${maxSizeMB} MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validErr = validateFile(file);
    if (validErr) {
      setUploadError(validErr);
      return;
    }
    setUploadError('');
    setIsUploading(true);
    try {
      const result = await uploadService.uploadSingle(file, {
        folder: 'boundless/projects',
        transformation:
          aspectRatio === 'square'
            ? { width: 500, height: 500, crop: 'fill' }
            : aspectRatio === 'banner'
              ? { width: 1200, height: 400, crop: 'fill' }
              : undefined,
      });
      if (result.success) {
        onChange(result.data.secure_url);
        setUploadError('');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    },
    [disabled]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [disabled]
  );

  const aspectClasses = {
    square: 'aspect-square max-w-[140px] sm:max-w-[180px]',
    video: 'aspect-video w-full max-w-sm sm:max-w-md',
    banner: 'aspect-[3/1] w-full',
  };

  const displayError = error || uploadError;

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {label && (
        <div className='flex items-center gap-1.5'>
          <Label className='text-[11px] font-bold tracking-wider text-white/40 uppercase'>
            {label}
          </Label>
          {required && (
            <div className='h-1.5 w-1.5 rounded-full bg-red-400/80 shadow-[0_0_8px_rgba(248,113,113,0.4)]' />
          )}
        </div>
      )}

      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition-all duration-300',
          aspectClasses[aspectRatio],
          value
            ? 'border-white/10 bg-white/2'
            : displayError
              ? 'border-red-500/30 bg-red-500/2'
              : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6',
          dragActive &&
            !disabled &&
            'border-primary/50 bg-primary/5 scale-[1.005]',
          (isUploading || disabled) && 'pointer-events-none opacity-60'
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              className='object-cover'
              unoptimized
            />
            {!disabled && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100'>
                <div className='flex gap-2'>
                  <label className='cursor-pointer'>
                    <div className='flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20'>
                      <Upload className='h-3 w-3' />
                      Change
                    </div>
                    <input
                      type='file'
                      className='hidden'
                      onChange={e =>
                        e.target.files?.[0] && handleUpload(e.target.files[0])
                      }
                      accept={acceptedFormats.join(',')}
                      disabled={disabled}
                    />
                  </label>
                  <button
                    type='button'
                    onClick={() => onChange('')}
                    className='flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white'
                  >
                    <X className='h-3 w-3' />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center gap-2.5 p-6 text-center'>
            {isUploading ? (
              <>
                <Loader2 className='text-primary h-8 w-8 animate-spin' />
                <p className='text-primary text-xs font-medium'>Uploading...</p>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    displayError
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-white/5 text-white/25'
                  )}
                >
                  {displayError ? (
                    <AlertCircle className='h-5 w-5' />
                  ) : (
                    <ImageIcon className='h-5 w-5' />
                  )}
                </div>
                <div>
                  <p className='text-xs font-bold text-white/70'>
                    {displayError ? 'Upload failed' : 'Click or drag to upload'}
                  </p>
                  <p className='mt-0.5 text-[10px] tracking-tight text-white/25 uppercase'>
                    {acceptedFormats.map(f => f.split('/')[1]).join(', ')}{' '}
                    &middot; max {maxSizeMB} MB
                  </p>
                </div>
                {!disabled && (
                  <input
                    type='file'
                    className='absolute inset-0 cursor-pointer opacity-0'
                    onChange={e =>
                      e.target.files?.[0] && handleUpload(e.target.files[0])
                    }
                    accept={acceptedFormats.join(',')}
                    disabled={disabled}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {recommendedText && !value && (
        <div className='inline-flex w-fit items-center rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white/80'>
          Recommended: {recommendedText}
        </div>
      )}

      {displayError && (
        <p className='flex items-center gap-1 text-[10px] font-medium text-red-400'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {displayError}
        </p>
      )}
      {!displayError && description && (
        <p className='text-[11px] leading-relaxed text-white/30'>
          {description}
        </p>
      )}
    </div>
  );
};
