'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/error-reporting';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, {
      digest: error.digest,
      message: error.message,
      source: 'global-error',
    });
  }, [error]);

  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#0a0a0a',
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
            We've recorded this error. Please try again or contact support if it
            continues.
          </p>
          <button
            type='button'
            onClick={reset}
            style={{
              padding: '10px 20px',
              background: '#a7f950',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: 24, fontSize: 12, color: '#666' }}>
            <a href='/' style={{ color: '#a7f950' }}>
              Go to home
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
