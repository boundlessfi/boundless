'use client';

export default function GlowBackground() {
  return (
    <>
      {/* <div className='absolute top-0 left-0 w-40 h-36 md:w-120 md:h-140 sm:w-88 sm:h-84 border border-amber-500'> */}
      {/* <Image
          src='/Top Glow.svg'
          alt='Top Glow'
          fill
          className='pointer-events-none select-none object-contain border'
          priority
        /> */}
      {/* </div> */}
      <div
        className='absolute top-[-30%] left-[-30%] h-[733px] w-[862px] rounded-full'
        style={{
          background:
            'linear-gradient(273deg, rgba(46, 237, 170, 0.25) 13.84%, rgba(46, 237, 170, 0.50) 73.28%)',
          padding: '146px 527px 555px 303px',
          filter: 'blur(150px)',
        }}
      ></div>
      <div
        className='absolute right-[-30%] bottom-[-30%] h-[733px] w-[862px] rounded-full'
        style={{
          background:
            'linear-gradient(273deg, rgba(46, 237, 170, 0.25) 13.84%, rgba(46, 237, 170, 0.50) 73.28%)',
          padding: '146px 527px 555px 303px',
          filter: 'blur(150px)',
        }}
      ></div>
      <div
        className='absolute top-1/2 left-1/2 h-[733px] w-[1170px] -translate-x-1/2 -translate-y-1/2 rounded-full'
        style={{
          background: '#030303',
          padding: '146px 527px 555px 303px',
          filter: 'blur(150px)',
        }}
      ></div>

      {/* <div className='absolute bottom-0 right-0 w-40 h-36 md:w-130 md:h-120 sm:w-58 sm:h-74 border border-red-500'>
        <Image
          src='/Bottom Glow.svg'
          alt='Bottom Glow'
          fill
          className='pointer-events-none select-none object-cover'
          priority
        />
      </div> */}
    </>
  );
}
