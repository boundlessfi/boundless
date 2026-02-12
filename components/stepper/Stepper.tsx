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
    <div className='sticky top-0 flex w-full max-w-[400px] flex-col'>
      {steps.map((step, index) => {
        const styles = getStepStyles(step.state);
        const isLastStep = index === steps.length - 1;

        return (
          <figure key={index} className='flex gap-4'>
            <div className='flex flex-col items-center'>
              {step.state === 'completed' ? (
                <div className='bg-primary/25 flex size-[46px] items-center justify-center rounded-full'>
                  <div className='bg-primary flex size-[32px] items-center justify-center rounded-full'>
                    <Check className='text-background size-5' strokeWidth={4} />
                  </div>
                </div>
              ) : (
                <div
                  className={`flex size-[46px] items-center justify-center rounded-full text-xl font-bold ${styles.circle}`}
                >
                  {index + 1}
                </div>
              )}
              {!isLastStep && (
                <div
                  className={`h-[49px] w-[1.5px] border-l border-dashed ${styles.line}`}
                />
              )}
            </div>

            <div className='flex flex-col gap-2 pt-1'>
              <h4 className={`font-base font-medium ${styles.title}`}>
                {step.title}
              </h4>
              <p className={`text-sm leading-[145%] ${styles.description}`}>
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
