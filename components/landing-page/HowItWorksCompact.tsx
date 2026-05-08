import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface StepProps {
  number: string;
  title: string;
  body: string;
}

const Step = ({ number, title, body }: StepProps) => (
  <div className='border-border-subtle bg-surface relative flex flex-col gap-4 rounded-2xl border p-6 md:p-8'>
    <div className='relative z-10 flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <div className='border-border-subtle bg-stage text-foreground flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-sm font-medium'>
          {number}
        </div>
        <div className='bg-border-subtle h-px flex-1' />
      </div>

      <h3 className='text-foreground text-xl leading-[1.3] font-semibold md:text-[22px]'>
        {title}
      </h3>

      <p className='text-secondary-text text-[15px] leading-[160%]'>{body}</p>
    </div>
  </div>
);

export default function HowItWorksCompact() {
  return (
    <section className='relative w-full' aria-labelledby='how-it-works-heading'>
      <header className='mx-auto max-w-3xl text-center'>
        <h2
          id='how-it-works-heading'
          className='text-foreground text-3xl leading-[140%] tracking-tight md:text-4xl xl:text-[48px]'
        >
          How Boundless works
        </h2>
      </header>

      <div className='mt-12 grid gap-5 md:mt-16 md:grid-cols-3'>
        <Step
          number='01'
          title='Set up the program.'
          body='The organizer (or builder, for campaigns) defines the program type, the participants or backers, and the release condition.'
        />
        <Step
          number='02'
          title='Funds enter on-chain escrow.'
          body="Funds sit in a Soroban smart contract. They do not move until the program's release condition is met."
        />
        <Step
          number='03'
          title='Release on verification.'
          body="Verified outcomes — judged work, completed milestones, accepted submissions — release funds to the recipient on-chain. Disputes route through the platform's resolution flow."
        />
      </div>

      <div className='mt-10 flex justify-center'>
        <Link
          href='/how-it-works'
          className='text-mint group inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline'
        >
          Read the full mechanism
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </div>
    </section>
  );
}
