import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
const API_URL = API_BASE.replace(/\/$/, '').replace(/\/api$/i, '') + '/api';

interface OrganizationProfile {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  stats: {
    projectsCount: number;
    totalHackathons: number;
    totalBounties: number;
    totalGrants: number;
  };
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen - 3).trim() + '...';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#a1a1aa',
          fontSize: 24,
        }}
      >
        <span>Organization | Boundless</span>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  let name = 'Organization';
  let description = 'View on Boundless';
  let logoUrl: string | null = null;

  try {
    const res = await fetch(
      `${API_URL}/organizations/profile/${encodeURIComponent(slug)}`
    );
    if (res.ok) {
      const json = await res.json();
      const data = json?.data as OrganizationProfile | undefined;
      if (data) {
        name = data.name || name;
        description = truncate(data.description || description, 140);
        logoUrl = data.logoUrl || null;
      }
    }
  } catch {
    // use defaults
  }

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#09090b',
        padding: 60,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #a7f950 0%, #a7f95080 100%)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 40,
          flex: 1,
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=''
            width={160}
            height={160}
            style={{
              borderRadius: 20,
              objectFit: 'cover',
              border: '2px solid #27272a',
            }}
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 20,
              background: '#27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a',
              fontSize: 48,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 56,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {name}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 28,
              color: '#a1a1aa',
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 22,
                color: '#a7f950',
                fontWeight: 600,
              }}
            >
              Boundless
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
