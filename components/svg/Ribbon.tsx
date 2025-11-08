import React from 'react';

interface RibbonProps {
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

const Ribbon = ({
  primaryColor = '#F5B546',
  secondaryColor = '#A86A05',
  className,
}: RibbonProps) => {
  const gradientId1 = `ribbon-gradient-1-${primaryColor.replace('#', '')}`;
  const gradientId2 = `ribbon-gradient-2-${primaryColor.replace('#', '')}`;
  const gradientId3 = `ribbon-gradient-3-${primaryColor.replace('#', '')}`;

  return (
    <svg
      width='201'
      height='44'
      viewBox='0 0 201 44'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M6.70312 34.1855H40.8879V0.000762939H6.70313L13.5401 17.0932L6.70312 34.1855Z'
        fill={`url(#${gradientId1})`}
      />
      <path
        d='M27.4824 10.0547L40.8882 0.000339508V10.0547L27.4824 10.0547Z'
        fill='black'
        fillOpacity='0.4'
      />
      <path
        d='M193.674 34.1855H159.489V0.000762939H193.674L186.837 17.0932L193.674 34.1855Z'
        fill={`url(#${gradientId2})`}
      />
      <path
        d='M172.895 10.0547L159.489 0.000339508V10.0547L172.895 10.0547Z'
        fill='black'
        fillOpacity='0.4'
      />
      <rect
        width='123.375'
        height='33.4058'
        transform='translate(38.5 10.0557)'
        fill={`url(#${gradientId3})`}
      />
      <defs>
        <linearGradient
          id={gradientId1}
          x1='23.7955'
          y1='34.1855'
          x2='23.7955'
          y2='0.000762939'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor={primaryColor} />
          <stop offset='1' stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient
          id={gradientId2}
          x1='176.581'
          y1='34.1855'
          x2='176.581'
          y2='0.000762939'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor={primaryColor} />
          <stop offset='1' stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient
          id={gradientId3}
          x1='61.6875'
          y1='0'
          x2='61.6875'
          y2='33.4058'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor={primaryColor} />
          <stop offset='1' stopColor={secondaryColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Ribbon;
