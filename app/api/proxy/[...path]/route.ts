import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = () => {
  let apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';

  apiUrl = apiUrl.replace(/\/$/, '');
  apiUrl = apiUrl.replace(/\/api$/i, '');

  return apiUrl;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const backendUrl = getBackendUrl();
    const path = Array.isArray(params.path)
      ? params.path.join('/')
      : params.path;

    const cleanBackendUrl = backendUrl.replace(/\/api\/?$/i, '');
    const baseUrl = `${cleanBackendUrl}/api`;
    const cleanPath = path.replace(/^\/?api\/?/i, '');
    const url = `${baseUrl}/${cleanPath}`;

    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    const requestContentType = request.headers.get('content-type') || '';
    const isMultipartFormData = requestContentType.includes(
      'multipart/form-data'
    );
    const isApplicationJson = requestContentType.includes('application/json');

    // Handle request body
    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'DELETE' && method !== 'HEAD') {
      try {
        // Clone request to check if body exists
        const clonedRequest = request.clone();
        const hasBody = clonedRequest.body !== null;

        if (hasBody) {
          if (isMultipartFormData) {
            body = await request.formData();
          } else if (isApplicationJson) {
            // Preserve JSON structure
            const text = await request.text();
            body = text.length > 0 ? text : undefined;
          } else {
            // Handle other content types (text/plain, application/xml, etc.)
            body = await request.text();
          }
        }
      } catch {}
    }

    // Forward headers
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip headers that cause issues or are set automatically
      if (
        ![
          'host',
          'connection',
          'content-length',
          'transfer-encoding',
          'accept-encoding',
        ].includes(lowerKey)
      ) {
        headers[key] = value;
      }
    });

    // For FormData, let fetch set Content-Type with boundary
    if (isMultipartFormData) {
      delete headers['content-type'];
      delete headers['Content-Type'];
    }

    // Ensure cookies are forwarded
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    // Make request to backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body || undefined,
        signal: controller.signal,
        // Don't follow redirects automatically - let the client handle them
        redirect: 'manual',
      });

      clearTimeout(timeoutId);

      // Handle binary responses (images, PDFs, etc.)
      const responseContentType = response.headers.get('content-type') || '';
      const isBinaryResponse =
        responseContentType.includes('image/') ||
        responseContentType.includes('application/pdf') ||
        responseContentType.includes('application/octet-stream') ||
        responseContentType.includes('video/') ||
        responseContentType.includes('audio/');

      let responseBody: string | ArrayBuffer;
      if (isBinaryResponse) {
        responseBody = await response.arrayBuffer();
      } else {
        responseBody = await response.text();
      }

      // Build response headers
      const responseHeaders = new Headers();

      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        // Skip problematic headers
        if (
          [
            'access-control-allow-origin',
            'access-control-allow-credentials',
            'access-control-allow-methods',
            'access-control-allow-headers',
            'content-encoding',
            'transfer-encoding',
            'content-length',
          ].includes(lowerKey)
        ) {
          return;
        }

        // Handle Set-Cookie headers properly
        if (lowerKey === 'set-cookie') {
          const setCookieValues = response.headers.getSetCookie();
          setCookieValues.forEach(cookie => {
            responseHeaders.append('Set-Cookie', cookie);
          });
        } else {
          responseHeaders.set(key, value);
        }
      });

      // Ensure Content-Type is set
      responseHeaders.set(
        'Content-Type',
        responseContentType || 'application/json'
      );

      // Set CORS headers
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      responseHeaders.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie'
      );
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');

      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          responseHeaders.set('Location', location);
        }
        return new NextResponse(null, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // Return binary response
      if (isBinaryResponse && responseBody instanceof ArrayBuffer) {
        return new NextResponse(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // Return JSON response
      if (
        responseContentType.includes('application/json') &&
        typeof responseBody === 'string'
      ) {
        let parsedBody: unknown;
        try {
          parsedBody = responseBody.length > 0 ? JSON.parse(responseBody) : {};
        } catch {
          // Return as text if JSON parsing fails
          return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
          });
        }
        return NextResponse.json(parsedBody, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // Return text/other responses
      return new NextResponse(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          {
            message:
              'Request timeout - backend did not respond within 30 seconds',
            error: 'TIMEOUT_ERROR',
          },
          { status: 504 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    // Provide more specific error messages
    let errorMessage = 'Proxy request failed';
    let statusCode = 500;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend server';
      statusCode = 502; // Bad Gateway
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        message: errorMessage,
        error: 'PROXY_ERROR',
      },
      { status: statusCode }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // 204 No Content is more appropriate for OPTIONS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}
