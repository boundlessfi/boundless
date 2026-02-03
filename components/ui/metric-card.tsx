import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface MetricCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function MetricCard({
  children,
  className,
  contentClassName,
}: MetricCardProps) {
  return (
    <Card
      className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}
    >
      <CardContent className={cn('p-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
