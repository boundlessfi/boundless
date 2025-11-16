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
import { Loader2, LogOut, User, Mail, Shield } from 'lucide-react';
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
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <Button onClick={handleSignOut} variant='outline'>
            <LogOut className='mr-2 h-4 w-4' />
            Sign Out
          </Button>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <User className='mr-2 h-5 w-5' />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) ||
                      session.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>
                    {session.user.name || 'No name'}
                  </p>
                  <p className='text-sm text-gray-500'>{session.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Mail className='mr-2 h-5 w-5' />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>User ID:</span>
                <span className='font-mono text-sm'>{session.user.id}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-500'>Email:</span>
                <span className='text-sm'>{session.user.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Shield className='mr-2 h-5 w-5' />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Role:</span>
                  <span className='text-sm font-medium capitalize'>
                    {session.user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Status:</span>
                  <span className='text-sm text-green-600'>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Boundless Project</CardTitle>
              <CardDescription>
                Your platform for crowdfunding and grants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>
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
