'use client';

import { use } from 'react';
import Link from 'next/link';
import { useHackathon, useTeam } from '@/hooks/hackathon/use-hackathon-queries';
import { Button } from '@/components/ui/button';
import BasicAvatar from '@/components/avatars/BasicAvatar';
import { readTeamContact } from '@/lib/api/hackathons/teams';
import {
  ArrowLeft,
  Calendar,
  Crown,
  Loader2,
  Mail,
  Users,
  XCircle,
} from 'lucide-react';

export default function TeamDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; teamId: string }>;
}) {
  const { slug, teamId } = use(params);

  const { data: hackathon } = useHackathon(slug);
  const { data: team, isLoading, isError } = useTeam(slug, teamId);

  const formattedCreatedAt = team?.createdAt
    ? new Date(team.createdAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const status = team?.isOpen ? 'OPEN' : 'CLOSED';

  return (
    <div className='min-h-screen bg-black px-5 py-5 text-white md:px-[50px] lg:px-[100px]'>
      <div className='mx-auto max-w-[1100px] pb-16'>
        <Link href={`/hackathons/${slug}?tab=team-formation`}>
          <Button
            variant='ghost'
            className='mb-6 pl-0 text-gray-400 hover:text-white'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to {hackathon?.name ?? 'Hackathon'}
          </Button>
        </Link>

        {isLoading ? (
          <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-[#0D0E10]'>
            <Loader2 className='text-primary h-10 w-10 animate-spin' />
            <p className='text-sm tracking-widest text-gray-500 uppercase'>
              Loading team...
            </p>
          </div>
        ) : isError || !team ? (
          <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-[#0D0E10] text-center'>
            <XCircle className='h-10 w-10 text-gray-600' />
            <div className='space-y-1'>
              <h2 className='text-2xl font-bold text-white'>Team not found</h2>
              <p className='text-sm text-gray-500'>
                This team may have been disbanded or never existed.
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='rounded-2xl border border-white/5 bg-[#0A0B0D] p-8'>
              <div className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex items-start gap-4'>
                  <div className='text-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#232B20] text-2xl font-black'>
                    {team.teamName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className='text-3xl font-bold text-white uppercase'>
                      {team.teamName}
                    </h1>
                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      <span
                        className={
                          team.isOpen
                            ? 'rounded border border-[#2A3347] bg-[#1E232F]/50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#5470B8] uppercase'
                            : 'rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase'
                        }
                      >
                        {status}
                      </span>
                      <span className='inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase'>
                        <Users className='h-3 w-3' />
                        {team.memberCount}/{team.maxSize} builders
                      </span>
                      {formattedCreatedAt && (
                        <span className='inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase'>
                          <Calendar className='h-3 w-3' />
                          Created {formattedCreatedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {team.description && (
                <p className='mt-6 text-base leading-relaxed text-gray-300'>
                  {team.description}
                </p>
              )}
            </div>

            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='space-y-6 lg:col-span-2'>
                <div className='rounded-2xl border border-white/5 bg-[#0A0B0D] p-6'>
                  <h2 className='mb-4 text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                    Members
                  </h2>
                  <div className='space-y-3'>
                    {team.members && team.members.length > 0 ? (
                      team.members.map(member => {
                        const isLeader = member.userId === team.leader?.id;
                        const profileHref = member.username
                          ? `/profile/${member.username}`
                          : null;
                        const content = (
                          <>
                            <div className='flex items-center gap-3'>
                              <BasicAvatar
                                image={member.image ?? ''}
                                name={member.name}
                                username={member.username ?? member.userId}
                                truncate={false}
                              />
                              {isLeader && (
                                <span className='inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase'>
                                  <Crown className='h-3 w-3' />
                                  Leader
                                </span>
                              )}
                            </div>
                            {!isLeader && (
                              <span className='text-[10px] font-bold tracking-wider text-gray-500 uppercase'>
                                {member.role}
                              </span>
                            )}
                          </>
                        );
                        return profileHref ? (
                          <a
                            key={member.userId}
                            href={profileHref}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-between rounded-xl border border-white/5 bg-[#0D0F12] p-4 transition-colors hover:border-white/10 hover:bg-white/5'
                          >
                            {content}
                          </a>
                        ) : (
                          <div
                            key={member.userId}
                            className='flex items-center justify-between rounded-xl border border-white/5 bg-[#0D0F12] p-4'
                          >
                            {content}
                          </div>
                        );
                      })
                    ) : (
                      <p className='text-sm text-gray-500'>
                        No members listed.
                      </p>
                    )}
                  </div>
                </div>

                {team.lookingFor && team.lookingFor.length > 0 && (
                  <div className='rounded-2xl border border-white/5 bg-[#0A0B0D] p-6'>
                    <h2 className='mb-4 text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                      Roles Needed
                    </h2>
                    <div className='flex flex-wrap gap-2'>
                      {team.lookingFor.map((role, idx) => (
                        <div
                          key={idx}
                          className='rounded-xl border border-[#232B35] bg-[#14191F] px-4 py-2 text-sm font-bold text-[#E0E0E0]'
                        >
                          {role.role}
                          {role.skills && role.skills.length > 0 && (
                            <span className='ml-2 text-xs font-normal text-gray-500'>
                              {role.skills.join(', ')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-6'>
                {team.leader && (
                  <div className='rounded-2xl border border-white/5 bg-[#0A0B0D] p-6'>
                    <h2 className='mb-4 text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                      Team Leader
                    </h2>
                    {team.leader.username ? (
                      <a
                        href={`/profile/${team.leader.username}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='-m-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5'
                      >
                        <BasicAvatar
                          image={team.leader.image ?? ''}
                          name={team.leader.name}
                          username={team.leader.username}
                          truncate={false}
                        />
                      </a>
                    ) : (
                      <BasicAvatar
                        image={team.leader.image ?? ''}
                        name={team.leader.name}
                        username={team.leader.id}
                        truncate={false}
                      />
                    )}
                  </div>
                )}

                {(() => {
                  const contact = readTeamContact(team.contactInfo);
                  if (!contact) return null;
                  return (
                    <div className='rounded-2xl border border-white/5 bg-[#0A0B0D] p-6'>
                      <h2 className='mb-4 text-[10px] font-black tracking-[0.2em] text-[#555555] uppercase'>
                        Contact
                      </h2>
                      <div className='flex items-start gap-3 text-sm text-gray-300'>
                        <Mail className='mt-0.5 h-4 w-4 shrink-0 text-gray-500' />
                        <span className='break-all'>{contact.value}</span>
                      </div>
                      <p className='mt-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase'>
                        Via {contact.method}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
