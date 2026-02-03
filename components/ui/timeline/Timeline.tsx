import React from 'react';
import { TimelineProps } from './types';
import TimelineItem from './TimelineItem';

const Timeline: React.FC<TimelineProps> = ({
  items,
  className = '',
  showConnector = true,
  orientation = 'vertical',
  projectSlug,
}) => {
  const getOrientationStyles = () => {
    switch (orientation) {
      case 'horizontal':
        return 'flex flex-row items-center overflow-x-auto pb-4';
      case 'vertical':
      default:
        return 'flex flex-col';
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className='flex hidden items-center justify-center py-8'>
        <p className='text-sm text-gray-500'>No timeline items available</p>
      </div>
    );
  }

  return (
    <ul className={`${getOrientationStyles()} ${className}`}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          showConnector={showConnector}
          projectSlug={projectSlug}
        />
      ))}
    </ul>
  );
};

export default Timeline;
