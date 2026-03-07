import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${backendUrl}/api/newsletter/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json().catch(() => ({})), {
    status: res.status,
  });
}
