import { NextRequest, NextResponse } from 'next/server';

const KNOWN_STATES = new Set([
  'not_started',
  'in_progress',
  'in_review',
  'approved',
  'declined',
  'abandoned',
  'expired',
]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // Backend (`GET /api/didit/callback` on NestJS) forwards an authoritative
  // `state` from the DB. Didit's hosted flow may instead arrive here directly
  // with `?status=Approved` (legacy) or `?verification=complete` (legacy).
  // We normalize all of those, but only the new `state` is trusted as a
  // status — the rest just route the user back to settings.
  const stateRaw = params.get('state');
  const state = stateRaw && KNOWN_STATES.has(stateRaw) ? stateRaw : 'in_review';

  const redirectUrl = new URL('/me/settings', request.nextUrl.origin);
  redirectUrl.searchParams.set('verification', state);
  redirectUrl.searchParams.set('tab', 'identity');
  const sessionId = params.get('session_id');
  if (sessionId) redirectUrl.searchParams.set('session_id', sessionId);

  return NextResponse.redirect(redirectUrl, 302);
}
