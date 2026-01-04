import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const OurTeam = () => {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12'>
      {/* Header Section */}
      <div className='mb-12 text-center md:mb-16 lg:mb-20'>
        <p
          className='mx-auto mb-4 w-fit bg-clip-text text-sm font-medium text-transparent md:text-base'
          style={{
            backgroundImage:
              'linear-gradient(272.61deg, #A7F95080 13.84%, #3AE6B2 73.28%)',
          }}
        >
          Our Team
        </p>

        <h1 className='mb-4 text-center text-2xl leading-tight font-normal text-white sm:text-3xl md:text-4xl lg:text-5xl'>
          Meet the Brains Behind Boundless
        </h1>
        <p
          className='mx-auto max-w-xs bg-clip-text text-center text-sm leading-relaxed text-transparent sm:max-w-md sm:text-base md:max-w-lg md:text-lg lg:max-w-2xl'
          style={{
            backgroundImage:
              'linear-gradient(93.2deg, #B5B5B5 15.93%, #FFFFFF 73.28%)',
          }}
        >
          A passionate team of innovators driving transparency, trust, and
          opportunity in Web3 funding.
        </p>
      </div>

      {/* Team Members Grid */}
      <div className='grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20'>
        {/* Team Member 1 */}
        <div className='flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start md:gap-6'>
          <div className='h-48 w-48 shrink-0 cursor-pointer rounded-xl bg-[#D9D9D9] transition duration-300 hover:scale-105 sm:h-56 sm:w-56 md:h-60 md:w-60 lg:h-64 lg:w-64 xl:h-72 xl:w-72'></div>
          <div className='w-full flex-1 text-center sm:text-left'>
            <h3 className='mb-2 text-xl font-medium text-white md:text-2xl'>
              Collins Ikechukwu
            </h3>
            <p className='mb-4 text-sm font-medium text-[#B5B5B5] italic md:mb-6 md:text-base'>
              Blockchain Developer
            </p>
            <hr
              className='mb-4 h-px w-full border-0 md:mb-6'
              style={{
                background:
                  'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
              }}
            />
            <p className='mb-6 text-sm leading-relaxed text-[#B5B5B5] md:mb-8 md:text-base'>
              A skilled blockchain developer with a focus on decentralized
              finance and smart contract solutions.
            </p>
            <div className='flex items-center justify-center gap-3 sm:justify-start md:gap-4'>
              <div
                style={{
                  border: '1px solid',
                  background:
                    'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                className='flex cursor-pointer items-center justify-center transition duration-300 hover:scale-105'
              >
                <Image
                  src={'/linkedin.svg'}
                  alt='linkedin'
                  width={20}
                  height={20}
                />
              </div>
              <Link
                href='https://x.com/0xdevcollins'
                target='_blank'
                style={{
                  border: '1px solid',
                  background:
                    'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                className='flex cursor-pointer items-center justify-center transition duration-300 hover:scale-105'
              >
                <Image src={'/X.svg'} alt='X' width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Team Member 2 */}
        <div className='flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start md:gap-6'>
          <div className='h-48 w-48 shrink-0 cursor-pointer rounded-xl bg-[#D9D9D9] transition duration-300 hover:scale-105 sm:h-56 sm:w-56 md:h-60 md:w-60 lg:h-64 lg:w-64 xl:h-72 xl:w-72'></div>
          <div className='w-full flex-1 text-center sm:text-left'>
            <h3 className='mb-2 text-xl font-medium text-white md:text-2xl'>
              Nnaji Benjamin
            </h3>
            <p className='mb-4 text-sm font-medium text-[#B5B5B5] italic md:mb-6 md:text-base'>
              Full-Stack & Blockchain Developer
            </p>
            <hr
              className='mb-4 h-px w-full border-0 md:mb-6'
              style={{
                background:
                  'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
              }}
            />
            <p className='mb-6 text-sm leading-relaxed text-[#B5B5B5] md:mb-8 md:text-base'>
              A versatile full-stack and blockchain developer with strong
              experience across Web3 platforms.
            </p>
            <div className='flex items-center justify-center gap-3 sm:justify-start md:gap-4'>
              <Link
                href='https://www.linkedin.com/in/nnaji-benjamin'
                target='_blank'
                style={{
                  border: '1px solid',
                  background:
                    'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                className='flex cursor-pointer items-center justify-center transition duration-300 hover:scale-105'
              >
                <Image
                  src={'/linkedin.svg'}
                  alt='linkedin'
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href='https://x.com/Benjtalkshows'
                target='_blank'
                style={{
                  border: '1px solid',
                  background:
                    'radial-gradient(113.1% 103.23% at 45.52% -1.51%, rgba(255, 255, 255, 0.4704) 0%, rgba(255, 255, 255, 0.0784) 100%)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
                className='flex cursor-pointer items-center justify-center transition duration-300 hover:scale-105'
              >
                <Image src={'/X.svg'} alt='X' width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurTeam;
