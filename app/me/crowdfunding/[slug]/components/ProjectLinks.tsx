import { ExternalLink, Github, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProjectLinksProps {
  project: {
    projectWebsite?: string;
    githubUrl?: string;
    demoVideo?: string;
  };
}

export function ProjectLinks({ project }: ProjectLinksProps) {
  const hasLinks =
    project.projectWebsite || project.githubUrl || project.demoVideo;

  if (!hasLinks) return null;

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='text-white'>Project Links</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {project.projectWebsite && (
          <Button variant='outline' className='w-full justify-start' asChild>
            <a
              href={project.projectWebsite}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Globe className='mr-2 h-4 w-4' />
              Website
              <ExternalLink className='ml-auto h-4 w-4' />
            </a>
          </Button>
        )}

        {project.githubUrl && (
          <Button variant='outline' className='w-full justify-start' asChild>
            <a
              href={project.githubUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Github className='mr-2 h-4 w-4' />
              GitHub
              <ExternalLink className='ml-auto h-4 w-4' />
            </a>
          </Button>
        )}

        {project.demoVideo && (
          <Button variant='outline' className='w-full justify-start' asChild>
            <a
              href={project.demoVideo}
              target='_blank'
              rel='noopener noreferrer'
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              Demo Video
              <ExternalLink className='ml-auto h-4 w-4' />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
