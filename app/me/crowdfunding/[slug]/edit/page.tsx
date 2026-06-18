'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useCampaign } from '@/features/crowdfunding';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * The standalone edit form was replaced by the creation wizard, which now
 * supports resume-load. This route only resolves the slug to the campaign id
 * and forwards to the wizard, keeping old bookmarked /edit URLs working.
 */
export default function CampaignEditRedirect({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: campaign, error } = useCampaign(slug);

  useEffect(() => {
    if (campaign?.id) {
      router.replace(`/crowdfunding/new?campaignId=${campaign.id}`);
    } else if (error) {
      router.replace('/me/crowdfunding');
    }
  }, [campaign?.id, error, router]);

  return (
    <div className='flex min-h-screen items-center justify-center gap-3 text-zinc-400'>
      <Loader2 className='h-5 w-5 animate-spin' />
      Opening editor...
    </div>
  );
}
