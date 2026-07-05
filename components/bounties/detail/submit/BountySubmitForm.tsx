'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  FileText,
  Github,
  Loader2,
  PlaySquare,
  Twitter,
  UploadCloud,
  Wallet,
  X,
} from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { uploadService } from '@/lib/api/upload';
import { useWalletContext } from '@/components/providers/wallet-provider';
import {
  useSubmitBounty,
  ESCROW_PHASE_LABEL,
  type BountyPublic,
} from '@/features/bounties';

const PHASE_LABEL = {
  ...ESCROW_PHASE_LABEL,
  starting: 'Preparing submission…',
  polling: 'Anchoring on-chain…',
};

type Requirements = BountyPublic['submissionRequirements'];

function makeSchema(req: Requirements) {
  const url = z.string().trim().url('Enter a valid URL');
  // Optional fields accept a valid URL or an empty string (never undefined, so
  // the resolver output stays a uniform `string` for every field).
  const optionalUrl = z.union([url, z.literal('')]);
  return z.object({
    contentUri: url,
    documentationUrl: req.documentation ? url : optionalUrl,
    tweetUrl: req.tweet ? url : optionalUrl,
    demoVideoUrl: req.demoVideo ? url : optionalUrl,
  });
}

type FormValues = {
  contentUri: string;
  documentationUrl: string;
  tweetUrl: string;
  demoVideoUrl: string;
};

/** Icon-led URL field matching the entry form layout. */
function LinkField({
  icon,
  error,
  required,
  ...props
}: {
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className='flex items-center gap-3'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400'>
          {icon}
        </div>
        <Input
          type='url'
          className='h-12 flex-1 border-zinc-800 bg-zinc-900/40 text-white placeholder:text-zinc-600'
          {...props}
        />
      </div>
      {required && <span className='sr-only'>required</span>}
      {error && <p className='mt-1.5 text-xs text-red-500'>{error}</p>}
    </div>
  );
}

export default function BountySubmitForm({ bounty }: { bounty: BountyPublic }) {
  const router = useRouter();
  const { walletAddress } = useWalletContext();
  const submit = useSubmitBounty(bounty.id);
  const req = bounty.submissionRequirements;

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(makeSchema(req)),
    mode: 'onBlur',
    defaultValues: {
      contentUri: '',
      documentationUrl: '',
      tweetUrl: '',
      demoVideoUrl: '',
    },
  });

  useEffect(() => {
    if (submit.isCompleted) {
      toast.success('Work submitted and anchored on-chain.');
      router.push(`/bounties/${bounty.id}`);
    } else if (submit.isFailed) {
      toast.error(submit.error || 'Submission failed.');
    }
  }, [submit.isCompleted, submit.isFailed, submit.error, bounty.id, router]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setMediaError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/)) {
          toast.error('Images only (SVG, PNG, JPG, GIF).');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Each image must be under 5MB.');
          continue;
        }
        const res = await uploadService.uploadSingle(file, {
          folder: 'boundless/bounties/submissions/media',
          tags: ['bounty', 'submission', 'media'],
        });
        const url = res?.data?.secure_url;
        if (res?.success && url) setMediaUrls(prev => [...prev, url]);
        else toast.error('Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!walletAddress) {
      toast.error('Connect a wallet to submit.');
      return;
    }
    if (req.media && mediaUrls.length === 0) {
      setMediaError('At least one image is required.');
      return;
    }
    void submit.run({
      applicantAddress: walletAddress,
      contentUri: data.contentUri.trim(),
      documentationUrl: data.documentationUrl.trim() || undefined,
      tweetUrl: data.tweetUrl.trim() || undefined,
      demoVideoUrl: data.demoVideoUrl.trim() || undefined,
      mediaUrls: mediaUrls.length ? mediaUrls : undefined,
    });
  };

  const running = submit.isRunning;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full space-y-10'>
      <header>
        <h1 className='text-2xl font-bold text-white sm:text-3xl'>
          Submit Your Entry
        </h1>
        <p className='mt-2 text-sm text-zinc-400'>
          <span className='font-semibold text-zinc-300'>Tip:</span> If your
          submission includes multiple assets, organize them in a single public
          folder (e.g. Google Drive or Dropbox) and share that link as your
          primary submission.
        </p>
      </header>

      {/* Primary submission */}
      <section className='space-y-2'>
        <label className='text-sm font-medium text-zinc-200'>
          Link to Your Submission <span className='text-red-400'>*</span>
        </label>
        <LinkField
          icon={<Github className='h-5 w-5' />}
          placeholder='https://'
          error={errors.contentUri?.message}
          {...register('contentUri')}
        />
        <p className='text-sm text-zinc-500'>
          Share documentation, setup instructions, or API references to help
          reviewers understand your implementation.
        </p>
        <LinkField
          icon={<FileText className='h-5 w-5' />}
          placeholder='https://'
          required={req.documentation}
          error={errors.documentationUrl?.message}
          {...register('documentationUrl')}
        />
      </section>

      {/* Other links */}
      <section className='space-y-4'>
        <div>
          <h2 className='text-lg font-bold text-white'>Other Links</h2>
          <p className='text-sm text-zinc-500'>
            Make sure these links are accessible by everyone.
          </p>
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm text-zinc-300'>
            Tweet Link{req.tweet && <span className='text-red-400'> *</span>}
          </label>
          <LinkField
            icon={<Twitter className='h-5 w-5' />}
            placeholder='https://'
            required={req.tweet}
            error={errors.tweetUrl?.message}
            {...register('tweetUrl')}
          />
        </div>

        <div className='space-y-1.5'>
          <label className='text-sm text-zinc-300'>
            Demo Video
            {req.demoVideo && <span className='text-red-400'> *</span>}
          </label>
          <LinkField
            icon={<PlaySquare className='h-5 w-5' />}
            placeholder='https://'
            required={req.demoVideo}
            error={errors.demoVideoUrl?.message}
            {...register('demoVideoUrl')}
          />
        </div>
      </section>

      {/* Media */}
      <section className='space-y-3'>
        <div>
          <h2 className='text-lg font-bold text-white'>
            Media{req.media && <span className='text-red-400'> *</span>}
          </h2>
          <p className='text-sm text-zinc-500'>
            Add images to help others understand your project better.
          </p>
        </div>

        {mediaUrls.length > 0 && (
          <div className='flex flex-wrap gap-3'>
            {mediaUrls.map(url => (
              <div
                key={url}
                className='group relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-800'
              >
                <Image
                  src={url}
                  alt='Submission media'
                  fill
                  unoptimized
                  className='object-cover'
                />
                <button
                  type='button'
                  onClick={() =>
                    setMediaUrls(prev => prev.filter(u => u !== url))
                  }
                  className='absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
                  aria-label='Remove image'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
          className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-10 text-center transition-colors hover:border-zinc-600 hover:bg-zinc-900/50'
        >
          <input
            type='file'
            accept='image/svg+xml,image/png,image/jpeg,image/gif'
            multiple
            className='hidden'
            onChange={e => void handleFiles(e.target.files)}
          />
          {uploading ? (
            <Loader2 className='h-6 w-6 animate-spin text-zinc-400' />
          ) : (
            <UploadCloud className='h-6 w-6 text-zinc-500' />
          )}
          <p className='text-sm'>
            <span className='text-primary font-medium'>Click to upload</span>
            <span className='text-zinc-500'> or drag and drop</span>
          </p>
          <p className='text-xs text-zinc-600'>SVG, PNG, JPG or GIF</p>
        </label>
        {mediaError && <p className='text-xs text-red-500'>{mediaError}</p>}
      </section>

      {/* Submit */}
      <div className='border-t border-zinc-800 pt-6'>
        {!walletAddress ? (
          <p className='flex items-center gap-2 text-sm text-zinc-400'>
            <Wallet className='h-4 w-4' />
            Connect a wallet to submit.
          </p>
        ) : running ? (
          <div className='flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300'>
            <Loader2 className='text-primary h-4 w-4 animate-spin' />
            {PHASE_LABEL[submit.phase] || 'Working…'}
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <BoundlessButton type='submit' size='lg' disabled={uploading}>
              Submit entry
            </BoundlessButton>
            <BoundlessButton
              type='button'
              variant='outline'
              size='lg'
              onClick={() => router.push(`/bounties/${bounty.id}`)}
            >
              Cancel
            </BoundlessButton>
          </div>
        )}
      </div>
    </form>
  );
}
