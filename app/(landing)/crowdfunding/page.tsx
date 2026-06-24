import CrowdfundingExplore from '@/features/crowdfunding/components/CrowdfundingExplore';
import CrowdfundingPageHero from '@/features/crowdfunding/components/CrowdfundingPageHero';

export default function CrowdfundingPage() {
  return (
    <div className='bg-background min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8'>
        <div className='space-y-12'>
          <CrowdfundingPageHero />
          <CrowdfundingExplore />
        </div>
      </div>
    </div>
  );
}
