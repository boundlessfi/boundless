import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  CircleDollarSign,
  Globe2,
  ShieldCheck,
} from 'lucide-react';

interface ReasonProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const Reason = ({ icon, title, body }: ReasonProps) => (
  <div className='flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5'>
    <div className='bg-background-card flex h-9 w-9 items-center justify-center rounded-lg border border-white/10'>
      <div className='text-white/75'>{icon}</div>
    </div>
    <h3 className='text-base font-semibold text-white md:text-lg'>{title}</h3>
    <p className='text-sm leading-[160%] text-white/70'>{body}</p>
  </div>
);

export default function WhyStellar() {
  return (
    <section className='relative w-full' aria-labelledby='why-stellar-heading'>
      <div className='bg-background-card relative overflow-hidden rounded-[24px] border border-white/10 p-8 md:p-12 lg:p-16'>
        <div className='relative grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16'>
          <header className='flex flex-col justify-center'>
            <p className='text-primary text-sm font-medium tracking-wide uppercase'>
              Built on Stellar
            </p>
            <h2
              id='why-stellar-heading'
              className='mt-3 text-3xl leading-[120%] tracking-tight text-white md:text-4xl xl:text-[44px]'
            >
              The Stellar Advantage.
            </h2>
            <p className='mt-5 text-base leading-[170%] text-white/70 md:text-lg'>
              Boundless leverages Stellar to deliver unparalleled speed,
              cost-efficiency, and reliability. Experience near-instant fund
              finalization, minimal transaction fees, native USDC support for
              frictionless funding, and robust dispute resolution powered by
              Soroban&apos;s clawback functionality.
            </p>
            <Link
              href='https://stellar.org/'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-primary group mt-6 inline-flex items-center gap-2 self-start text-sm font-medium text-white underline-offset-4 hover:underline'
            >
              Explore Stellar&apos;s Power
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </header>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Reason
              icon={<Zap size={18} strokeWidth={1.75} />}
              title='3–5 second finality'
              body='Transactions finalize in 3–5 seconds, so funds release at human speed.'
            />
            <Reason
              icon={<CircleDollarSign size={18} strokeWidth={1.75} />}
              title='Sub-cent fees'
              body='Fees are fractions of a cent, so on-chain milestone checks are not economically prohibitive.'
            />
            <Reason
              icon={<Globe2 size={18} strokeWidth={1.75} />}
              title='Native USDC'
              body='USDC is native on Stellar, so funding rounds work without bridging.'
            />
            <Reason
              icon={<ShieldCheck size={18} strokeWidth={1.75} />}
              title='Soroban clawback'
              body='Soroban supports clawback, which gives every program a working dispute path.'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
