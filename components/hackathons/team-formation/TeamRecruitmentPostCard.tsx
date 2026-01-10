'use client';

import React from 'react';
import {
  Mail,
  MessageCircle,
  Users,
  Edit,
  X,
  Eye,
  ExternalLink,
  Pin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type TeamRecruitmentPost } from '@/lib/api/hackathons';
import { toast } from 'sonner';

interface TeamRecruitmentPostCardProps {
  post: TeamRecruitmentPost;
  onContactClick?: (post: TeamRecruitmentPost) => void;
  onEditClick?: (post: TeamRecruitmentPost) => void;
  onDeleteClick?: (post: TeamRecruitmentPost) => void;
  isMyPost?: boolean;
  onTrackContact?: (postId: string) => void;
  isPinned?: boolean;
}

const getContactMethodIcon = (
  method?: TeamRecruitmentPost['contactMethod'],
  contactInfo?: string
) => {
  if (method) {
    switch (method) {
      case 'email':
        return Mail;
      case 'telegram':
        return MessageCircle;
      case 'discord':
        return MessageCircle;
      case 'github':
        return ExternalLink;
      default:
        return Mail;
    }
  }

  // Infer from contact info if method is missing
  if (contactInfo?.includes('@') && !contactInfo.startsWith('@')) return Mail;
  if (contactInfo?.includes('t.me/') || contactInfo?.startsWith('@'))
    return MessageCircle; // Telegram usually
  if (contactInfo?.includes('github.com')) return ExternalLink;
  return Mail;
};

const getContactMethodLabel = (
  method?: TeamRecruitmentPost['contactMethod'],
  contactInfo?: string
) => {
  if (method) {
    switch (method) {
      case 'email':
        return 'Email';
      case 'telegram':
        return 'Telegram';
      case 'discord':
        return 'Discord';
      case 'github':
        return 'GitHub';
      default:
        return 'Contact';
    }
  }

  // Infer from contact info
  if (contactInfo?.includes('@') && !contactInfo.startsWith('@'))
    return 'Email';
  if (contactInfo?.includes('t.me/') || contactInfo?.startsWith('@'))
    return 'Telegram';
  if (contactInfo?.includes('github.com')) return 'GitHub';
  return 'Contact';
};

const handleContact = (
  contactInfo: string,
  method?: TeamRecruitmentPost['contactMethod'],
  onTrackContact?: (postId: string) => void,
  postId?: string
) => {
  if (onTrackContact && postId) {
    onTrackContact(postId);
  }

  // Clean contact info (remove quotes if present)
  const cleanContact = contactInfo.replace(/^"|"$/g, '');

  // If method is provided, use it
  if (method) {
    switch (method) {
      case 'email':
        window.location.href = `mailto:${cleanContact}`;
        break;
      case 'telegram':
        if (cleanContact.startsWith('http')) {
          window.open(cleanContact, '_blank');
        } else {
          const username = cleanContact.startsWith('@')
            ? cleanContact.slice(1)
            : cleanContact;
          window.open(`https://t.me/${username}`, '_blank');
        }
        break;
      case 'discord':
        if (cleanContact.startsWith('http')) {
          window.open(cleanContact, '_blank');
        } else {
          navigator.clipboard.writeText(cleanContact).then(() => {
            toast.success('Discord info copied to clipboard');
          });
        }
        break;
      case 'github':
        if (cleanContact.startsWith('http')) {
          window.open(cleanContact, '_blank');
        } else {
          const username = cleanContact.startsWith('@')
            ? cleanContact.slice(1)
            : cleanContact;
          window.open(`https://github.com/${username}`, '_blank');
        }
        break;
      default:
        navigator.clipboard.writeText(cleanContact).then(() => {
          toast.success('Contact info copied to clipboard');
        });
    }
    return;
  }

  // Auto-detect if method is missing
  if (cleanContact.includes('@') && !cleanContact.startsWith('@')) {
    window.location.href = `mailto:${cleanContact}`;
  } else if (cleanContact.includes('t.me/')) {
    window.open(cleanContact, '_blank');
  } else if (cleanContact.includes('github.com')) {
    window.open(cleanContact, '_blank');
  } else {
    // Default fallback
    if (cleanContact.startsWith('http')) {
      window.open(cleanContact, '_blank');
    } else {
      navigator.clipboard.writeText(cleanContact).then(() => {
        toast.success('Contact info copied to clipboard');
      });
    }
  }
};

export function TeamRecruitmentPostCard({
  post,
  onContactClick,
  onEditClick,
  onDeleteClick,
  isMyPost = false,
  onTrackContact,
  isPinned = false,
}: TeamRecruitmentPostCardProps) {
  const ContactIcon = getContactMethodIcon(
    post.contactMethod,
    post.contactInfo
  );

  // ... (existing helper functions inside component)

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'posted a few secs ago';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return `posted ${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `posted ${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `posted ${days} day${days > 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12)
      return `posted ${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365);
    return `posted ${years} year${years > 1 ? 's' : ''} ago`;
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContactClick) {
      onContactClick(post);
    }
    if (post.contactInfo) {
      handleContact(
        post.contactInfo,
        post.contactMethod,
        onTrackContact,
        post.id
      );
    }
  };

  // Find leader
  const leader =
    post.members.find(m => m.role === 'leader' || m.userId === post.leaderId) ||
    post.members[0];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(post);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(post);
    }
  };

  return (
    <div
      className={`group hover:border-primary/45 mx-auto w-full max-w-[397px] overflow-hidden rounded-lg border ${isPinned ? 'border-[#A7F950]/50 bg-[#030303] shadow-[0_0_15px_-5px_#A7F950]' : 'border-[#2B2B2B] bg-[#030303]'} p-4 transition-all sm:p-5`}
    >
      {isPinned && (
        <div className='mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#A7F950]'>
          <Pin className='h-3.5 w-3.5 fill-[#A7F950]' />
          <span>Your Team</span>
        </div>
      )}
      {/* Header with Creator Info and Status */}
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <div className='flex items-center gap-2'>
          <Avatar
            className={`h-8 w-8 border-2 transition-all duration-300 group-hover:border-[#A7F950] sm:h-10 sm:w-10 ${isPinned ? 'border-[#A7F950]' : 'border-[#2B2B2B]'}`}
          >
            <AvatarImage
              src={leader?.image}
              alt={leader?.name}
              className='object-cover'
            />
            <AvatarFallback className='bg-gray-700 text-white'>
              {(leader?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h4 className='text-sm font-medium text-white'>
              {leader?.name || 'Unknown User'}
            </h4>
            <span className='text-xs text-gray-500'>
              @{leader?.username || 'user'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge
            className={`flex-shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
              post.isOpen
                ? 'border-[#A7F950] bg-[#A7F950]/10 text-[#A7F950]'
                : 'border-gray-500 bg-gray-500/10 text-gray-500'
            }`}
          >
            {post.isOpen ? 'Open' : 'Closed'}
          </Badge>
          {isMyPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-gray-400 hover:text-white'
                  onClick={e => e.stopPropagation()}
                >
                  <span className='text-lg'>⋯</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='border-gray-800 bg-black text-white'
              >
                <DropdownMenuItem
                  onClick={handleEditClick}
                  className='cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-white'
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className='cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-400'
                >
                  <X className='mr-2 h-4 w-4' />
                  Close Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Project Name */}
      <h3 className='mb-2 line-clamp-1 text-lg font-bold text-white sm:text-xl'>
        {post.teamName}
      </h3>

      {/* Project Description */}
      <p className='mb-3 line-clamp-3 text-sm leading-relaxed text-gray-300 sm:mb-4'>
        {post.description}
      </p>

      {/* Roles Needed */}
      {post.lookingFor.length > 0 && (
        <div className='mb-3 flex items-center gap-2 sm:mb-4'>
          <span className='text-sm text-gray-400'>
            {post.lookingFor.length} role
            {post.lookingFor.length !== 1 ? 's' : ''} needed
          </span>
        </div>
      )}

      {/* Team Size Indicator */}
      <div className='mb-3 flex items-center gap-2 text-sm text-gray-400 sm:mb-4'>
        <Users className='h-4 w-4' />
        <span>
          {post.memberCount} / {post.maxSize} members
        </span>
      </div>

      {/* Stats (Optional) */}
      {(post.views !== undefined || post.contactCount !== undefined) && (
        <div className='mb-3 flex items-center gap-4 text-xs text-gray-500 sm:mb-4'>
          {post.views !== undefined && (
            <div className='flex items-center gap-1'>
              <Eye className='h-3 w-3' />
              <span>{post.views} views</span>
            </div>
          )}
          {post.contactCount !== undefined && (
            <div className='flex items-center gap-1'>
              <ContactIcon className='h-3 w-3' />
              <span>{post.contactCount} contacts</span>
            </div>
          )}
        </div>
      )}

      {/* Footer - Contact Button and Date */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>{getTimeAgo(post.createdAt)}</span>
        </div>

        <Button
          onClick={handleContactClick}
          className='flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#A7F950] text-base font-semibold text-black shadow-lg transition-all duration-200 hover:bg-[#8fd93f] hover:shadow-xl'
        >
          <ContactIcon className='h-5 w-5' />
          <span>
            Contact via{' '}
            {getContactMethodLabel(post.contactMethod, post.contactInfo)}
          </span>
        </Button>
      </div>
    </div>
  );
}
