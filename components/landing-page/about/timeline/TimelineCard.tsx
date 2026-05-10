'use client';

import Image from 'next/image';

interface TimelineCardProps {
  img: string;
  year: string;
  title: string;
  subTitle: string;
  backgroundImage: string;
  isActive?: boolean;
  className?: string;
}

export default function TimelineCard({
  img,
  year,
  title,
  subTitle,
  backgroundImage,
  isActive = false,
  className = '',
}: TimelineCardProps) {
  return (
    <div className={`relative w-full max-w-[550px] ${className}`}>
      <div
        className='absolute -inset-0.5 z-0 rounded-[12px] mix-blend-hard-light blur-[15px]'
        style={{
          background:
            'linear-gradient(273deg, rgba(46, 237, 170, 0.10) 93.84%, rgba(58, 230, 178, 0.4) 3.28%)',
        }}
        aria-hidden='true'
      />

      <article
        className={`${backgroundImage} time-card-general-background-positioning relative z-10 flex min-h-[350px] w-full flex-col gap-8 overflow-hidden rounded-lg bg-[#101010] px-6 pt-6 pb-8 text-white md:min-h-[400px] md:gap-20 md:pb-[91px]`}
        aria-labelledby={`timeline-${year}-title`}
        aria-describedby={isActive ? `timeline-${year}-description` : undefined}
      >
        <header className='flex items-center justify-between'>
          <div className='my-gradient-box flex h-16 w-16 items-center justify-center rounded-xl md:h-20 md:w-20'>
            <Image
              src={img}
              width={48}
              height={48}
              className='size-10 md:size-12'
              alt={`${title} timeline icon`}
              loading='lazy'
              quality={90}
            />
          </div>

          <time
            className='text-sm leading-[120%] font-medium tracking-[-2%] text-white uppercase md:text-base'
            dateTime={year}
          >
            {year}
          </time>
        </header>

        <div className='flex flex-col gap-6 md:gap-11'>
          <h3
            id={`timeline-${year}-title`}
            className='text-xl leading-[120%] font-medium tracking-[-2%] uppercase md:text-2xl'
          >
            {title}
          </h3>
          <p
            id={`timeline-${year}-description`}
            className='max-w-[300px] text-sm leading-[160%] font-normal text-[#B5B5B5] md:text-base'
          >
            {subTitle}
          </p>
        </div>
      </article>
    </div>
  );
}
