'use client';
import {
  ArrowDownUp,
  CircleDollarSign,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: FeatureCardProps[] = [
  {
    title: 'Full Grant Flow & Architecture',
    description: 'End-to-end grant application and approval system',
    icon: ArrowDownUp,
  },
  {
    title: 'Bounty Implementation',
    description: 'Decentralized bounty posting and submission verification',
    icon: CircleDollarSign,
  },
  {
    title: 'Advanced Analytics Dashboard',
    description: 'Visualized financial data and participation metrics',
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: 'Verified Project Badging',
    description: 'System for certifying high-quality projects',
    icon: ShieldCheck,
  },
];

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  index,
}: FeatureCardProps & { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className='text-card-foreground group border-border/50 bg-card/50 hover:border-border hover:bg-card relative flex flex-col gap-6 overflow-hidden rounded-xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-300'
    >
      <div className='bg-muted-foreground/10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg'>
        <Icon className='h-6 w-6' />
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-foreground font-semibold'>{title}</h3>
          <span className='inline-flex w-fit shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md border border-[#a7f950] bg-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[#a7f950]'>
            In Progress
          </span>
        </div>
        <p className='text-muted-foreground text-sm leading-relaxed'>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const ComingSoon = () => {
  return (
    <section className='py-16'>
      <div className='container mx-auto px-6 md:px-8 lg:px-12'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='lg:col-span-4'
          >
            <h1 className='flex items-center gap-3 text-4xl font-bold tracking-tight md:text-6xl lg:text-6xl'>
              Coming Soon
            </h1>
            <p className='text-muted-foreground mt-4'>
              We are working on these features and they will be available soon.
            </p>
          </motion.div>

          <div className='lg:col-span-8'>
            <div className='grid grid-cols-1 gap-4'>
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
