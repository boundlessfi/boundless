import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';

interface GroupAvatarProps {
  members: string[];
}

const GroupAvatar = ({ members }: GroupAvatarProps) => {
  const showCount = members.length > 3;
  const maxVisible = showCount ? 3 : members.length;
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <AvatarGroup>
      {visibleMembers.map((member, index) => (
        <Avatar key={index} className='size-8 border-none! sm:size-6'>
          <AvatarImage src={member} alt={`Member ${index + 1}`} />
          <AvatarFallback className='bg-[#1E2329] text-[10px] text-white'>
            {member.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <AvatarGroupCount className='bg-background text-foreground ring-border size-8 text-xs font-bold ring-2 sm:size-6 sm:text-xs'>
          +{remainingCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
};

export default GroupAvatar;
