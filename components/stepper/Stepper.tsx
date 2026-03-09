import { Check } from 'lucide-react';
import React from 'react';

type StepState = 'pending' | 'active' | 'completed';

interface Step {
  title: string;
  description: string;
  state: StepState;
}

interface StepperProps {
  steps: Step[];
}

function Stepper({ steps }: StepperProps) {
  const getStepStyles = (state: StepState) => {
    switch (state) {
      case 'completed':
        return {
          title: 'text-card',
          description: 'text-white/60',
          line: 'border-primary',
        };
      case 'active':
        return {
          circle:
            'bg-primary text-background border border-stepper-border-active/25',
          title: 'text-card text-white',
          description: 'text-white/60',
          line: 'border-card/30',
        };
      case 'pending':
      default:
        return {
          circle:
            'bg-stepper-foreground text-muted-foreground border border-stepper-border',
          title: 'text-stepper-text-inactive',
          description: 'text-white/40',
          line: 'border-card/30',
        };
    }
  };

  return (
    <div className='mb-8 flex w-full flex-row items-center justify-between md:sticky md:top-0 md:mb-0 md:max-w-[400px] md:flex-col md:items-start md:justify-start'>
      {steps.map((step, index) => {
        const styles = getStepStyles(step.state);
        const isLastStep = index === steps.length - 1;

        return (
          <figure
            key={index}
            className='group relative flex flex-1 flex-col items-center gap-2 md:flex-none md:flex-row md:items-start md:gap-4'
          >
            {/* Horizontal Line for Mobile (connects to next step circle) */}
            {!isLastStep && (
              <div
                className={`absolute top-6 right-[calc(-50%+23px)] left-[calc(50%+23px)] h-[1.5px] border-t border-dashed ${styles.line} md:hidden`}
              />
            )}

            <div className='z-10 flex flex-col items-center bg-black px-2 md:bg-transparent md:px-0'>
              {step.state === 'completed' ? (
                <div className='bg-primary/25 flex size-[40px] items-center justify-center rounded-full md:size-[46px]'>
                  <div className='bg-primary flex size-[28px] items-center justify-center rounded-full md:size-[32px]'>
                    <Check
                      className='text-background size-4 md:size-5'
                      strokeWidth={4}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`flex size-[40px] items-center justify-center rounded-full text-lg font-bold md:size-[46px] md:text-xl ${styles.circle}`}
                >
                  {index + 1}
                </div>
              )}
              {/* Vertical Line for Desktop */}
              {!isLastStep && (
                <div
                  className={`hidden h-[49px] w-[1.5px] border-l border-dashed md:block ${styles.line}`}
                />
              )}
            </div>

            <div className='mt-1 flex flex-col items-center gap-1 pt-1 text-center md:mt-0 md:items-start md:gap-2 md:text-left'>
              <h4
                className={`text-xs font-medium sm:text-sm md:text-base ${styles.title}`}
              >
                {step.title}
              </h4>
              <p
                className={`hidden text-sm leading-[145%] md:block ${styles.description}`}
              >
                {step.description}
              </p>
            </div>
          </figure>
        );
      })}
    </div>
  );
}

export default Stepper;
