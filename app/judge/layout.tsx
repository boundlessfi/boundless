import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { JudgePortalShell } from '@/components/judge/JudgePortalShell';

export const metadata: Metadata = {
  title: 'Judge Portal — Boundless',
  description:
    'Review and score hackathon submissions you have been invited to judge.',
  robots: { index: false, follow: false },
};

export default function JudgeLayout({ children }: { children: ReactNode }) {
  return <JudgePortalShell>{children}</JudgePortalShell>;
}
