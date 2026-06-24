import React from 'react';
import PoolAndAction from './PoolAndAction';
import FollowAndMessage from './FollowAndMessage';
import MySubmissionPanel from './MySubmissionPanel';
import MyInvitationsPanel from './MyInvitationsPanel';

const Sidebar = () => {
  return (
    <div className='sticky top-24 w-full space-y-4'>
      {/* Invitations first — usually a one-time call to action that
          shouldn't be buried below the static hackathon panels. */}
      <MyInvitationsPanel />
      <MySubmissionPanel />
      <div className=''>
        <PoolAndAction />
      </div>
      <FollowAndMessage />
    </div>
  );
};

export default Sidebar;
