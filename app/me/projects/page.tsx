'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMe } from '@/lib/api/auth';
import { GetMeResponse } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft } from 'lucide-react';
import { useAuthStatus } from '@/hooks/use-auth';
import { mapProjectToCardData } from '@/features/projects/utils/card-mappers';
import ProjectCard from '@/features/projects/components/ProjectCard';

// ... (existing imports)

export default function MyProjectsPage() {
  const { user: authUser, isLoading } = useAuthStatus();
  const [meData, setMeData] = useState<GetMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMe();
        setMeData(data);
      } catch {
        // console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  if (isLoading || loading) {
    // ... (rendering loading)
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>Loading...</div>
      </div>
    );
  }

  if (!meData) {
    // ... (rendering error)
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>Failed to load data</div>
      </div>
    );
  }

  const projects = meData.user.projects || [];

  // Sort projects by createdAt in descending order (newest first)
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        {/* ... (header) ... */}
        <Button asChild variant='ghost' className='mb-4'>
          <Link href='/me' className='flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Back to Profile
          </Link>
        </Button>

        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-white'>My Projects</h1>
            <p className='mt-2 text-white/70'>
              All your project creations ({projects.length} total)
            </p>
          </div>
          <Button asChild>
            <Link href='/projects/create'>Create New Project</Link>
          </Button>
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <Card className='bg-background border-border/10'>
          <CardContent className='py-12 text-center'>
            <Package className='mx-auto mb-4 h-16 w-16 text-white/30' />
            <h3 className='mb-2 text-xl font-semibold text-white'>
              No Projects Yet
            </h3>
            <p className='mb-6 text-white/60'>
              You haven't created any projects yet. Start building something
              amazing!
            </p>
            <Button asChild>
              <Link href='/projects/create'>Create Your First Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {sortedProjects.map(project => (
            <ProjectCard
              isFullWidth
              key={project.id}
              data={mapProjectToCardData(project, {
                name: authUser?.name || 'You',
                image: authUser?.image || '/user.png',
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
