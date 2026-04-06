import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md';
}

const AuthCard = ({ children, className, maxWidth = 'md' }: AuthCardProps) => {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div
        className={cn(
          'w-full',
          maxWidth === 'md' ? 'max-w-[600px]' : 'max-w-[500px]'
        )}
      >
        <div
          className={cn(
            'group relative rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
            className
          )}
        >
          <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50' />
          <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30' />
          <div className='relative z-10'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
