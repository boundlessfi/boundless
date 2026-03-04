'use client';

import {
  ArrowDownUp,
  CircleDollarSign,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    id: 'grant-flow',
    title: 'Full Grant Flow & Architecture',
    description:
      'End-to-end grant lifecycle system covering submission, evaluation, approval, and fund distribution.',
    icon: ArrowDownUp,
  },
  {
    id: 'bounty-implementation',
    title: 'Bounty Implementation',
    description:
      'Structured bounty creation with decentralized submission handling and transparent verification.',
    icon: CircleDollarSign,
  },
  {
    id: 'analytics-dashboard',
    title: 'Advanced Analytics Dashboard',
    description:
      'Clear financial and participation metrics with intuitive visual breakdowns.',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    id: 'verified-badging',
    title: 'Verified Project Badging',
    description:
      'Recognition layer for trusted and high-quality ecosystem projects.',
    icon: ShieldCheck,
  },
];

const FeatureBlock = ({
  title,
  description,
  icon: Icon,
  index,
}: Feature & { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className='relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0e0e0e] to-[#1a1a1a] p-10'
    >
      <div className='pointer-events-none absolute -top-16 -right-16 opacity-5'>
        <Icon className='h-64 w-64' />
      </div>

      <div className='mb-6 flex items-center gap-2 text-sm text-[#a7f950]'>
        <div className='h-2 w-2 animate-pulse rounded-full bg-[#a7f950]' />
        In Progress
      </div>

      <h3 className='text-2xl font-semibold tracking-tight text-white'>
        {title}
      </h3>

      <p className='mt-4 max-w-xl text-sm leading-relaxed text-neutral-400'>
        {description}
      </p>
    </motion.div>
  );
};

const ComingSoon = () => {
  return (
    <section className='py-24'>
      <div className='mx-auto max-w-6xl px-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='mb-20 max-w-2xl'
        >
          <h1 className='text-5xl font-bold tracking-tight text-white md:text-6xl'>
            Coming Soon
          </h1>
          <p className='mt-6 text-lg text-neutral-400'>
            We’re building foundational systems to power a more transparent,
            efficient grant and bounty ecosystem.
          </p>
        </motion.div>

        <div className='flex flex-col gap-12'>
          {features.map((feature, index) => (
            <FeatureBlock key={feature.id} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
