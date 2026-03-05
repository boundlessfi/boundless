import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export async function GET() {
  if (isProduction) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  // Normalize API URL: remove trailing slash and /api if present
  // The env var should be base URL without /api (e.g., https://api.boundlessfi.xyz)
  let apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
  apiUrl = apiUrl.replace(/\/$/, '').replace(/\/api$/i, '');
  const fullApiUrl = `${apiUrl}/api`;

  try {
    const response = await fetch(`${fullApiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      success: true,
      apiUrl: fullApiUrl,
      backendStatus: response.status,
      backendOk: response.ok,
      message: 'Backend connectivity test completed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        apiUrl: fullApiUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Backend connectivity test failed',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (isProduction) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    // Normalize API URL: remove trailing slash and /api if present
    // The env var should be base URL without /api (e.g., https://api.boundlessfi.xyz)
    let apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
    apiUrl = apiUrl.replace(/\/$/, '').replace(/\/api$/i, '');
    const fullApiUrl = `${apiUrl}/api`;

    const response = await fetch(`${fullApiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data,
      apiUrl: fullApiUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
