'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Briefcase,
  Mail,
  MessageCircle,
  ExternalLink,
  Edit,
  Pin,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import {
  type TeamRecruitmentPost,
  getTeamPostDetails,
  toggleRoleHired,
} from '@/lib/api/hackathons';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStatus } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { TeamInvitationsList } from './TeamInvitationsList';
import { Separator } from '@/components/ui/separator';

interface TeamDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: TeamRecruitmentPost;
  hackathonSlugOrId: string;
  organizationId?: string;
  onEditClick: (post: TeamRecruitmentPost) => void;
  onContactClick: (post: TeamRecruitmentPost) => void;
}

const handleContact = (
  contactInfo: string,
  method?: TeamRecruitmentPost['contactMethod']
) => {
  let cleanContact = contactInfo;

  if (contactInfo.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(contactInfo);
      if (parsed.value) {
        cleanContact = parsed.value;
      }
    } catch {
      // Ignore parse errors, treat as plain string
    }
  }

  cleanContact = cleanContact.replace(/^"|"$/g, '');
  cleanContact = cleanContact.replace(/\\"/g, '');

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

export function TeamDetailsSheet({
  open,
  onOpenChange,
  post: initialPost,
  hackathonSlugOrId,
  organizationId,
  onEditClick,
  onContactClick,
}: TeamDetailsSheetProps) {
  const { user } = useAuthStatus();
  const [post, setPost] = useState<TeamRecruitmentPost>(initialPost);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [hiredRoles, setHiredRoles] = useState<Set<string>>(new Set());
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  const isLeader = post.leaderId === user?.id;

  useEffect(() => {
    if (open && initialPost) {
      setPost(initialPost);

      // Initialize hired roles from rolesStatus
      if (initialPost.rolesStatus) {
        const hired = new Set(
          initialPost.rolesStatus.filter(r => r.hired).map(r => r.skill)
        );
        setHiredRoles(hired);
      }

      // Fetch fresh details
      const loadDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getTeamPostDetails(
            hackathonSlugOrId,
            initialPost.id,
            organizationId
          );
          if (response.success && response.data) {
            setPost(response.data);
            // Update hired roles from fresh data
            if (response.data.rolesStatus) {
              const hired = new Set(
                response.data.rolesStatus.filter(r => r.hired).map(r => r.skill)
              );
              setHiredRoles(hired);
            }
          }
        } catch {
          setError('Failed to load latest team details');
        } finally {
          setIsLoading(false);
        }
      };

      loadDetails();
    }
  }, [open, initialPost, hackathonSlugOrId, organizationId]);

  const getContactMethodIcon = (method?: string) => {
    switch (method) {
      case 'email':
        return Mail;
      case 'telegram':
      case 'discord':
        return MessageCircle;
      case 'github':
        return ExternalLink;
      default:
        return Mail;
    }
  };

  const ContactIcon = getContactMethodIcon(post.contactMethod);

  // Find leader
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const leader =
    post.members.find(m => m.role === 'leader' || m.userId === post.leaderId) ||
    post.members[0];

  const handleContactClick = () => {
    onContactClick(post);
    if (post.contactInfo) {
      handleContact(post.contactInfo, post.contactMethod);
    }
  };

  const handleToggleRoleHired = async (skill: string) => {
    if (!isLeader || togglingRole) return;

    setTogglingRole(skill);
    const wasHired = hiredRoles.has(skill);

    // Optimistic update
    setHiredRoles(prev => {
      const next = new Set(prev);
      if (wasHired) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });

    try {
      const response = await toggleRoleHired(
        hackathonSlugOrId,
        post.id,
        { skill },
        organizationId
      );

      if (response.success) {
        toast.success(
          response.data.hired
            ? `Marked "${skill}" as filled`
            : `Marked "${skill}" as open`
        );
      }
    } catch (err: any) {
      // Rollback on error
      setHiredRoles(prev => {
        const next = new Set(prev);
        if (wasHired) {
          next.add(skill);
        } else {
          next.delete(skill);
        }
        return next;
      });

      const errorMessage = err?.message || 'Failed to update role status';
      toast.error(errorMessage);
    } finally {
      setTogglingRole(null);
    }
  };

  return (
    <BoundlessSheet open={open} setOpen={onOpenChange}>
      <div className='bg-background-main-bg flex h-full flex-col text-white'>
        <ScrollArea className='flex-1'>
          <div className='p-6'>
            {/* Header */}
            <div className='mb-6'>
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  {/* Status Badge */}
                  <Badge
                    className={`rounded border px-2 py-0.5 text-xs font-medium ${
                      post.isOpen
                        ? 'border-[#A7F950] bg-[#A7F950]/10 text-[#A7F950]'
                        : 'border-gray-500 bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {post.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                  {/* Pinned Badge if applicable (can be passed as prop or inferred if myTeam) */}
                  {isLeader && (
                    <Badge className='flex items-center gap-1 border-[#A7F950]/50 bg-[#A7F950]/10 text-[#A7F950]'>
                      <Pin className='h-3 w-3' />
                      Your Team
                    </Badge>
                  )}
                </div>

                {/* Edit Button for Leader */}
                {isLeader && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      onOpenChange(false);
                      onEditClick(post);
                    }}
                    className='border-gray-700 text-white hover:bg-gray-800'
                  >
                    <Edit className='mr-2 h-3.5 w-3.5' />
                    Edit
                  </Button>
                )}
              </div>

              <h2 className='mb-2 text-2xl font-bold text-white'>
                {post.teamName}
              </h2>

              <div className='flex items-center gap-4 text-sm text-gray-400'>
                <div className='flex items-center gap-1.5'>
                  <Users className='h-4 w-4' />
                  <span>
                    {post.memberCount} / {post.maxSize} members
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='h-4 w-4' />
                  <span>
                    Posted{' '}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='space-y-8'>
              {/* Description */}
              <section>
                <h3 className='mb-3 text-lg font-semibold text-white'>
                  About the Team
                </h3>
                <p className='leading-relaxed whitespace-pre-wrap text-gray-300'>
                  {post.description}
                </p>
              </section>

              {/* Roles Needed */}
              {post.lookingFor.length > 0 && (
                <section>
                  <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold text-white'>
                    <Briefcase className='h-5 w-5 text-[#A7F950]' />
                    Looking For
                  </h3>
                  <div className='space-y-2'>
                    {post.lookingFor.map((role, index) => {
                      const roleSkill = typeof role === 'string' ? role : role;
                      const isHired = hiredRoles.has(roleSkill);
                      const isToggling = togglingRole === roleSkill;

                      return (
                        <div
                          key={index}
                          className='flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/30 p-3'
                        >
                          <Badge
                            className={`flex-1 px-3 py-1.5 text-sm ${
                              isHired
                                ? 'bg-gray-700/50 text-gray-400 line-through'
                                : 'bg-gray-800 text-gray-200'
                            }`}
                          >
                            {roleSkill}
                          </Badge>
                          {isHired && (
                            <Badge className='border-[#A7F950] bg-[#A7F950]/10 text-xs text-[#A7F950]'>
                              <Check className='mr-1 h-3 w-3' />
                              Filled
                            </Badge>
                          )}
                          {isLeader && (
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-gray-400'>
                                {isHired ? 'Filled' : 'Open'}
                              </span>
                              <Switch
                                checked={isHired}
                                onCheckedChange={() =>
                                  handleToggleRoleHired(roleSkill)
                                }
                                disabled={isToggling}
                                className='data-[state=checked]:bg-[#A7F950]'
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Team Members */}
              <section>
                <h3 className='mb-4 text-lg font-semibold text-white'>
                  Team Members ({post.members.length})
                </h3>
                <div className='grid gap-3'>
                  {post.members.map(member => (
                    <div
                      key={member.userId}
                      className='flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/30 p-3'
                    >
                      <Avatar className='h-10 w-10 border border-gray-700'>
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback className='bg-gray-800 text-gray-400'>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium text-white'>
                          {member.name}
                          {member.userId === post.leaderId && (
                            <span className='ml-2 text-xs text-[#A7F950]'>
                              (Leader)
                            </span>
                          )}
                        </p>
                        {/* If we had role info per member, display it here */}
                        {/* <p className='text-xs text-gray-400'>Frontend Developer</p> */}
                      </div>
                    </div>
                  ))}
                  {/* Empty slots placeholders */}
                  {Array.from({
                    length: Math.max(0, post.maxSize - post.memberCount),
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className='flex items-center gap-3 rounded-lg border border-dashed border-gray-800 p-3'
                    >
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-gray-600'>
                        <Users className='h-5 w-5' />
                      </div>
                      <p className='text-sm text-gray-500'>Open Spot</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Team Invitations (Visible to Leader) */}
              {isLeader && (
                <>
                  <Separator className='bg-gray-800' />
                  <section>
                    <TeamInvitationsList
                      hackathonId={hackathonSlugOrId}
                      teamId={post.id}
                    />
                  </section>
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className='border-t border-gray-800 p-6'>
          <Button
            onClick={handleContactClick}
            className='bg-[#A7F950] text-lg font-semibold text-black hover:bg-[#8fd93f]'
          >
            <ContactIcon className='mr-2 h-5 w-5' />
            Contact Team
          </Button>
        </div>
      </div>
    </BoundlessSheet>
  );
}
