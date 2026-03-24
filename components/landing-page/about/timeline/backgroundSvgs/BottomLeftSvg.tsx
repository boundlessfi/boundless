import React from 'react';

interface BottomLeftSvgProps {
  svgRefs: React.MutableRefObject<(SVGPathElement | null)[]>;
}

const BottomLeftSvg: React.FC<BottomLeftSvgProps> = ({ svgRefs }) => {
  return (
    <div className='absolute top-1/2 hidden -translate-y-1/2 md:-left-8 md:block lg:left-8 xl:left-64'>
      <svg
        width='378'
        height='75'
        viewBox='0 0 378 75'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          ref={(el: SVGPathElement | null) => {
            svgRefs.current[5] = el;
          }}
          d='M376.5 1H331.641L288.749 39H203.752L171.03 68.5H7'
          stroke='url(#paint0_linear_2191_14135)'
          strokeOpacity='0.9'
          strokeWidth='2'
          strokeLinecap='round'
        />
        <g filter='url(#filter0_f_2191_14135)'>
          <path
            ref={(el: SVGPathElement | null) => {
              svgRefs.current[6] = el;
            }}
            d='M235.625 39H273.008'
            stroke='url(#paint1_linear_2191_14135)'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </g>
        <g filter='url(#filter2_f_2191_14135)'>
          <path
            ref={(el: SVGPathElement | null) => {
              svgRefs.current[7] = el;
            }}
            d='M7.39258 68H47.53'
            stroke='url(#paint3_linear_2191_14135)'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </g>
        <defs>
          <filter
            id='filter0_f_2191_14135'
            x='228.625'
            y='32'
            width='51.3828'
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
              result='effect1_foregroundBlur_2191_14135'
            />
          </filter>
          <filter
            id='filter2_f_2191_14135'
            x='0.392578'
            y='61'
            width='54.1372'
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
              result='effect1_foregroundBlur_2191_14135'
            />
          </filter>
          <linearGradient
            id='paint0_linear_2191_14135'
            x1='7.00001'
            y1='69'
            x2='297.086'
            y2='221.154'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#24FF95' />
            <stop offset='0.278845' stopColor='#18A15F' stopOpacity='0.7' />
            <stop offset='1' stopColor='#030303' />
          </linearGradient>
          <linearGradient
            id='paint1_linear_2191_14135'
            x1='235.625'
            y1='39.5'
            x2='273.008'
            y2='39.5'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#2EEDAA' stopOpacity='0' />
            <stop offset='0.494762' stopColor='#2EEDAA' />
            <stop offset='1' stopColor='#2EEDAA' stopOpacity='0' />
          </linearGradient>
          <linearGradient
            id='paint3_linear_2191_14135'
            x1='7.39258'
            y1='68.5'
            x2='47.53'
            y2='68.5'
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

export default BottomLeftSvg;
