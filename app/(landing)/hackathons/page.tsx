'use client';

import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function HackathonList() {
  const router = useRouter();
  const { hackathons, loading, error, refreshHackathons } = useHackathonData();

  useEffect(() => {
    refreshHackathons();
  }, []);

  const handleHackathonClick = (slug: string) => {
    router.push(`/hackathons/${slug}`);
  };

  if (loading) return <div>Loading hackathons...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Featured Hackathons</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {hackathons.map(hackathon => (
          <div
            key={hackathon.id}
            className='cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-lg'
            onClick={() => handleHackathonClick(hackathon.slug as string)}
          >
            <Image
              src={hackathon.imageUrl}
              alt={hackathon.title}
              className='mb-2 h-32 w-full rounded object-cover'
            />
            <h3 className='font-bold'>{hackathon.title}</h3>
            <p className='text-sm text-gray-600'>{hackathon.subtitle}</p>
            <div className='mt-2 flex flex-wrap gap-1'>
              {hackathon.categories?.map(category => (
                <span
                  key={category}
                  className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'
                >
                  {category}
                </span>
              ))}
            </div>
            <p className='mt-2 font-semibold'>
              Prize Pool: {hackathon.totalPrizePool}
            </p>
            <p className='text-sm'>Participants: {hackathon.participants}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HackathonList;
