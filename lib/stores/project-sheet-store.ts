'use client';

import { CrowdfundingProject } from '@/features/projects/types';
import { create } from 'zustand';

type ProjectSheetMode = 'initialize' | 'validate';

interface ProjectSheetState {
  open: boolean;
  mode: ProjectSheetMode;
  project?: CrowdfundingProject;
  openInitialize: () => void;
  openValidate: (project: CrowdfundingProject) => void;
  setOpen: (open: boolean) => void;
  reset: () => void;
}

export const useProjectSheetStore = create<ProjectSheetState>(set => ({
  open: false,
  mode: 'initialize',
  project: undefined,
  openInitialize: () =>
    set({ open: true, mode: 'initialize', project: undefined }),
  openValidate: (project: CrowdfundingProject) =>
    set({ open: true, mode: 'validate', project }),
  setOpen: (open: boolean) => set({ open }),
  reset: () => set({ open: false, mode: 'initialize', project: undefined }),
}));
