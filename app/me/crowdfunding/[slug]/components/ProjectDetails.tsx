'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarkdown } from '@/hooks/use-markdown';
import { Crowdfunding } from '@/features/projects/types';

interface ProjectDetailsProps {
  campaign: Crowdfunding;
  project: Crowdfunding['project'];
}

// Identity (logo, title, status) lives in the shared campaign layout header,
// so this is just the campaign story — no duplicated title/status/date.
export function ProjectDetails({ project }: ProjectDetailsProps) {
  // `vision` is the canonical "Project story" the wizard writes; description /
  // details are legacy fields. Match the public page's precedence so the same
  // campaign shows the same story on both surfaces.
  const body = project.vision || project.description || project.details || '';
  const { styledContent } = useMarkdown(body, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 0,
  });

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='text-white'>About this campaign</CardTitle>
      </CardHeader>
      <CardContent>
        {body ? (
          <div className='leading-relaxed text-white/80'>{styledContent}</div>
        ) : (
          <p className='text-sm text-zinc-500 italic'>
            No description added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
