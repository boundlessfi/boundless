import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
    backendUrl = backendUrl.replace(/\/$/, '').replace(/\/api$/i, '');

    const response = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('user-agent') && {
          'User-Agent': request.headers.get('user-agent')!,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error', status: 500 },
      { status: 500 }
    );
  }
}
