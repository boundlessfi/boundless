import React from 'react';

interface MiddleRightSvgProps {
  svgRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
}

const MiddleRightSvg: React.FC<MiddleRightSvgProps> = ({ svgRefs }) => {
  return (
    <div className='absolute top-1/2 hidden -translate-y-1/2 md:-right-8 md:block lg:right-8 xl:right-64'>
      <svg
        width='366'
        height='14'
        viewBox='0 0 366 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          ref={(el: SVGPathElement | null) => {
            svgRefs.current[3] = el;
          }}
          d='M1 7H362.313'
          stroke='#1F2D11'
          strokeLinecap='round'
        />
        <g filter='url(#filter0_f_2191_14144)'>
          <path
            ref={(el: SVGPathElement | null) => {
              svgRefs.current[4] = el;
            }}
            d='M318.6 7H358.544'
            stroke='url(#paint0_linear_2191_14144)'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </g>
        <defs>
          <filter
            id='filter0_f_2191_14144'
            x='311.6'
            y='0'
            width='53.9443'
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
              result='effect1_foregroundBlur_2191_14144'
            />
          </filter>
          <linearGradient
            id='paint0_linear_2191_14144'
            x1='318.6'
            y1='7.5'
            x2='358.544'
            y2='7.5'
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

export default MiddleRightSvg;
