/**
 * Streaming client for the Organizer Assist `draft/from-brief/stream` endpoints.
 * The backend proxies the AI's SSE: `partial` frames carry the draft taking
 * shape, a final `done` frame carries { draftId, draft }. EventSource can't POST,
 * so this reads the fetch body stream directly. Mirrors the openapi client's
 * absolute backend origin + cookie auth (`credentials: 'include'`).
 */

const backendOrigin = (
  process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz'
)
  .replace(/\/$/, '')
  .replace(/\/api$/i, '');

export interface StreamDraftHandlers {
  /** A growing partial suggestion snapshot for the live reveal. */
  onPartial: (suggestion: Record<string, unknown>) => void;
  /** The created draft. */
  onDone: (data: { draftId: string; draft?: unknown }) => void;
  /** Pre-stream failure (status set, e.g. 429 quota) or mid-stream error. */
  onError: (err: { status?: number; message: string }) => void;
}

function parseFrame(raw: string): { event: string; data: unknown } | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  const payload = dataLines.join('\n');
  try {
    return { event, data: JSON.parse(payload) };
  } catch {
    return { event, data: payload };
  }
}

export async function streamDraft(
  path: string,
  body: unknown,
  signal: AbortSignal,
  handlers: StreamDraftHandlers
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${backendOrigin}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    handlers.onError({ message: 'Could not reach the AI service.' });
    return;
  }

  // Pre-stream failure: the backend returns a normal JSON error (quota, etc.).
  if (!res.ok) {
    let message = 'Could not generate a draft. Please try again.';
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) message = j.message;
    } catch {
      /* keep default */
    }
    handlers.onError({ status: res.status, message });
    return;
  }

  if (!res.body) {
    handlers.onError({ message: 'The AI service returned no stream.' });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const frame = parseFrame(buffer.slice(0, idx));
        buffer = buffer.slice(idx + 2);
        if (!frame) continue;
        if (frame.event === 'partial') {
          const s = (frame.data as { suggestion?: Record<string, unknown> })
            ?.suggestion;
          if (s) handlers.onPartial(s);
        } else if (frame.event === 'done') {
          handlers.onDone(frame.data as { draftId: string; draft?: unknown });
          return;
        } else if (frame.event === 'error') {
          handlers.onError({
            message:
              (frame.data as { message?: string })?.message ??
              'Draft generation failed.',
          });
          return;
        }
      }
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    handlers.onError({ message: 'The draft stream was interrupted.' });
  }
}
