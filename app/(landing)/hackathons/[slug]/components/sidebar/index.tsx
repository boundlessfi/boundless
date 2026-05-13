import React from 'react';
import PoolAndAction from './PoolAndAction';
import FollowAndMessage from './FollowAndMessage';
import MySubmissionPanel from './MySubmissionPanel';

const Sidebar = () => {
  return (
    <div className='sticky top-24 w-full space-y-4'>
      <MySubmissionPanel />
      <div className=''>
        <PoolAndAction />
      </div>
      <FollowAndMessage />
    </div>
  );
};

export default Sidebar;
