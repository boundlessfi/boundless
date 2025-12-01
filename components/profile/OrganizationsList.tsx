import { Organization } from '@/types/profile';
import OrganizationCard from './OrganizationCard';

interface OrganizationsListProps {
  organizations: Organization[];
  isOwnProfile?: boolean;
}

export default function OrganizationsList({
  organizations,
}: OrganizationsListProps) {
  return (
    <div className='flex flex-col gap-3'>
      <h5 className='text-sm font-medium text-[#B5B5B5]'>ORGANIZATIONS</h5>
      <div className='flex flex-col gap-3'>
        {organizations.length > 0 ? (
          organizations.map(org => (
            <OrganizationCard key={org.name} organization={org} />
          ))
        ) : (
          <div className='text-sm text-[#B5B5B5]'>No organizations found</div>
        )}{' '}
      </div>
    </div>
  );
}
