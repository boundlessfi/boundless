'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthModeNav } from '@/components/auth/AuthModeNav';
import LoginWrapper from '@/components/auth/LoginWrapper';
import SignupWrapper from '@/components/auth/SignupWrapper';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import AuthCard from '@/components/auth/AuthCard';

const getModeFromQuery = (mode: string | null): 'signin' | 'signup' => {
  if (mode === 'signup') return 'signup';
  return 'signin';
};

export default function AuthPage() {
  const [loadingState, setLoadingState] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get('mode');
  const invitation = searchParams.get('invitation');

  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(
    getModeFromQuery(modeParam)
  );

  useEffect(() => {
    setCurrentMode(getModeFromQuery(modeParam));
  }, [modeParam]);

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setCurrentMode(newMode);

    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', newMode);
    router.replace(`/auth?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {loadingState && <AuthLoadingState message='Signing in...' />}
      <div className='relative z-10'>
        <AuthCard>
          <AuthModeNav
            currentMode={currentMode}
            onModeChange={handleModeChange}
          />

          <div className='mt-2'>
            {currentMode === 'signin' ? (
              <LoginWrapper setLoadingState={setLoadingState} />
            ) : (
              <SignupWrapper
                setLoadingState={setLoadingState}
                invitation={invitation}
              />
            )}
          </div>
        </AuthCard>
      </div>
    </>
  );
}
