'use client';

import { useParams } from 'next/navigation';
import { ExternalLink, Sparkles } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { useHackathon } from '@/hooks/hackathon/use-hackathon-queries';
import type { SponsorPartner } from '@/lib/api/hackathons';

// Read helpers fall back to the legacy field names for back-compat.
const readName = (sp: SponsorPartner) => sp.name ?? sp.sponsorName ?? '';
const readLogo = (sp: SponsorPartner) => sp.logo ?? sp.sponsorLogo ?? '';
const readLink = (sp: SponsorPartner) => sp.link ?? sp.partnerLink ?? '';

const SponsorsTab = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);

  const sponsors = (hackathon?.sponsorsPartners ?? []).filter(
    sp => readName(sp) || readLogo(sp)
  );

  return (
    <TabsContent
      value='sponsors'
      className='mt-0 w-full space-y-8 outline-none'
    >
      <div className='mb-10'>
        <h2 className='text-2xl font-bold text-white'>
          Sponsors &amp; Partners
        </h2>
        <p className='mt-1 text-gray-400'>
          The organizations supporting this hackathon.
        </p>
      </div>

      {sponsors.length === 0 ? (
        <div className='flex flex-col items-center justify-center space-y-6 rounded-3xl border border-white/5 bg-[#0D0E10] py-24 text-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/5'>
            <Sparkles className='h-10 w-10 text-gray-600' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-2xl font-bold text-white'>
              No sponsors listed
            </h3>
            <p className='text-gray-500'>
              Check back later — sponsors will appear here once announced.
            </p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {sponsors.map((sp, idx) => {
            const name = readName(sp);
            const logo = readLogo(sp);
            const link = readLink(sp);
            const key = sp.id ?? `${name}-${idx}`;

            const cardBody = (
              <div className='group hover:border-primary/30 relative flex aspect-square h-full w-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0D0E10] transition-all'>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={name || 'Sponsor logo'}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center bg-white/5 text-3xl font-bold text-gray-500'>
                    {(name || '?').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8'>
                  <p className='line-clamp-1 text-xs font-bold text-white drop-shadow-md'>
                    {name || 'Unnamed sponsor'}
                  </p>
                  {link && (
                    <p className='group-hover:text-primary inline-flex items-center gap-1 text-[10px] text-gray-300 transition-colors'>
                      Visit
                      <ExternalLink className='h-2.5 w-2.5' />
                    </p>
                  )}
                </div>
              </div>
            );

            return link ? (
              <a
                key={key}
                href={link}
                target='_blank'
                rel='noopener noreferrer'
                className='block'
              >
                {cardBody}
              </a>
            ) : (
              <div key={key}>{cardBody}</div>
            );
          })}
        </div>
      )}
    </TabsContent>
  );
};

export default SponsorsTab;
