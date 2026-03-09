import { NextRequest, NextResponse } from 'next/server';

function normalizeBackendUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/\/$/, '').replace(/\/api$/i, '');
}

const backendUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_API_URL);

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!backendUrl) {
    return NextResponse.json(
      { message: 'Server configuration error: NEXT_PUBLIC_API_URL is not set' },
      { status: 500 }
    );
  }

  const res = await fetch(`${backendUrl}/api/newsletter/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json().catch(() => ({})), {
    status: res.status,
  });
}
