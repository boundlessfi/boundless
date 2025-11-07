import React from 'react';

export const getRibbonColors = (rank: number) => {
  if (rank === 1) {
    return {
      primaryColor: '#F5B546',
      secondaryColor: '#A86A05',
    };
  }
  if (rank === 2) {
    return {
      primaryColor: '#174680',
      secondaryColor: '#102E53',
    };
  }
  if (rank === 3) {
    return {
      primaryColor: '#DD524D',
      secondaryColor: '#B72A25',
    };
  }
  return {
    primaryColor: '#6B7280',
    secondaryColor: '#4B5563',
  };
};

export const getRibbonText = (rank: number): React.ReactNode => {
  const suffix =
    rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
  return (
    <>
      {rank}
      <sup className='font-semibold'>{suffix}</sup> Position
    </>
  );
};
