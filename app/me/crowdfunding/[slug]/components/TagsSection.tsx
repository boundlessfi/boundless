import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TagsSectionProps {
  project: {
    tags?: string[];
  };
}

export function TagsSection({ project }: TagsSectionProps) {
  if (!project.tags || project.tags.length === 0) return null;

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='text-white'>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-2'>
          {project.tags.map((tag, index) => (
            <Badge
              key={index}
              variant='secondary'
              className='bg-muted text-muted-foreground'
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
