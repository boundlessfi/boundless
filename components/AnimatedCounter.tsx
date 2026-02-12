import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

const AnimatedCounter = ({
  value,
  className = '',
  duration = 1,
}: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, count, duration]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedCounter;
