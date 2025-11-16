import type { UserStats as UserStatsType } from '@/types/profile';

interface UserStatsProps {
  stats: UserStatsType;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function UserStats({
  stats,
  onFollowersClick,
  onFollowingClick,
}: UserStatsProps) {
  return (
    <div className='flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8'>
      <div className='flex items-center gap-1 text-xs font-medium text-[#B5B5B5] sm:text-sm'>
        <span className='text-sm font-medium text-white sm:text-base'>
          {stats.organizations}
        </span>
        <span className='xs:inline hidden'>Organizations</span>
        <span className='xs:hidden'>Orgs</span>
      </div>
      <div className='flex items-center gap-1 text-xs font-medium text-[#B5B5B5] sm:text-sm'>
        <span className='text-sm font-medium text-white sm:text-base'>
          {stats.projects}
        </span>
        Projects
      </div>
      <div
        className='flex cursor-pointer items-center gap-1 text-xs font-medium text-[#B5B5B5] transition-colors hover:text-white sm:text-sm'
        onClick={onFollowingClick}
      >
        <span className='text-sm font-medium text-white sm:text-base'>
          {stats.following}
        </span>
        Following
      </div>
      <div
        className='flex cursor-pointer items-center gap-1 text-xs font-medium text-[#B5B5B5] transition-colors hover:text-white sm:text-sm'
        onClick={onFollowersClick}
      >
        <span className='text-sm font-medium text-white sm:text-base'>
          {stats.followers}
        </span>
        Followers
      </div>
    </div>
  );
}
