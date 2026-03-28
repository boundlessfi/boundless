import React from 'react';

const CleanBannerBg = () => {
  return (
    <div className='relative h-full w-full'>
      <div className='pointer-events-none absolute inset-0 rounded-[3.2rem] border border-[#2EEDAA] [mask-image:linear-gradient(to_bottom,white,white,rgba(255,255,255,0.3))] [mask-size:100%_100%] [mask-repeat:no-repeat]' />

      <svg
        viewBox='0 0 1240 323'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='block h-full w-full rounded-[3.2rem] border-transparent bg-[#030303]'
        preserveAspectRatio='none'
      >
        <defs>
          <linearGradient
            id='paint0_linear_2175_8266'
            x1='718'
            y1='178'
            x2='718'
            y2='0'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#030303' />
            <stop offset='0.55925' stopColor='#030303' />
            <stop offset='1' stopColor='#030303' stopOpacity='0' />
          </linearGradient>

          <clipPath id='clip1_2175_8266'>
            <rect
              width='1236'
              height='216'
              fill='white'
              transform='translate(4 2)'
            />
          </clipPath>

          <mask
            id='mask0_2175_8266'
            style={{ maskType: 'luminance' }}
            maskUnits='userSpaceOnUse'
            x='-21'
            y='-135'
            width='1271'
            height='903'
          >
            <path
              d='M987.833 -134.357H240.717C96.4446 -134.357 -20.5115 -70.0941 -20.5115 9.17879V623.514C-20.5115 702.787 96.4446 767.05 240.717 767.05H987.833C1132.11 767.05 1249.06 702.787 1249.06 623.514V9.17879C1249.06 -70.0941 1132.11 -134.357 987.833 -134.357Z'
              fill='white'
            />
          </mask>
        </defs>

        {/* Decorative pattern area */}
        <g clipPath='url(#clip1_2175_8266)'>
          <g mask='url(#mask0_2175_8266)'>
            <path
              d='M401.91 1719.21L2186.79 -681.116L2281.73 -553.44L496.851 1846.88L401.91 1719.21Z'
              fill='#2EEDAA'
              fillOpacity='0.6'
            />
            <path
              opacity='0.5'
              d='M401.91 1466.21L2186.79 -934.116L2281.73 -806.44L496.851 1593.88L401.91 1466.21Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.4'
              d='M213.411 1466.21L1999.11 -934.116L2094.09 -806.44L308.396 1593.88L213.411 1466.21Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.35'
              d='M25.7734 1466.21L1810.65 -934.116L1905.6 -806.44L120.713 1593.88L25.7734 1466.21Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.3'
              d='M-27.5913 1285.21L1757.29 -1115.12L1852.23 -987.44L67.3494 1412.88L-27.5913 1285.21Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.25'
              d='M-55.1345 1069.21L1730.56 -1331.12L1825.55 -1203.44L39.8488 1196.88L-55.1345 1069.21Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.2'
              d='M-135.182 924.207L1649.7 -1476.12L1744.64 -1348.44L-40.242 1051.88L-135.182 924.207Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.15'
              d='M-323.68 924.207L1462.02 -1476.12L1557 -1348.44L-228.696 1051.88L-323.68 924.207Z'
              fill='#2EEDAA'
            />
            <path
              opacity='0.1'
              d='M-511.318 924.207L1273.56 -1476.12L1368.5 -1348.44L-416.378 1051.88L-511.318 924.207Z'
              fill='#2EEDAA'
            />
          </g>

          {/* Gradient overlay */}
          <rect
            width='1436'
            height='178'
            transform='translate(-96 85)'
            fill='url(#paint0_linear_2175_8266)'
          />
        </g>
      </svg>
    </div>
  );
};

export default CleanBannerBg;
