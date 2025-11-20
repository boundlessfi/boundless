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
}

const getContactMethodIcon = (method: TeamRecruitmentPost['contactMethod']) => {
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
};

const getContactMethodLabel = (
  method: TeamRecruitmentPost['contactMethod']
) => {
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
};

const handleContact = (
  method: TeamRecruitmentPost['contactMethod'],
  contactInfo: string,
  onTrackContact?: (postId: string) => void,
  postId?: string
) => {
  if (onTrackContact && postId) {
    onTrackContact(postId);
  }

  switch (method) {
    case 'email':
      window.location.href = `mailto:${contactInfo}`;
      break;
    case 'telegram':
      // Handle both @username and full URLs
      if (contactInfo.startsWith('http')) {
        window.open(contactInfo, '_blank');
      } else {
        const username = contactInfo.startsWith('@')
          ? contactInfo.slice(1)
          : contactInfo;
        window.open(`https://t.me/${username}`, '_blank');
      }
      break;
    case 'discord':
      // Discord could be a username or invite link
      if (contactInfo.startsWith('http')) {
        window.open(contactInfo, '_blank');
      } else {
        // Show in a toast or copy to clipboard
        navigator.clipboard.writeText(contactInfo).then(() => {
          toast.success('Discord info copied to clipboard');
        });
      }
      break;
    case 'github':
      // GitHub could be a profile URL or username
      if (contactInfo.startsWith('http')) {
        window.open(contactInfo, '_blank');
      } else {
        const username = contactInfo.startsWith('@')
          ? contactInfo.slice(1)
          : contactInfo;
        window.open(`https://github.com/${username}`, '_blank');
      }
      break;
    default:
      // For 'other', show contact info
      navigator.clipboard.writeText(contactInfo).then(() => {
        toast.success('Contact info copied to clipboard');
      });
  }
};

export function TeamRecruitmentPostCard({
  post,
  onContactClick,
  onEditClick,
  onDeleteClick,
  isMyPost = false,
  onTrackContact,
}: TeamRecruitmentPostCardProps) {
  const ContactIcon = getContactMethodIcon(post.contactMethod);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContactClick) {
      onContactClick(post);
    }
    handleContact(
      post.contactMethod,
      post.contactInfo,
      onTrackContact,
      post._id
    );
  };

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

  const getStatusColor = (status: TeamRecruitmentPost['status']) => {
    switch (status) {
      case 'active':
        return 'border-[#A7F950] bg-[#A7F950]/10 text-[#A7F950]';
      case 'filled':
        return 'border-blue-500 bg-blue-500/10 text-blue-500';
      case 'closed':
        return 'border-gray-500 bg-gray-500/10 text-gray-500';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className='group hover:border-primary/45 mx-auto w-full max-w-[397px] overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#030303] p-4 transition-all sm:p-5'>
      {/* Header with Creator Info and Status */}
      <div className='mb-3 flex items-center justify-between sm:mb-4'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8 border-2 border-[#2B2B2B] transition-all duration-300 group-hover:border-[#A7F950] sm:h-10 sm:w-10'>
            <AvatarImage
              src={post.createdBy.avatar}
              alt={post.createdBy.name}
              className='object-cover'
            />
            <AvatarFallback className='bg-gray-700 text-white'>
              {post.createdBy.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <h4 className='text-sm font-medium text-white'>
              {post.createdBy.name}
            </h4>
            <span className='text-xs text-gray-500'>
              @{post.createdBy.username}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge
            className={`flex-shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${getStatusColor(post.status)}`}
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
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
        {post.projectName}
      </h3>

      {/* Project Description */}
      <p className='mb-3 line-clamp-3 text-sm leading-relaxed text-gray-300 sm:mb-4'>
        {post.projectDescription}
      </p>

      {/* Roles Needed */}
      {post.lookingFor.length > 0 && (
        <div className='mb-3 flex flex-wrap gap-1.5 sm:mb-4'>
          {post.lookingFor.map((role, idx) => (
            <Badge
              key={idx}
              className='flex-shrink-0 rounded-[4px] border border-[#645D5D] bg-[#E4DBDB] px-2 py-0.5 text-xs font-medium text-[#645D5D]'
            >
              {role.role}
            </Badge>
          ))}
        </div>
      )}

      {/* Team Size Indicator */}
      <div className='mb-3 flex items-center gap-2 text-sm text-gray-400 sm:mb-4'>
        <Users className='h-4 w-4' />
        <span>
          {post.currentTeamSize} / {post.maxTeamSize} members
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
          <span>Posted: {formatDate(post.createdAt)}</span>
        </div>

        <Button
          onClick={handleContactClick}
          className='flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#A7F950] text-base font-semibold text-black shadow-lg transition-all duration-200 hover:bg-[#8fd93f] hover:shadow-xl'
        >
          <ContactIcon className='h-5 w-5' />
          <span>Contact via {getContactMethodLabel(post.contactMethod)}</span>
        </Button>
      </div>
    </div>
  );
}
