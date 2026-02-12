import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { pageTransition } from '@/lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <motion.div
      initial='initial'
      animate='animate'
      exit='exit'
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
