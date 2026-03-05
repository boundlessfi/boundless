'use client';

import Image from 'next/image';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Real token images: XLM (Stellar), USDC, EURC */
const ASSET_ICON_SRC: Record<string, string> = {
  XLM: '/assets/xlm.svg',
  USDC: '/assets/usdc.svg',
  EURC: '/assets/eurc.png',
};

const getAssetIconSrc = (assetCode: string): string | null => {
  const code = assetCode?.toUpperCase() ?? '';
  return ASSET_ICON_SRC[code] ?? null;
};

interface AssetIconProps {
  /** Asset code (e.g. 'XLM', 'USDC', 'EURC') or 'native' for XLM */
  assetCode: string;
  size?: number;
  className?: string;
}

export function AssetIcon({ assetCode, size = 40, className }: AssetIconProps) {
  const code = assetCode === 'native' ? 'XLM' : assetCode;
  const src = getAssetIconSrc(code);

  if (src) {
    return (
      <div
        className={cn(
          'bg-muted flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={code}
          width={size}
          height={size}
          className='object-contain'
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-full',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Coins style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
