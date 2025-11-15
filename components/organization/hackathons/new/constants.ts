export type StepStatus = 'pending' | 'active' | 'completed';
export type StepKey =
  | 'information'
  | 'timeline'
  | 'participation'
  | 'rewards'
  | 'judging'
  | 'collaboration'
  | 'review';

export interface StepData {
  status: StepStatus;
  isCompleted: boolean;
  data?: Record<string, unknown>;
}

export const STEP_ORDER: StepKey[] = [
  'information',
  'timeline',
  'participation',
  'rewards',
  'judging',
  'collaboration',
  'review',
];
