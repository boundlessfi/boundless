import { ReactNode, useState } from 'react';
import Image from 'next/image';

interface TestimonialCardProps {
  avatarSrc?: string;
  avatarFallback?: string;
  name: string;
  username: string;
  content: string;
  icon?: ReactNode;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  avatarSrc = '/avatar-placeholder.png',
  avatarFallback = '/avatar-placeholder.png',
  name,
  username,
  content,
  icon,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className='border-primary/20 hover:border-primary/40 mb-6 flex w-[300px] max-w-[300px] transform flex-col gap-4 rounded-[8px] border bg-[#101010] p-6 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(167,249,80,0.3)]'>
      <div className='flex flex-row items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Image
              src={imageError ? avatarFallback : avatarSrc}
              alt={`${name} profile picture`}
              className='ring-primary/30 h-12 w-12 rounded-full object-cover ring-2'
              width={48}
              height={48}
              onError={() => setImageError(true)}
            />
          </div>
          <div className='flex flex-col items-baseline'>
            <p className='text-sm font-bold text-white'>{name}</p>
            <p className='text-xs text-gray-400'>@{username}</p>
          </div>
        </div>
        <div className='bg-primary/10 rounded-full p-2'>{icon}</div>
      </div>
      <p className='relative text-left text-sm leading-relaxed font-normal text-gray-200'>
        {content}
      </p>
    </div>
  );
};

export default TestimonialCard;
