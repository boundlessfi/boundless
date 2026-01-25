'use client';

import React from 'react';
import { Task } from '@/types/milestone';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskListProps {
  tasks?: Task[];
  deliverables?: string[]; // Legacy support
}

const TaskList = ({ tasks, deliverables }: TaskListProps) => {
  // If no tasks provided but deliverables exist, convert them to simple task objects
  const displayTasks: Task[] = React.useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks.sort((a, b) => a.order - b.order);
    }
    
    // Convert legacy deliverables to task format for display
    if (deliverables && deliverables.length > 0) {
      return deliverables.map((deliverable, index) => ({
        id: `deliverable-${index}`,
        title: deliverable,
        status: 'todo' as const,
        order: index,
      }));
    }
    
    return [];
  }, [tasks, deliverables]);

  if (displayTasks.length === 0) {
    return null;
  }

  const completedCount = displayTasks.filter(
    task => task.status === 'completed'
  ).length;
  const totalCount = displayTasks.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />;
      case 'in_progress':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      case 'todo':
      default:
        return <Circle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className='bg-green-500/20 text-green-400 hover:bg-green-500/30'>
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className='bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'>
            In Progress
          </Badge>
        );
      case 'todo':
      default:
        return (
          <Badge className='bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'>
            To Do
          </Badge>
        );
    }
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>
          Tasks & Deliverables
        </h3>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-400'>
            {completedCount} / {totalCount} completed
          </span>
          <Badge
            variant='outline'
            className={cn(
              'border-gray-700',
              progressPercentage === 100 ? 'bg-green-500/20' : 'bg-gray-800/50'
            )}
          >
            {progressPercentage}%
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='h-2 w-full overflow-hidden rounded-full bg-gray-800'>
        <div
          className={cn(
            'h-full transition-all duration-300',
            progressPercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
          )}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Task List */}
      <div className='space-y-2'>
        {displayTasks.map(task => (
          <div
            key={task.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border border-gray-800 bg-[#101010] p-4 transition-colors hover:border-gray-700',
              task.status === 'completed' && 'opacity-75'
            )}
          >
            <div className='mt-0.5'>{getStatusIcon(task.status)}</div>
            <div className='flex-1 space-y-2'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1'>
                  <h4
                    className={cn(
                      'text-sm font-medium',
                      task.status === 'completed'
                        ? 'text-gray-400 line-through'
                        : 'text-white'
                    )}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className='mt-1 text-xs text-gray-500'>
                      {task.description}
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  {task.priority && (
                    <Badge
                      variant='outline'
                      className={cn(
                        'border-none text-xs',
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </Badge>
                  )}
                  {getStatusBadge(task.status)}
                </div>
              </div>
              <div className='flex items-center gap-4 text-xs text-gray-500'>
                {task.assignee && (
                  <div className='flex items-center gap-1'>
                    <span>Assigned to:</span>
                    <span className='text-gray-400'>{task.assignee}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className='flex items-center gap-1'>
                    <span>Due:</span>
                    <span className='text-gray-400'>
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {task.completedAt && (
                  <div className='flex items-center gap-1'>
                    <span>Completed:</span>
                    <span className='text-green-400'>
                      {new Date(task.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
