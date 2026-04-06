'use client';

import React, { useState } from 'react';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import ForgotPasswordWrapper from '@/components/auth/ForgotPasswordWrapper';
import AuthCard from '@/components/auth/AuthCard';

const ForgotPassword = () => {
  const [loadingState, setLoadingState] = useState(false);

  return (
    <>
      {loadingState && <AuthLoadingState message='Sending reset link...' />}
      <div className='relative z-10'>
        <AuthCard maxWidth='sm'>
          <ForgotPasswordWrapper setLoadingState={setLoadingState} />
        </AuthCard>
      </div>
    </>
  );
};

export default ForgotPassword;
