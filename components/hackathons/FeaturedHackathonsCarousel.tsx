'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import type { Hackathon } from '@/lib/api/hackathons';
import { useHackathonTransform } from '@/hooks/hackathon/use-hackathon-transform';

interface FeaturedHackathonsCarouselProps {
  hackathons: Hackathon[];
  className?: string;
}

const FeaturedHackathonsCarousel = ({
  hackathons,
  className,
}: FeaturedHackathonsCarouselProps) => {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { transformHackathonForCard } = useHackathonTransform();

  useEffect(() => {
    if (!api) return;
    api.on('select', () => setCurrentSlide(api.selectedScrollSnap()));
  }, [api]);

  if (!hackathons || hackathons.length === 0) {
    return null;
  }

  const handleHackathonClick = (
    organizationName: string,
    hackathonSlug: string
  ) => {
    router.push(`/hackathons/${organizationName}/${hackathonSlug}`);
  };

  const getDeadlineText = (deadlineInDays: number): string => {
    if (deadlineInDays <= 0) return 'Ended';
    if (deadlineInDays === 1) return 'Ends tomorrow';
    if (deadlineInDays <= 7) return `Ends in ${deadlineInDays} days`;
    if (deadlineInDays <= 30)
      return `Ends in ${Math.ceil(deadlineInDays / 7)} weeks`;
    return `Ends in ${Math.ceil(deadlineInDays / 30)} months`;
  };

  return (
    <div className={className}>
      <div className='mb-6'>
        <h2 className='text-2xl font-semibold text-white md:text-3xl'>
          Featured Hackathons
        </h2>
        <p className='mt-2 text-sm text-gray-400'>
          Discover the most exciting hackathons happening now
        </p>
      </div>

      <div className='relative w-full overflow-hidden rounded-2xl border border-gray-900 bg-[#030303] p-6 md:p-8'>
        <Carousel
          opts={{ align: 'start', loop: true }}
          setApi={setApi}
          className='w-full'
        >
          <CarouselContent>
            {hackathons.map((hackathon, index) => {
              const orgName =
                '_organizationName' in hackathon
                  ? (hackathon as Hackathon & { _organizationName?: string })
                      ._organizationName
                  : undefined;
              const transformed = transformHackathonForCard(hackathon, orgName);
              const deadlineText = getDeadlineText(transformed.deadlineInDays);

              return (
                <CarouselItem
                  key={hackathon._id || index}
                  className='md:basis-1/2'
                >
                  <div className='hover:border-primary/50 flex h-full flex-col gap-4 rounded-xl border border-gray-800 bg-[#0a0a0a] p-6 transition-all duration-300'>
                    {/* Banner Image */}
                    <div className='relative h-48 w-full overflow-hidden rounded-lg'>
                      <Image
                        src={transformed.hackathonImage}
                        alt={transformed.hackathonTitle}
                        fill
                        className='object-cover'
                        unoptimized
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
                      <div className='absolute right-4 bottom-4 left-4'>
                        <div className='flex items-center gap-2'>
                          <div
                            style={{
                              backgroundImage: `url(${transformed.organizerLogo})`,
                            }}
                            className='size-8 rounded-full bg-white bg-cover bg-center'
                          />
                          <span className='text-sm font-medium text-white'>
                            {transformed.organizerName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='flex flex-1 flex-col gap-3'>
                      <div>
                        <h3 className='line-clamp-2 text-lg font-semibold text-white'>
                          {transformed.hackathonTitle}
                        </h3>
                        <p className='mt-2 line-clamp-2 text-sm text-gray-400'>
                          {transformed.hackathonDescription}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className='flex flex-wrap items-center gap-4 text-sm'>
                        {transformed.prizePool && (
                          <div className='flex items-center gap-2'>
                            <span className='text-gray-500'>Prize Pool:</span>
                            <span className='font-semibold text-white'>
                              {formatNumber(transformed.prizePool.total)}{' '}
                              {transformed.prizePool.currency}
                            </span>
                          </div>
                        )}
                        {transformed.location && (
                          <div className='flex items-center gap-2'>
                            <span className='text-gray-500'>📍</span>
                            <span className='text-gray-400'>
                              {transformed.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Deadline */}
                      <div className='mt-auto flex items-center justify-between'>
                        <span
                          className={`text-sm font-medium ${
                            transformed.deadlineInDays <= 7
                              ? 'text-error-status'
                              : transformed.deadlineInDays <= 30
                                ? 'text-warning-orange-darker'
                                : 'text-success-green-darker'
                          }`}
                        >
                          {deadlineText}
                        </span>
                        <Button
                          onClick={() =>
                            handleHackathonClick(
                              transformed.organizationName,
                              transformed.hackathonSlug
                            )
                          }
                          className='bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium text-black'
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation */}
          <div className='mt-6 flex items-center justify-between'>
            <CarouselPrevious className='relative left-0 h-8 w-8 translate-y-0 border-gray-800 bg-transparent text-white transition-all duration-200 hover:scale-110 hover:bg-gray-800 hover:text-gray-300' />

            <div className='flex items-center gap-2'>
              {hackathons.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'bg-primary w-8'
                      : 'w-2 bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <CarouselNext className='relative right-0 h-8 w-8 translate-y-0 border-gray-800 bg-transparent text-white transition-all duration-200 hover:scale-110 hover:bg-gray-800 hover:text-gray-300' />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default FeaturedHackathonsCarousel;
