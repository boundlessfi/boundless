'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HackathonBannerProps {
  banner?: string | null;
  name?: string;
  /** Height class, eg "h-44" or "h-64". Defaults to a responsive value. */
  heightClassName?: string;
  /** Optional overlay content rendered on top of the banner. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Hero banner for judge surfaces. Falls back to a brand-tinted gradient
 * when no image is available, so empty hackathons still feel intentional.
 */
export function HackathonBanner({
  banner,
  name,
  heightClassName = 'h-40 sm:h-52',
  children,
  className,
}: HackathonBannerProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-white/5',
        heightClassName,
        className
      )}
    >
      {banner ? (
        <Image
          src={banner}
          alt={`${name ?? 'Hackathon'} banner`}
          fill
          sizes='(max-width: 768px) 100vw, 960px'
          className='object-cover'
          priority={false}
        />
      ) : (
        <div
          className='absolute inset-0'
          style={{
            background:
              'radial-gradient(120% 80% at 80% 0%, rgba(46,237,170,0.18) 0%, rgba(46,237,170,0) 55%), linear-gradient(135deg, #0f1411 0%, #060708 100%)',
          }}
        >
          <div
            className='absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      )}

      <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent' />

      {children && (
        <div className='absolute inset-0 flex items-end p-5 sm:p-6'>
          <div className='w-full'>{children}</div>
        </div>
      )}
    </div>
  );
}
