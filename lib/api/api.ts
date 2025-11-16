import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';

const API_BASE_URL = 'https://staging-api.boundlessfi.xyz/api';
// const API_BASE_URL = 'http://localhost:8000/api';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

const createClientApi = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true,
  });

  // Request interceptor
  instance.interceptors.request.use(
    config => {
      // Always include credentials for Better Auth cookie-based authentication
      config.withCredentials = true;

      // Reject data: URLs proactively to avoid Node adapter decoding large payloads
      try {
        const base = config.baseURL || API_BASE_URL;
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

      // Handle 401 errors - Better Auth handles session refresh automatically
      if (error.response?.status === 401) {
        const authStore = useAuthStore.getState();
        authStore.clearAuth();

        // Only redirect if we're on the client side
        if (typeof window !== 'undefined') {
          window.location.href = '/auth?mode=signin';
        }

        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401,
          code: 'SESSION_EXPIRED',
        });
      }

      // Handle other errors
      if (error.response) {
        const errorData = error.response.data;
        const customError: ApiError = {
          message:
            errorData?.message ||
            `HTTP error! status: ${error.response.status}`,
          status: error.response.status,
          code: errorData?.code,
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

  const axiosConfig = {
    headers: mergedHeaders,
    timeout: config?.timeout,
    withCredentials: true, // Always include credentials for Better Auth cookie-based auth
  } as AxiosRequestConfig;
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
