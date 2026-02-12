'use client';

import React from 'react';
import { Github, Twitter, Linkedin, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  username?: string;
}

interface TeamSectionProps {
  teamMembers: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ teamMembers }) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='grid grid-cols-1 gap-4 lg:grid-cols-2'
      >
        {teamMembers.length > 0 ? (
          teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='group bg-background-card/20 hover:bg-background-card/40 flex items-center gap-4 rounded-xl border border-gray-900/60 p-4 transition-all hover:border-gray-800'
            >
              <Avatar className='h-12 w-12 border border-gray-800 transition-transform group-hover:scale-105'>
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className='bg-background-card font-bold text-gray-400'>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='min-w-0 flex-1 space-y-0.5'>
                <div className='flex items-center gap-2'>
                  <p className='truncate text-sm font-bold text-white'>
                    {member.name}
                  </p>
                  {member.role.toLowerCase().includes('lead') && (
                    <span className='bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase'>
                      Lead
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-1.5'>
                  <p className='truncate text-xs font-medium text-gray-500'>
                    @{member.username || 'unknown'}
                  </p>
                  <div className='h-1 w-1 rounded-full bg-gray-800' />
                  <p className='truncate text-[10px] font-bold tracking-tight text-gray-600 uppercase'>
                    {member.role}
                  </p>
                </div>

                <div className='flex gap-2 pt-1'>
                  <Github className='h-3 w-3 text-gray-700 transition-colors' />
                  <Twitter className='h-3 w-3 text-gray-700 transition-colors' />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className='col-span-full py-20 text-center opacity-50'>
            <Users className='mx-auto mb-4 h-12 w-12 text-gray-700' />
            <p className='text-sm font-bold tracking-widest text-gray-500 uppercase'>
              No team members found
            </p>
          </div>
        )}
      </motion.div>
    </ScrollArea>
  );
};
