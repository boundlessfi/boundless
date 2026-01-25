export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  completedAt?: string;
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  deliverables?: string[]; // Legacy field, kept for backward compatibility
  tasks?: Task[]; // New structured task list
  demoVideo?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  links?: Array<{
    type: string;
    url: string;
    icon: string;
  }>;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';
