'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getPublicContributors,
  type PublicContributorsResponse,
} from '@/lib/api/hackathons/partners';
import type { SponsorPartner } from '@/types/hackathon/core';

interface SponsorsSectionProps {
  slug: string;
  marketingPartners?: SponsorPartner[] | null;
}

interface PartnerCardProps {
  name: string;
  logo?: string | null;
  link?: string | null;
  meta?: React.ReactNode;
}

function PartnerCard({ name, logo, link, meta }: PartnerCardProps) {
  const inner = (
    <div className='hover:border-primary/30 flex items-center gap-4 rounded-xl border border-white/5 bg-[#141517] p-4 transition-all'>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className='h-12 w-12 rounded-lg object-contain'
        />
      ) : (
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-sm font-medium text-white'>
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <div className='truncate font-semibold text-white'>{name}</div>
        {meta && <div className='font-mono text-sm text-gray-400'>{meta}</div>}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target='_blank' rel='noreferrer'>
        {inner}
      </a>
    );
  }
  return inner;
}

export default function SponsorsSection({
  slug,
  marketingPartners,
}: SponsorsSectionProps) {
  const [data, setData] = useState<PublicContributorsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicContributors(slug);
        if (!cancelled) setData(res.data ?? null);
      } catch {
        // Silent fail — sponsors section is non-critical.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const contributors = data?.contributors ?? [];
  const validMarketing = (marketingPartners ?? []).filter(
    p => p && (p.sponsorName || p.sponsorLogo)
  );

  if (loading) {
    return (
      <section className='space-y-6'>
        <h2 className='text-xl font-bold text-white'>Sponsors & Partners</h2>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Loading sponsors...
        </div>
      </section>
    );
  }

  if (contributors.length === 0 && validMarketing.length === 0) {
    return null;
  }

  return (
    <section className='space-y-10'>
      {contributors.length > 0 && data && (
        <div className='space-y-6'>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <h2 className='text-xl font-bold text-white'>Sponsors</h2>
              <p className='mt-1 text-sm text-gray-400'>
                Partners contributing directly into this hackathon&apos;s prize
                pool.
              </p>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-400'>
                {data.totalConfirmedCount}{' '}
                {data.totalConfirmedCount === 1 ? 'partner' : 'partners'}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {contributors.map(c => (
              <PartnerCard
                key={c.id}
                name={c.partnerName}
                logo={c.partnerLogo}
                link={c.partnerLink}
              />
            ))}
          </div>
        </div>
      )}

      {validMarketing.length > 0 && (
        <div className='space-y-6'>
          <div>
            <h2 className='text-xl font-bold text-white'>Partners</h2>
            <p className='mt-1 text-sm text-gray-400'>
              Organizations supporting this hackathon as media, technology, or
              program partners.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {validMarketing.map((p, i) => (
              <PartnerCard
                key={`${p.sponsorName || 'partner'}-${i}`}
                name={p.sponsorName || 'Partner'}
                logo={p.sponsorLogo}
                link={p.partnerLink}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
