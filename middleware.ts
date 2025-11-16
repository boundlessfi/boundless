import { NextRequest, NextResponse } from 'next/server';
import { getBetterAuthSession } from '@/lib/auth/server-auth';

const protectedRoutes = ['/dashboard', '/user', '/admin', '/me'];

const authRoutes = ['/auth', '/auth/signup', '/auth/forgot-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get cookies from request for Better Auth session check
  const cookieHeader = req.headers.get('cookie') || '';

  // Debug: Log if better-auth.session_token cookie is present
  if (process.env.NODE_ENV === 'development') {
    const hasSessionToken = cookieHeader.includes('better-auth.session_token');
    console.log(
      `[Middleware] ${pathname} - Has session token: ${hasSessionToken}`
    );
  }

  // Check authentication using Better Auth session
  // In middleware, we need to pass cookies directly
  const betterAuthSession = await getBetterAuthSession(cookieHeader);
  const isAuthenticated = !!betterAuthSession?.user;

  // Debug: Log authentication status
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}`);
  }

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect all users to waitlist if not already on waitlist page
  // Exclude API routes, static assets, and other necessary paths
  // const shouldRedirect =
  //   pathname !== '/waitlist' &&
  //   !pathname.startsWith('/api') &&
  //   !pathname.startsWith('/_next') &&
  //   !pathname.startsWith('/favicon.ico') &&
  //   !pathname.startsWith('/public') &&
  //   !pathname.match(
  //     /\.(png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|woff|woff2|ttf|eot)$/i
  //   );

  // if (shouldRedirect) {
  //   return NextResponse.redirect(
  //     new URL('https://www.boundlessfi.xyz/waitlist')
  //   );
  // }

  const isOtherUserProfile = pathname.startsWith('/profile/');

  // if (process.env.NODE_ENV === 'development') {
  //   // eslint-disable-next-line no-console
  //   console.log(`Middleware: ${pathname} - Auth: ${isAuthenticated}, Protected: ${isProtectedRoute}, Profile: ${isOtherUserProfile}`);
  // }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL('/auth', req.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isOtherUserProfile && !isAuthenticated) {
    const signinUrl = new URL('/auth', req.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
