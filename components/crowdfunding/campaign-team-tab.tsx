'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image?: string;
}

interface CampaignTeamTabProps {
  team: TeamMember[];
}

export function CampaignTeamTab({ team }: CampaignTeamTabProps) {
  if (!team || team.length === 0) {
    return (
      <Card className='bg-background border-border/10'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Users className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold text-white'>
            No Team Members
          </h3>
          <p className='text-center text-white/60'>
            Team members will be displayed here once added to the campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <Users className='h-5 w-5' />
          Team Members ({team.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {team.map((member, index) => (
            <div
              key={index}
              className='bg-muted/10 hover:bg-muted/20 flex items-center gap-3 rounded-lg p-4 transition-colors'
            >
              <Avatar className='h-12 w-12'>
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium text-white'>{member.name}</p>
                <p className='truncate text-sm text-white/60'>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
