'use client';

import { ProjectBanner } from './project-banner';
import { ProjectDetailsCard } from './project-details-card';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface HeroSectionProps {
  vm: ProjectViewModel;
  isSubmission?: boolean;
  onRefresh?: () => void;
}

export function HeroSection({ vm, isSubmission, onRefresh }: HeroSectionProps) {
  return (
    <section className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] xl:gap-8'>
      <ProjectBanner banner={vm.banner} title={vm.title} />
      <ProjectDetailsCard
        vm={vm}
        isSubmission={isSubmission}
        onRefresh={onRefresh}
      />
    </section>
  );
}
