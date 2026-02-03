import { Target, DollarSign, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignTeamTab } from '@/components/crowdfunding/campaign-team-tab';
import { CampaignMilestonesTab } from '@/components/crowdfunding/campaign-milestones-tab';
import { CampaignCommentsTab } from '@/components/crowdfunding/campaign-comments-tab';
import { CampaignFundingTab } from '@/components/crowdfunding/campaign-funding-tab';
import { Crowdfunding } from '@/features/projects/types';

interface CampaignTabsProps {
  campaign: Crowdfunding;
}

export function CampaignTabs({ campaign }: CampaignTabsProps) {
  return (
    <Tabs defaultValue='team' className='w-full'>
      <TabsList className='grid w-full grid-cols-4'>
        <TabsTrigger value='team' className='flex items-center gap-2'>
          <Users className='h-4 w-4' />
          Team
        </TabsTrigger>
        <TabsTrigger value='milestones' className='flex items-center gap-2'>
          <Target className='h-4 w-4' />
          Milestones
        </TabsTrigger>
        <TabsTrigger value='comments' className='flex items-center gap-2'>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            />
          </svg>
          Comments
        </TabsTrigger>
        <TabsTrigger value='funding' className='flex items-center gap-2'>
          <DollarSign className='h-4 w-4' />
          Funding
        </TabsTrigger>
      </TabsList>

      <TabsContent value='team' className='mt-6'>
        <CampaignTeamTab team={campaign.team || []} />
      </TabsContent>

      <TabsContent value='milestones' className='mt-6'>
        <CampaignMilestonesTab
          milestones={campaign.milestones || []}
          fundingRaised={campaign.fundingRaised}
          fundingCurrency={campaign.fundingCurrency}
        />
      </TabsContent>

      <TabsContent value='comments' className='mt-6'>
        <CampaignCommentsTab campaignId={campaign.id} />
      </TabsContent>

      <TabsContent value='funding' className='mt-6'>
        <CampaignFundingTab
          contributors={campaign.contributors || []}
          fundingRaised={campaign.fundingRaised}
          fundingGoal={campaign.fundingGoal}
          fundingCurrency={campaign.fundingCurrency}
          fundingEndDate={campaign.fundingEndDate}
        />
      </TabsContent>
    </Tabs>
  );
}
