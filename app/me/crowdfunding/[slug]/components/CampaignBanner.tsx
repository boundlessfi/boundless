import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface CampaignBannerProps {
  project: {
    banner: string | null;
    title: string;
  };
}

export function CampaignBanner({ project }: CampaignBannerProps) {
  if (!project.banner) return null;

  return (
    <Card className='bg-background border-border/10'>
      <CardContent className='p-0'>
        <Image
          height={256}
          width={256}
          src={project.banner}
          alt={project.title}
          className='h-64 w-full rounded-lg object-cover'
        />
      </CardContent>
    </Card>
  );
}
