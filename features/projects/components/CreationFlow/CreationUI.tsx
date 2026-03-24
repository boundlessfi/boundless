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

// ── Shadcn primitives ────────────────────────────────────────
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════
// CreationInput — shadcn Input + themed label / helper
// ═══════════════════════════════════════════════════════════
export const CreationInput = ({
  label,
  placeholder,
  value,
  onChange,
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
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {/* Label row */}
      {label && (
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'
          >
            {label}
            {required && <span className='ml-1 text-red-400'>*</span>}
          </Label>
          {maxLength !== undefined && value !== undefined && (
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums transition-colors',
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

      {/* Input — shadcn base, override colours for dark theme */}
      <Input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        required={required}
        className={cn(
          'rounded-xl border px-5 py-4 text-sm text-white placeholder:text-white/20',
          'focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:ring-1',
          'bg-white/5 transition-all',
          error
            ? 'border-red-500/50 bg-red-500/5 focus-visible:border-red-500/60 focus-visible:ring-red-500/20'
            : 'border-white/5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />

      {/* Helper / Error */}
      {(error || helperText) && (
        <div className='flex items-start gap-1.5'>
          {error && (
            <AlertCircle className='mt-0.5 h-3 w-3 shrink-0 text-red-400' />
          )}
          <p
            className={cn(
              'text-[10px] font-medium',
              error ? 'text-red-400' : 'text-white/30'
            )}
          >
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CreationTextarea — shadcn Textarea + themed label / helper
// ═══════════════════════════════════════════════════════════
export const CreationTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  helperText,
  maxLength,
  rows = 5,
  name,
  id,
  className,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <Label
            htmlFor={inputId}
            className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'
          >
            {label}
            {required && <span className='ml-1 text-red-400'>*</span>}
          </Label>
          {maxLength !== undefined && value !== undefined && (
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums transition-colors',
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
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        required={required}
        className={cn(
          'resize-none rounded-xl border px-5 py-4 text-sm text-white placeholder:text-white/20',
          'focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:ring-1',
          'bg-white/5 transition-all',
          error
            ? 'border-red-500/50 bg-red-500/5 focus-visible:border-red-500/60 focus-visible:ring-red-500/20'
            : 'border-white/5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />

      {(error || helperText) && (
        <div className='flex items-start gap-1.5'>
          {error && (
            <AlertCircle className='mt-0.5 h-3 w-3 shrink-0 text-red-400' />
          )}
          <p
            className={cn(
              'text-[10px] font-medium',
              error ? 'text-red-400' : 'text-white/30'
            )}
          >
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CreationButton — shadcn Button base with custom variants
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
      'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/10',
    outline:
      'border border-white/10 text-white hover:bg-white/5 hover:border-white/20 bg-transparent',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5 bg-transparent',
    danger:
      'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20',
    success:
      'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white border border-green-500/20',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-[10px] h-auto',
    default: 'px-6 py-4 text-[11px] h-auto',
    lg: 'px-8 py-5 text-xs h-auto',
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl font-black tracking-[0.2em] uppercase transition-all active:scale-[0.98]',
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
// CreationToggle — shadcn Switch with themed label row
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
      'flex items-center justify-between rounded-2xl border p-5 transition-all',
      disabled
        ? 'cursor-not-allowed border-white/5 bg-white/2 opacity-50'
        : 'border-white/5 bg-white/5 hover:border-white/10',
      className
    )}
  >
    <div className='flex flex-col gap-1'>
      {label && (
        <Label
          className={cn(
            'cursor-pointer text-sm font-bold transition-colors',
            disabled ? 'cursor-not-allowed text-white/40' : 'text-white'
          )}
        >
          {label}
        </Label>
      )}
      {description && (
        <span className='text-[10px] font-medium text-white/30'>
          {description}
        </span>
      )}
      <span className='text-[10px] font-medium tracking-widest text-white/30 uppercase'>
        {enabled ? 'Active' : 'Inactive'}
      </span>
    </div>

    {/* Shadcn Switch — styled to match primary colour */}
    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      disabled={disabled}
      className={cn(
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10',
        ''
      )}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════
// CreationImageUpload — custom drag-and-drop + Cloudinary
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
    square: 'aspect-square max-w-[220px]',
    video: 'aspect-video w-full max-w-md',
    banner: 'aspect-[3/1] w-full',
  };

  const displayError = error || uploadError;

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {/* Label */}
      {label && (
        <Label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
          {label}
          {required && <span className='ml-1 text-red-400'>*</span>}
        </Label>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
          aspectClasses[aspectRatio],
          value
            ? 'border-primary/20 bg-primary/5'
            : displayError
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-white/5 bg-white/2 hover:border-white/20 hover:bg-white/4',
          dragActive &&
            !disabled &&
            'border-primary bg-primary/10 scale-[1.02]',
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
                    <div className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20'>
                      <Upload className='h-3.5 w-3.5' />
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
                    className='flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 backdrop-blur-sm transition-all hover:bg-red-500 hover:text-white'
                  >
                    <X className='h-3.5 w-3.5' />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center gap-3 p-8 text-center'>
            {isUploading ? (
              <>
                <Loader2 className='text-primary h-10 w-10 animate-spin' />
                <p className='text-primary text-xs font-bold'>Uploading…</p>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                    displayError
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-white/5 text-white/20'
                  )}
                >
                  {displayError ? (
                    <AlertCircle className='h-7 w-7' />
                  ) : (
                    <ImageIcon className='h-7 w-7' />
                  )}
                </div>
                <div>
                  <p className='text-sm font-bold text-white/60'>
                    {displayError ? 'Upload failed' : 'Click or drag to upload'}
                  </p>
                  <p className='mt-1.5 text-[10px] font-medium tracking-wider text-white/30 uppercase'>
                    {acceptedFormats.map(f => f.split('/')[1]).join(', ')} · max{' '}
                    {maxSizeMB} MB
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

      {/* Description or Error */}
      {(displayError || description) && (
        <div className='flex items-start gap-1.5'>
          {displayError && (
            <AlertCircle className='mt-0.5 h-3 w-3 shrink-0 text-red-400' />
          )}
          <p
            className={cn(
              'text-[10px] font-medium',
              displayError ? 'text-red-400' : 'text-white/30 italic'
            )}
          >
            {displayError || description}
          </p>
        </div>
      )}
    </div>
  );
};
