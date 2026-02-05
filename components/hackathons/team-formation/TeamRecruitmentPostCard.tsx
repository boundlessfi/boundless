'use client';

import React from 'react';
import {
  Mail,
  MessageCircle,
  Users,
  Edit,
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
import { useAuthStatus } from '@/hooks/use-auth';
import { useLeaveTeam } from '@/hooks/hackathon/use-leave-team';
import { LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TeamRecruitmentPostCardProps {
  post: TeamRecruitmentPost;
  onContactClick?: (post: TeamRecruitmentPost) => void;
  onEditClick?: (post: TeamRecruitmentPost) => void;
  onDeleteClick?: (post: TeamRecruitmentPost) => void;
  onClick?: (post: TeamRecruitmentPost) => void;
  isMyPost?: boolean;
  onTrackContact?: (postId: string) => void;
  isPinned?: boolean;
  onLeaveSuccess?: () => void;
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

const handleContact = (
  contactInfo: string,
  method?: TeamRecruitmentPost['contactMethod'],
  onTrackContact?: (postId: string) => void,
  postId?: string
) => {
  if (onTrackContact && postId) {
    onTrackContact(postId);
  }

  let cleanContact = contactInfo;

  // Try to parse as JSON if it looks like one
  if (contactInfo.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(contactInfo);
      if (parsed.value) {
        cleanContact = parsed.value;
      }
    } catch {
      // Ignore parse error
    }
  }

  // Clean contact info
  cleanContact = cleanContact.replace(/^"|"$/g, '');
  cleanContact = cleanContact.replace(/\\"/g, '');

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
  if (months < 12) return `posted ${months} month${months > 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `posted ${years} year${years > 1 ? 's' : ''} ago`;
};

export function TeamRecruitmentPostCard({
  post,
  onContactClick,
  onEditClick,
  onClick,
  isMyPost,
  onTrackContact,
  isPinned = false,
  onLeaveSuccess,
}: TeamRecruitmentPostCardProps) {
  const ContactIcon = getContactMethodIcon(
    post.contactMethod,
    post.contactInfo
  );

  const { user } = useAuthStatus();
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);

  const isMember = user ? post.members.some(m => m.userId === user.id) : false;
  // Leader is also a member, so isMember is true for leader. Check specifically for leader capability
  const isLeader = user ? post.leaderId === user.id : false;

  const { leaveTeam, isLeaving } = useLeaveTeam({
    hackathonSlugOrId: post.hackathonId,
    teamId: post.id,
    organizationId: post.organizationId,
    onSuccess: onLeaveSuccess,
  });

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check leader restrictions
    if (isLeader && post.members.length > 1) {
      toast.error('You must transfer leadership before leaving the team.');
      return;
    }

    setShowLeaveDialog(true);
  };

  const confirmLeave = async () => {
    await leaveTeam();
    setShowLeaveDialog(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick?.(post);
  };

  // const handleDeleteClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onDeleteClick?.(post);
  // };

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

  const handleCardClick = () => {
    onClick?.(post);
  };

  // Find leader
  const leader =
    post.members.find(m => m.role === 'leader' || m.userId === post.leaderId) ||
    post.members[0];

  return (
    <div
      onClick={handleCardClick}
      className={`group hover:border-primary/45 bg-background-main-bg mx-auto w-full max-w-[397px] overflow-hidden rounded-lg border border-[#2B2B2B] p-4 transition-all sm:p-5 ${onClick ? 'cursor-pointer hover:border-[#A7F950]/50' : ''}`}
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
            className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
              post.isOpen
                ? 'border-[#A7F950] bg-[#E5FFE5] text-[#4E9E00]'
                : 'border-[#FF5757] bg-[#FFEAEA] text-[#D33]'
            }`}
          >
            {post.isOpen ? 'Open' : 'Closed'}
          </Badge>

          {(isMyPost || isMember) && (
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
                {isMyPost && (
                  <DropdownMenuItem
                    onClick={handleEditClick}
                    className='cursor-pointer text-gray-300 focus:bg-gray-800 focus:text-white'
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit Post
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleLeaveClick}
                  className='cursor-pointer text-red-400 focus:bg-red-500/20 focus:text-red-400'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Leave Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className='border-gray-800 bg-[#030303] text-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Team</AlertDialogTitle>
            <AlertDialogDescription className='text-gray-400'>
              Are you sure you want to leave this team?
              {isLeader &&
                post.members.length === 1 &&
                " Since you're the only member, the team might be dissolved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-gray-700 text-white hover:bg-gray-800'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
              disabled={isLeaving}
              className='bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
            >
              {isLeaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Leaving...
                </>
              ) : (
                'Leave Team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
      <div className='mt-5 flex items-center justify-between gap-3 border-t border-[#2B2B2B] pt-4'>
        <div className='flex flex-col'>
          <span className='text-xs text-gray-500'>Posted</span>
          <span className='text-xs font-medium text-gray-300'>
            {getTimeAgo(post.createdAt)}
          </span>
        </div>

        <Button
          onClick={handleContactClick}
          variant='ghost'
          size='icon'
          className='text-[#A7F950] hover:bg-[#A7F950]/10 hover:text-[#8fd93f]'
        >
          <ContactIcon className='h-6 w-6' />
        </Button>
      </div>
    </div>
  );
}
