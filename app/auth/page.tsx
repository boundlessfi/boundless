'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthModeNav } from '@/components/auth/AuthModeNav';
import LoginWrapper from '@/components/auth/LoginWrapper';
import SignupWrapper from '@/components/auth/SignupWrapper';
import AuthLoadingState from '@/components/auth/AuthLoadingState';

export default function AuthPage() {
  const [loadingState, setLoadingState] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get('mode');
  const invitation = searchParams.get('invitation');

  // Determine initial mode from query parameter, default to 'signin'
  const getModeFromQuery = (mode: string | null): 'signin' | 'signup' => {
    if (mode === 'signup') return 'signup';
    if (mode === 'signin') return 'signin';
    return 'signin'; // default
  };

  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(
    getModeFromQuery(modeParam)
  );

  // Sync state with query parameter changes
  useEffect(() => {
    const mode = getModeFromQuery(modeParam);
    setCurrentMode(mode);
  }, [modeParam]);

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setCurrentMode(newMode);

    // Update URL with new mode, preserving other query parameters
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', newMode);
    router.replace(`/auth?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {loadingState && <AuthLoadingState message='Signing in...' />}
      <div className='relative z-10 flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-[600px]'>
          <div className='group relative rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-2 hover:border-white/30 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'>
            <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50'></div>

            <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30'></div>

            <div className='relative z-10'>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
