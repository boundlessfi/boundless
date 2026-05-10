import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface StepProps {
  number: string;
  title: string;
  body: string;
}

const Step = ({ number, title, body }: StepProps) => (
  <div className='bg-background-card relative flex flex-col gap-4 rounded-2xl border border-white/10 p-6 md:p-8'>
    <div className='relative z-10 flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-sm font-medium text-white'>
          {number}
        </div>
        <div className='bg-border-subtle h-px flex-1' />
      </div>

      <h3 className='text-xl leading-[1.3] font-semibold text-white md:text-[22px]'>
        {title}
      </h3>

      <p className='text-[15px] leading-[160%] text-white/70'>{body}</p>
    </div>
  </div>
);

export default function HowItWorksCompact() {
  return (
    <section className='relative w-full' aria-labelledby='how-it-works-heading'>
      <header className='mx-auto max-w-3xl text-center'>
        <h2
          id='how-it-works-heading'
          className='text-3xl leading-[140%] tracking-tight text-white md:text-4xl xl:text-[48px]'
        >
          Your Journey, Simplified.
        </h2>
      </header>

      <div className='mt-12 grid gap-5 md:mt-16 md:grid-cols-3'>
        <Step
          number='01'
          title='Define Your Vision.'
          body='Quickly configure your program type, identify your audience, and set the conditions for success.'
        />
        <Step
          number='02'
          title='Secure Your Funds.'
          body='Funds are held securely in a Soroban smart contract, releasing only when your predefined conditions are met.'
        />
        <Step
          number='03'
          title='Achieve & Receive.'
          body='Upon verified outcomes — be it judged work, completed milestones, or accepted submissions — funds are automatically disbursed on-chain.'
        />
      </div>

      <div className='mt-10 flex justify-center'>
        <Link
          href='/how-it-works'
          className='text-primary group inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline'
        >
          Dive Deeper into Our Mechanism
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </div>
    </section>
  );
}
