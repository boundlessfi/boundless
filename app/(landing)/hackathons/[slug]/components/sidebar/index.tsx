import React from 'react';
import PoolAndAction from './PoolAndAction';
import FollowAndMessage from './FollowAndMessage';

const Sidebar = () => {
  return (
    <div className='w-full'>
      <PoolAndAction />
      <FollowAndMessage />
    </div>
  );
};

export default Sidebar;
