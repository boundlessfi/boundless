'use client';

import React, { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Plus,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import {
  useHackathon,
  useMyTeam,
  useHackathonTeams,
} from '@/hooks/hackathon/use-hackathon-queries';
import TeamCard from './teams/TeamCard';
import MyTeamView from './teams/MyTeamView';
import { BoundlessButton } from '@/components/buttons/BoundlessButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateTeamPostModal } from '@/components/hackathons/team-formation/CreateTeamPostModal';
import { ContactTeamModal } from '@/components/hackathons/team-formation/ContactTeamModal';
import { Team } from '@/lib/api/hackathons/teams';
import { useMessages } from '@/components/messages/MessagesProvider';
import { createConversation } from '@/lib/api/messages';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/api';

const isApiError = (e: unknown): e is ApiError =>
  e !== null &&
  typeof e === 'object' &&
  'message' in e &&
  typeof (e as ApiError).message === 'string';

const FindTeam = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);
  const { data: myTeam, isLoading: isMyTeamLoading } = useMyTeam(slug);
  const { openMessages } = useMessages();

  const handleMessageLeader = useCallback(
    async (team: Team, trigger: HTMLElement) => {
      const leaderId = team.leader?.id;
      if (!leaderId) return;
      try {
        const { conversation } = await createConversation(leaderId);
        openMessages({ conversationId: conversation.id, trigger });
      } catch (err) {
        const msg = isApiError(err)
          ? err.message
          : 'Failed to start conversation';
        toast.error(msg);
      }
    },
    [openMessages]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [roleFilter, setRoleFilter] = useState('Role');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { data: teamsResponse, isLoading: isTeamsLoading } = useHackathonTeams(
    slug,
    {
      page,
      limit: 12,
      search: searchQuery,
      category:
        categoryFilter !== 'All Categories' ? categoryFilter : undefined,
      role: roleFilter !== 'Role' ? roleFilter : undefined,
      openOnly: true,
    },
    !!hackathon?.id && hackathon.participantType !== 'INDIVIDUAL'
  );

  const teams = teamsResponse?.data?.teams || [];

  const handleJoin = (team: Team) => {
    setSelectedTeam(team);
    setIsContactModalOpen(true);
  };

  if (!hackathon) return null;

  const isIndividualOnly = hackathon.participantType === 'INDIVIDUAL';

  if (myTeam) {
    return (
      <TabsContent value='team-formation' className='mt-0 w-full outline-none'>
        <MyTeamView team={myTeam} hackathonSlug={slug} />
      </TabsContent>
    );
  }

  return (
    <TabsContent
      value='team-formation'
      className='mt-0 w-full space-y-8 outline-none'
    >
      {isIndividualOnly ? (
        <div className='flex flex-col items-center justify-center space-y-6 rounded-3xl border border-white/5 bg-[#0D0E10] py-24 text-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10'>
            <Info className='h-10 w-10 text-blue-500' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-3xl font-bold text-white'>
              Individual Participants Only
            </h3>
            <p className='max-w-sm text-gray-500'>
              This hackathon is for individual builders only. Team formation is
              not allowed for this event.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-white'>Open Teams</h2>
              <p className='mt-1 text-sm text-gray-500'>
                Find builders to collaborate with on your project.
              </p>
            </div>
            {!myTeam && (
              <BoundlessButton
                variant='default'
                icon={<Plus className='h-4 w-4' />}
                iconPosition='left'
                className='h-11 rounded-xl px-6 font-bold'
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Team
              </BoundlessButton>
            )}
          </div>

          <div className='flex flex-col gap-4 lg:flex-row lg:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500' />
              <input
                type='text'
                placeholder='Search by team name or project...'
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className='focus:border-primary/20 h-12 w-full rounded-xl border border-white/5 bg-[#141517]/50 pr-4 pl-12 text-sm text-white placeholder-gray-500 transition-all outline-none'
              />
            </div>

            <div className='flex w-full flex-col items-center gap-3 lg:w-auto lg:flex-row'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517]/50 px-5 text-sm font-bold text-gray-400 transition-all hover:border-white/10 lg:w-48'>
                    {categoryFilter}{' '}
                    <ChevronDown className='h-4 w-4 text-gray-600' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-[calc(100vw-2rem)] border-white/10 bg-[#0D0E10] text-gray-300 lg:w-48'
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setCategoryFilter('All Categories');
                      setPage(1);
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {hackathon.categories?.map(cat => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setPage(1);
                      }}
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-[#141517]/50 px-5 text-sm font-bold text-gray-400 transition-all hover:border-white/10 lg:w-48'>
                    {roleFilter}{' '}
                    <ChevronDown className='h-4 w-4 text-gray-600' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-[calc(100vw-2rem)] border-white/10 bg-[#0D0E10] text-gray-300 lg:w-48'
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setRoleFilter('Role');
                      setPage(1);
                    }}
                  >
                    All Roles
                  </DropdownMenuItem>
                  {[
                    'Frontend',
                    'Backend',
                    'Smart Contract',
                    'UI/UX',
                    'Rust',
                  ].map(role => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => {
                        setRoleFilter(role);
                        setPage(1);
                      }}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isTeamsLoading || isMyTeamLoading ? (
            <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-3xl border border-white/5 bg-[#0D0E10] py-20 opacity-50'>
              <Loader2 className='text-primary h-10 w-10 animate-spin' />
              <p className='text-sm font-medium tracking-widest text-gray-500 uppercase'>
                Loading Teams...
              </p>
            </div>
          ) : teams.length > 0 ? (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-1'>
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onJoin={() => handleJoin(team)}
                  onMessageLeader={handleMessageLeader}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center space-y-6 rounded-3xl border border-white/5 bg-[#0D0E10] py-24 text-center'>
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white/5'>
                <Sparkles className='h-10 w-10 text-gray-600' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-3xl font-black text-white'>
                  No Teams Found
                </h3>
                <p className='max-w-sm text-gray-500'>
                  Be the first to start a revolution! Create a team and invite
                  builders to join your journey.
                </p>
              </div>
            </div>
          )}

          <CreateTeamPostModal
            hackathonSlugOrId={slug}
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
          />

          <ContactTeamModal
            open={isContactModalOpen}
            onOpenChange={setIsContactModalOpen}
            team={selectedTeam}
          />
        </>
      )}
    </TabsContent>
  );
};

export default FindTeam;
