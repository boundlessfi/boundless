'use client';

import React, { useState } from 'react';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import ResetPasswordWrapper from '@/components/auth/ResetPasswordWrapper';
import AuthCard from '@/components/auth/AuthCard';

const ResetPassword = () => {
  const [loadingState, setLoadingState] = useState(false);

  return (
    <>
      {loadingState && <AuthLoadingState message='Resetting password...' />}
      <div className='relative z-10'>
        <AuthCard maxWidth='sm'>
          <ResetPasswordWrapper setLoadingState={setLoadingState} />
        </AuthCard>
      </div>
    </>
  );
};

export default ResetPassword;
