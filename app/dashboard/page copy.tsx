'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  LogOut,
  User,
  Mail,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useAuthActions } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();
  const { logout } = useAuthActions();

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push('/auth?mode=signin');
    }
  }, [session, sessionPending, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  if (sessionPending) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#030303]'>
        <div className='flex items-center space-x-3'>
          <Loader2 className='h-6 w-6 animate-spin text-[#a7f950]' />
          <span className='text-white/80'>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-[#030303] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-4xl font-bold text-white'>Dashboard</h1>
            <p className='mt-2 text-sm text-white/60'>
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant='outline'
            className='border-white/20 bg-white/5 text-white/80 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white'
          >
            <LogOut className='mr-2 h-4 w-4' />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Profile Card */}
          <Card className='group relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#a7f950]/10'>
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50'></div>
            <CardHeader className='relative z-10'>
              <CardTitle className='flex items-center text-white'>
                <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#a7f950]/10'>
                  <User className='h-5 w-5 text-[#a7f950]' />
                </div>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className='relative z-10'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-14 w-14 border-2 border-white/10'>
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback className='bg-white/10 text-white'>
                    {session.user.name?.charAt(0) ||
                      session.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-semibold text-white'>
                    {session.user.name || 'No name'}
                  </p>
                  <p className='truncate text-sm text-white/60'>
                    {session.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className='group relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#a7f950]/10'>
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50'></div>
            <CardHeader className='relative z-10'>
              <CardTitle className='flex items-center text-white'>
                <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#a7f950]/10'>
                  <Mail className='h-5 w-5 text-[#a7f950]' />
                </div>
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className='relative z-10 space-y-3'>
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-white/50'>User ID</span>
                <span className='font-mono text-sm text-white/90'>
                  {session.user.id}
                </span>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-white/50'>Email</span>
                <span className='text-sm text-white/90'>
                  {session.user.email}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className='group relative overflow-hidden border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-[#a7f950]/10'>
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-50'></div>
            <CardHeader className='relative z-10'>
              <CardTitle className='flex items-center text-white'>
                <div className='mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#a7f950]/10'>
                  <Shield className='h-5 w-5 text-[#a7f950]' />
                </div>
                Status & Verification
              </CardTitle>
            </CardHeader>
            <CardContent className='relative z-10 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-white/60'>Email Status</span>
                <div className='flex items-center gap-2'>
                  {session.user.emailVerified ? (
                    <>
                      <CheckCircle2 className='h-4 w-4 text-[#a7f950]' />
                      <span className='text-sm font-medium text-[#a7f950]'>
                        Verified
                      </span>
                    </>
                  ) : (
                    <span className='text-sm font-medium text-white/60'>
                      Unverified
                    </span>
                  )}
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-white/60'>Account Status</span>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-[#a7f950]'></div>
                  <span className='text-sm font-medium text-[#a7f950]'>
                    Active
                  </span>
                </div>
              </div>
              {(session.user as { lastLoginMethod?: string | null })
                ?.lastLoginMethod && (
                <div className='flex items-center justify-between border-t border-white/10 pt-2'>
                  <span className='text-sm text-white/60'>
                    Last Login Method
                  </span>
                  <span className='text-sm font-medium text-white/90 capitalize'>
                    {(() => {
                      const method = (
                        session.user as { lastLoginMethod?: string | null }
                      ).lastLoginMethod;
                      return method === 'google'
                        ? 'Google'
                        : method === 'email'
                          ? 'Email'
                          : method || 'N/A';
                    })()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Welcome Card */}
        <div className='mt-8'>
          <Card className='group relative overflow-hidden border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-[#a7f950]/10'>
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50'></div>
            <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[#a7f950]/5 via-transparent to-transparent opacity-30'></div>
            <CardHeader className='relative z-10'>
              <CardTitle className='text-2xl text-white'>
                Welcome to Boundless
              </CardTitle>
              <CardDescription className='text-white/60'>
                Your platform for crowdfunding and grants
              </CardDescription>
            </CardHeader>
            <CardContent className='relative z-10'>
              <p className='leading-relaxed text-white/80'>
                This is your dashboard where you can manage your projects, view
                contributions, and access all the features of the platform. The
                authentication system is now working properly!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
