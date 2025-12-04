import { NextRequest, NextResponse } from 'next/server';
import { getBetterAuthSession } from '@/lib/auth/server-auth';

const protectedRoutes = ['/dashboard', '/user', '/admin', '/me'];
const authRoutes = ['/auth', '/auth/signup', '/auth/forgot-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ❌ Block dashboard for everyone
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const betterAuthSession = await getBetterAuthSession(cookieHeader);
  const isAuthenticated = !!betterAuthSession?.user;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Authenticated users should not visit auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Unauthenticated users cannot access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL('/auth', req.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
