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
        <Avatar
          key={index}
          className='size-8 border-2 border-[#141517] sm:size-10'
        >
          <AvatarImage src={member} alt={`Member ${index + 1}`} />
          <AvatarFallback className='bg-[#1E2329] text-[10px] text-white'>
            {member.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <AvatarGroupCount className='size-8 bg-[#1E2329] text-xs font-bold text-gray-400 ring-2 ring-[#141517] sm:size-10 sm:text-sm'>
          +{remainingCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
};

export default GroupAvatar;
