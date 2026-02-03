import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentStep?: number;
  onBack?: () => void;
  onTestData?: (templateKey: string) => void;
}

const Header = ({ currentStep = 1, onBack, onTestData }: HeaderProps) => {
  const steps = [
    { id: 1, name: 'Basics' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Milestones' },
    { id: 4, name: 'Team' },
    { id: 5, name: 'Contact' },
  ];

  const templates = [
    { key: 'defi', label: 'DeFi Protocol' },
    { key: 'rwa', label: 'RWA Platform' },
    { key: 'devtool', label: 'DevTool' },
    { key: 'amm', label: 'AMM' },
  ];

  return (
    <div className='bg-background sticky top-0 z-10 mb-[20px] space-y-[50px] overflow-x-hidden px-4 md:px-[50px] lg:mb-[40px] lg:px-[75px] xl:px-[150px]'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          {currentStep > 1 && onBack && (
            <button
              onClick={onBack}
              className='absolute top-0 -left-[50px] z-[9999] flex h-8 w-8 items-center justify-center rounded-full border border-[#484848] transition-colors duration-200 hover:border-white'
              aria-label='Go back to previous step'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
                className='text-white'
              >
                <path
                  d='M10 12L6 8L10 4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          )}
          <h1 className='text-2xl leading-[120%] font-medium tracking-[-0.48px] text-white'>
            Create a new Project
          </h1>
        </div>

        {/* Test Data Dropdown - Only show in development */}
        {process.env.NODE_ENV === 'development' && onTestData && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='border-primary/20 text-primary hover:bg-primary/10 gap-2 bg-transparent'
              >
                Test Data <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='z-[100] w-48'>
              {templates.map(template => (
                <DropdownMenuItem
                  className='text-primary hover:bg-primary/10'
                  key={template.key}
                  onClick={() => onTestData(template.key)}
                >
                  {template.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className='scrollbar-hide mb-0 overflow-x-auto'>
        <div className='flex w-full min-w-max items-center justify-between md:min-w-0'>
          {steps.map(step => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex w-full min-w-[120px] items-center pb-2 md:min-w-0',
                  isActive && 'border-primary border-b-2',
                  isCompleted && 'border-primary border-b-2'
                )}
              >
                <div className='flex flex-col items-center'>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`text-sm leading-[145%] whitespace-nowrap ${
                        isActive || isCompleted
                          ? 'text-white'
                          : 'text-[#919191]'
                      }`}
                    >
                      {step.name}
                    </span>
                    <div>
                      {isActive && (
                        <svg
                          width='16'
                          height='17'
                          viewBox='0 0 16 17'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002Z'
                            fill='white'
                          />
                          <path
                            d='M13.1064 12.7855C12.3645 13.6696 11.4058 14.3459 10.3241 14.7483C9.24248 15.1507 8.07488 15.2654 6.93559 15.0812C5.7963 14.897 4.72434 14.4202 3.82459 13.6974C2.92485 12.9746 2.22815 12.0307 1.80265 10.9579C1.37716 9.88511 1.23744 8.72024 1.39718 7.57726C1.55691 6.43428 2.01063 5.35234 2.71393 4.43731C3.41723 3.52227 4.34603 2.80549 5.40945 2.35709C6.47287 1.90868 7.63447 1.74402 8.78062 1.87921L7.99968 8.49998L13.1064 12.7855Z'
                            fill='#030303'
                          />
                        </svg>
                      )}
                      {isCompleted && (
                        <svg
                          width='16'
                          height='17'
                          viewBox='0 0 16 17'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002Z'
                            fill='white'
                          />
                          <path
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M11.5448 5.76964C11.672 5.88626 11.6806 6.08394 11.564 6.21117L6.98069 11.2112C6.92309 11.274 6.84233 11.3106 6.75711 11.3124C6.6719 11.3143 6.58962 11.2812 6.52935 11.221L4.44602 9.13764C4.32398 9.0156 4.32398 8.81774 4.44602 8.6957C4.56806 8.57366 4.76592 8.57366 4.88796 8.6957L6.74051 10.5482L11.1033 5.78884C11.2199 5.66161 11.4176 5.65302 11.5448 5.76964Z'
                            fill='#030303'
                            stroke='#030303'
                            strokeWidth='0.833333'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className='absolute bottom-0 left-1/2 h-[0.5px] w-screen -translate-x-1/2 bg-[#484848] sm:-mx-4 md:left-0 md:-mx-[75px] md:-translate-x-0 lg:-mx-[150px]' />
    </div>
  );
};

export default Header;
