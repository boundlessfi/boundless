import React from 'react';
import PoolAndAction from './PoolAndAction';
import FollowAndMessage from './FollowAndMessage';

const Sidebar = () => {
  return (
    <div className='sticky top-24 w-full space-y-4'>
      <div className=''>
        <PoolAndAction />
      </div>
      <FollowAndMessage />
    </div>
  );
};

export default Sidebar;
