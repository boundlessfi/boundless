import Image from 'next/image';
import { Organization } from '@/types/profile';
import Link from 'next/link';

interface OrganizationCardProps {
  organization: Organization;
}

export default function OrganizationCard({
  organization,
}: OrganizationCardProps) {
  return (
    <Link
      href={'/organizations/' + organization.id || ''}
      target='_blank'
      className='flex items-center gap-3 px-3'
    >
      <div className='relative size-[46px] overflow-hidden rounded-full'>
        <Image
          src={organization.avatarUrl}
          alt={`${organization.name} avatar`}
          layout='fill'
          objectFit='cover'
        />
      </div>
      <p className='font-base font-normal text-white'>{organization.name}</p>
    </Link>
  );
}
