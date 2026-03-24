import React from 'react';

interface TopRightSvgProps {
  svgRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
}

const TopRightSvg: React.FC<TopRightSvgProps> = ({ svgRefs }) => {
  return (
    <div className='absolute top-0 hidden md:right-12 md:block lg:right-24'>
      <svg
        width='295'
        height='62'
        viewBox='0 0 295 62'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          ref={(el: SVGPathElement | null) => {
            svgRefs.current[0] = el;
          }}
          d='M287.734 32H254.341L230.6 1L89.7574 1L45.1129 60.5H1'
          stroke='url(#paint0_linear_2191_14130)'
          strokeOpacity='0.9'
          strokeWidth='2'
          strokeLinecap='round'
        />
        <g filter='url(#filter0_f_2191_14130)'>
          <path
            ref={(el: SVGPathElement | null) => {
              svgRefs.current[1] = el;
            }}
            d='M260.894 32H287.999'
            stroke='url(#paint1_linear_2191_14130)'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </g>
        <defs>
          <filter
            id='filter0_f_2191_14130'
            x='253.894'
            y='25'
            width='41.1055'
            height='14'
            filterUnits='userSpaceOnUse'
            colorInterpolationFilters='sRGB'
          >
            <feFlood floodOpacity='0' result='BackgroundImageFix' />
            <feBlend
              mode='normal'
              in='SourceGraphic'
              in2='BackgroundImageFix'
              result='shape'
            />
            <feGaussianBlur
              stdDeviation='3'
              result='effect1_foregroundBlur_2191_14130'
            />
          </filter>
          <linearGradient
            id='paint0_linear_2191_14130'
            x1='37.5005'
            y1='55.3591'
            x2='263.176'
            y2='137.362'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#030303' />
            <stop offset='0.75' stopColor='#24FF95' stopOpacity='0.24' />
            <stop offset='1' stopColor='#24FF95' />
          </linearGradient>
          <linearGradient
            id='paint1_linear_2191_14130'
            x1='260.894'
            y1='32.5'
            x2='287.999'
            y2='32.5'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#2EEDAA' stopOpacity='0' />
            <stop offset='0.494762' stopColor='#2EEDAA' />
            <stop offset='1' stopColor='#2EEDAA' stopOpacity='0' />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default TopRightSvg;
