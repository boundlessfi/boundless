import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarkdown } from '@/hooks/use-markdown';
import { Crowdfunding } from '@/features/projects/types';
import Image from 'next/image';

interface ProjectDetailsProps {
  campaign: Crowdfunding;
  project: Crowdfunding['project'];
}

export function ProjectDetails({ campaign, project }: ProjectDetailsProps) {
  const { styledContent } = useMarkdown(project.description || '', {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'funding':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {project.logo && (
              <Image
                height={48}
                width={48}
                src={project.logo}
                alt={project.title}
                className='h-12 w-12 rounded-lg object-cover'
              />
            )}
            <div>
              <CardTitle className='text-white'>{project.title}</CardTitle>
              <CardDescription className='text-white/70'>
                Created {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
          </div>
          <Badge variant='outline' className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <h3 className='mb-2 text-lg font-semibold text-white'>Description</h3>
          <div className='leading-relaxed text-white/80'>{styledContent}</div>
        </div>

        {project.details && (
          <div>
            <h3 className='mb-2 text-lg font-semibold text-white'>Details</h3>
            <p className='leading-relaxed text-white/80'>{project.details}</p>
          </div>
        )}

        {project.vision && (
          <div>
            <h3 className='mb-2 text-lg font-semibold text-white'>Vision</h3>
            <p className='leading-relaxed text-white/80'>{project.vision}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
