import { NextRequest, NextResponse } from 'next/server';

/**
 * Didit redirect callback: user is sent here after completing verification on Didit.
 * We redirect them to Settings → Identity so they see their updated status.
 * The backend receives the final result via webhook; this route only handles the browser redirect.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const verification = searchParams.get('verification') ?? 'complete';

  const baseUrl = request.nextUrl.origin;
  const redirectUrl = new URL('/me/settings', baseUrl);
  redirectUrl.searchParams.set('verification', verification);

  return NextResponse.redirect(redirectUrl, 302);
}
