import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Use Next.js API proxy to avoid CORS issues
// The proxy route is at /api/proxy/[...path]
const getApiBaseUrl = () => {
  // In browser, ALWAYS use the proxy route (same origin, no CORS)
  // if (typeof window !== 'undefined') {
  //   // Client-side: use relative proxy path (axios handles this correctly)
  //   return '/api/proxy';
  // }
  // Server-side: use direct backend URL
  // Normalize: remove trailing slash and /api if present, then add /api
  // The env var should be base URL without /api (e.g., https://api.boundlessfi.xyz)
  let backendUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.boundlessfi.xyz';
  backendUrl = backendUrl.replace(/\/$/, '').replace(/\/api$/i, '');
  return `${backendUrl}/api`;
};

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiErrorField {
  field?: string;
  message: string;
  /** Populated by the backend Prisma filter outside production. */
  debug?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: ApiErrorField[];
}

/**
 * Extract a user-facing error message from any error thrown by the api client
 * or by callers' own try/catch logic.
 *
 * The response interceptor flattens backend errors into `ApiError` with the
 * backend message on `.message` directly. Plain `Error` instances and raw
 * axios errors are also handled as fallbacks.
 */
const normalizeMessage = (raw: unknown): string | null => {
  if (Array.isArray(raw)) {
    const joined = raw
      .filter(s => typeof s === 'string' && s.trim())
      .join('. ');
    return joined || null;
  }
  if (typeof raw === 'string' && raw.trim()) return raw;
  return null;
};

export const extractApiErrorMessage = (
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (!err) return fallback;

  // ApiError or any object with a `message` field (string or string[])
  if (typeof err === 'object' && 'message' in err) {
    const msg = normalizeMessage((err as { message: unknown }).message);
    if (msg) return msg;
  }

  // Raw axios error fallback (in case it ever bypasses the interceptor)
  if (typeof err === 'object' && 'response' in err) {
    const raw = (err as { response?: { data?: { message?: unknown } } })
      .response?.data?.message;
    const msg = normalizeMessage(raw);
    if (msg) return msg;
  }

  if (typeof err === 'string' && err.trim().length > 0) return err;

  return fallback;
};

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Read the visitor's private-hackathon unlock token for a given slug. The
 * AccessGate stores it as a readable `hx_access_<slug>` cookie after the
 * correct password is entered. Browser-only; returns undefined on the server.
 */
const readHackathonAccessToken = (slug: string): string | undefined => {
  if (typeof document === 'undefined' || !slug) return undefined;
  const prefix = `hx_access_${slug}=`;
  const hit = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(prefix));
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : undefined;
};

const createClientApi = (): AxiosInstance => {
  // Get base URL dynamically (not at module load time)
  const baseURL = getApiBaseUrl();

  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // When using proxy (client-side), cookies are automatically included
    // When making direct requests (server-side), we don't need withCredentials
    withCredentials: typeof window !== 'undefined',
  });

  // Request interceptor
  instance.interceptors.request.use(
    config => {
      if (typeof window !== 'undefined') {
        config.withCredentials = true;
      } else {
        // Server-side: credentials handled via headers
        config.withCredentials = false;
      }

      // Reject data: URLs proactively to avoid Node adapter decoding large payloads
      try {
        const base = config.baseURL || getApiBaseUrl();
        const rawUrl = config.url || '';
        // If absolute URL provided, use as-is; else resolve against base
        const fullUrl = /^https?:|^data:|^\/\//.test(rawUrl)
          ? rawUrl
          : `${base?.replace(/\/$/, '')}/${String(rawUrl).replace(/^\//, '')}`;
        if (fullUrl.startsWith('data:')) {
          throw new Error('Blocked request to data: URL');
        }
      } catch (e) {
        return Promise.reject(e);
      }

      // Better Auth handles authentication via cookies automatically
      // No need to manually add Authorization headers

      // Private-hackathon access: forward the visitor's unlock token on every
      // `/hackathons/<slug>/...` read so gated sub-resources (participants,
      // winners, tracks, announcements, teams, ...) load once the password has
      // been entered. The detail page sets the cookie; this threads it to the
      // sub-resource calls without touching each call site. No-op server-side,
      // for public hackathons, or when a token is already present.
      if (typeof window !== 'undefined' && config.url) {
        try {
          const match = config.url.match(/^\/?hackathons\/([^/?#]+)/i);
          const slug = match?.[1] ? decodeURIComponent(match[1]) : undefined;
          const existing = config.params as Record<string, unknown> | undefined;
          const alreadyHasToken =
            (existing && 'accessToken' in existing) ||
            /[?&]accessToken=/.test(config.url);
          if (slug && !alreadyHasToken) {
            const token = readHackathonAccessToken(slug);
            if (token) {
              config.params = { ...(existing ?? {}), accessToken: token };
            }
          }
        } catch {
          // Best-effort; never block a request on cookie parsing.
        }
      }

      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async error => {
      const originalRequest = error.config;

      // Handle 429 errors (Rate Limiting) with exponential backoff
      if (error.response?.status === 429) {
        const retryCount = originalRequest._retryCount || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          originalRequest._retryCount = retryCount + 1;

          // Get Retry-After header if available, otherwise use exponential backoff
          const retryAfter = error.response.headers['retry-after'];
          let delay: number;

          if (retryAfter) {
            // Use Retry-After header value (in seconds)
            delay = parseInt(retryAfter, 10) * 1000;
          } else {
            // Exponential backoff: 1s, 2s, 4s
            delay = Math.pow(2, retryCount) * 1000;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry the request
          return instance(originalRequest);
        }

        // Max retries reached, reject with rate limit error
        return Promise.reject({
          message: 'Too many requests. Please try again later.',
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }

      // Let Better Auth handle session refresh transparently
      // Do not manually clear auth state on 401 errors

      // Handle other errors
      if (error.response) {
        const errorData = error.response.data as
          | {
              message?: string | string[];
              code?: string;
              errors?: ApiErrorField[];
            }
          | undefined;
        const customError: ApiError = {
          message:
            normalizeMessage(errorData?.message) ||
            `HTTP error! status: ${error.response.status}`,
          status: error.response.status,
          code: errorData?.code,
          errors: Array.isArray(errorData?.errors)
            ? errorData.errors
            : undefined,
        };
        return Promise.reject(customError);
      } else if (error.request) {
        return Promise.reject(new Error('Network error: No response received'));
      } else {
        return Promise.reject(new Error(`Request error: ${error.message}`));
      }
    }
  );

  return instance;
};

const axiosInstance = createClientApi();

const convertAxiosResponse = <T>(
  response: AxiosResponse<T>
): ApiResponse<T> => ({
  data: response.data,
  status: response.status,
  statusText: response.statusText,
});

const convertRequestConfig = (config?: RequestConfig): AxiosRequestConfig => {
  // Merge custom headers with default headers
  const mergedHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...config?.headers, // Custom headers override defaults
  };

  const axiosConfig: AxiosRequestConfig = {
    headers: mergedHeaders,
    timeout: config?.timeout,
    signal: config?.signal,
    // Credentials are handled by Next.js proxy automatically
    withCredentials: false,
  };
  return axiosConfig;
};

const clientApi = {
  get: async <T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    const axiosConfig = convertRequestConfig(config);
    const response = await axiosInstance.get<T>(
      url,
      axiosConfig as AxiosRequestConfig
    );
    return convertAxiosResponse(response);
  },

  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<T>(
      url,
      data,
      convertRequestConfig(config)
    );
    return convertAxiosResponse(response);
  },

  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<T>(
      url,
      data,
      convertRequestConfig(config)
    );
    return convertAxiosResponse(response);
  },

  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<T>(
      url,
      data,
      convertRequestConfig(config)
    );
    return convertAxiosResponse(response);
  },

  delete: async <T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<T>(
      url,
      convertRequestConfig(config)
    );
    return convertAxiosResponse(response);
  },
};

export const api = {
  get: <T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => clientApi.get<T>(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => clientApi.post<T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => clientApi.put<T>(url, data, config),

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => clientApi.patch<T>(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> => clientApi.delete<T>(url, config),
};

export default axiosInstance;
