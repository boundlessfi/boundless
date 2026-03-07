import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const res = await fetch(`${backendUrl}/api/newsletter/unsubscribe/${token}`, {
    redirect: 'manual',
  });
  if (res.status === 302) {
    return NextResponse.redirect(
      res.headers.get('Location') ?? `${appUrl}/newsletter/unsubscribed`
    );
  }
  return NextResponse.redirect(
    `${appUrl}/newsletter/unsubscribe/error?reason=invalid`
  );
}
