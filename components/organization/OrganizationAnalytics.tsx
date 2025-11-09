import React from 'react';

const OrganizationAnalytics = () => {
  return (
    <div className='bg-background-main-bg text-white'>
      <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-bold'>Analytics</h1>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-bold'>Total Participants</h2>
            <p className='text-sm text-gray-400'>1,234</p>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-bold'>Total Participants</h2>
            <p className='text-sm text-gray-400'>1,234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalytics;
