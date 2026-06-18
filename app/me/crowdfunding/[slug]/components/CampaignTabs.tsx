import { Users, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignTeamTab } from '@/components/crowdfunding/campaign-team-tab';
import { CampaignCommentsTab } from '@/components/crowdfunding/campaign-comments-tab';
import { Crowdfunding } from '@/features/projects/types';

interface CampaignTabsProps {
  campaign: Crowdfunding;
}

// Milestones and Funding/Contributions are now top-level tabs in the campaign
// layout, so this only carries Team + Comments.
export function CampaignTabs({ campaign }: CampaignTabsProps) {
  return (
    <Tabs defaultValue='team' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='team' className='flex items-center gap-2'>
          <Users className='h-4 w-4' />
          Team
        </TabsTrigger>
        <TabsTrigger value='comments' className='flex items-center gap-2'>
          <MessageSquare className='h-4 w-4' />
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value='team' className='mt-6'>
        <CampaignTeamTab team={campaign.team || []} />
      </TabsContent>

      <TabsContent value='comments' className='mt-6'>
        <CampaignCommentsTab campaignId={campaign.id} />
      </TabsContent>
    </Tabs>
  );
}
