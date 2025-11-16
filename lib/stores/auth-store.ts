import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMe } from '@/lib/api/auth';
import Cookies from 'js-cookie';

// Debounce utility for API calls
let refreshTimeout: NodeJS.Timeout | null = null;

// JWT payload interface
interface JWTPayload {
  user_id?: string;
  userId?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

// Session user interface for NextAuth
interface SessionUser {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
  accessToken?: string;
  username?: string;
  [key: string]: unknown;
}

// Simple JWT decode function to extract user ID from token
function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  username?: string | null;
  isVerified?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    username?: string;
  };
}

export interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
  syncWithSession: (sessionUser: SessionUser) => Promise<void>;
}

// Safe localStorage access for SSR
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: user => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });

        // Update cookies only on client side
        if (typeof window !== 'undefined') {
          if (accessToken) {
            Cookies.set('accessToken', accessToken);
          } else {
            Cookies.remove('accessToken');
          }

          if (refreshToken) {
            Cookies.set('refreshToken', refreshToken);
          } else {
            Cookies.remove('refreshToken');
          }
        }
      },

      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error });
      },

      login: async (accessToken, refreshToken) => {
        try {
          set({ isLoading: true, error: null });

          // Store tokens for backward compatibility (though not used for API calls)
          get().setTokens(accessToken, refreshToken);

          // Fetch user data using cookie-based auth (Better Auth)
          const user = await getMe();

          const transformedUser: User = {
            id: (user._id || user.id) as string,
            email: user.email as string,
            name: (user.profile?.firstName || user.name) as string | null,
            image: (user.profile?.avatar || user.image) as string | null,
            username: (user.profile?.username || user.username) as
              | string
              | null,
            role: (user.roles?.[0] === 'ADMIN' ? 'ADMIN' : 'USER') as
              | 'USER'
              | 'ADMIN',
            isVerified: user.isVerified as boolean | undefined,
            profile: user.profile as User['profile'],
          };

          set({
            user: transformedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          get().setTokens(null, null);
          throw error;
        }
      },

      logout: async () => {
        const currentState = get();

        // Prevent multiple logout calls
        if (currentState.isLoading) {
          return;
        }

        try {
          set({ isLoading: true });

          // Better Auth handles logout via its own API
          // We just need to clear local state
          // The actual logout is handled by authClient.signOut() in useAuthActions

          // Clear all auth data
          get().clearAuth();
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshUser: async () => {
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }

        return new Promise<void>((resolve, reject) => {
          refreshTimeout = setTimeout(async () => {
            try {
              set({ isLoading: true, error: null });

              // Fetch user data using cookie-based auth (Better Auth handles session)
              const user = await getMe();

              const transformedUser: User = {
                id: (user._id || user.id) as string,
                email: user.email as string,
                name: (user.profile?.firstName || user.name) as string | null,
                image: (user.profile?.avatar || user.image) as string | null,
                username: (user.profile?.username || user.username) as
                  | string
                  | null,
                role: (user.roles?.[0] === 'ADMIN' ? 'ADMIN' : 'USER') as
                  | 'USER'
                  | 'ADMIN',
                isVerified: user.isVerified as boolean | undefined,
                profile: user.profile as User['profile'],
              };

              set({
                user: transformedUser,
                isAuthenticated: true,
                isLoading: false,
              });
              resolve();
            } catch (error) {
              set({
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to refresh user',
                isLoading: false,
              });

              // If refresh fails, clear auth data
              if (
                error instanceof Error &&
                (error.message.includes('401') ||
                  error.message.includes('expired'))
              ) {
                get().clearAuth();
              }

              reject(error);
            }
          }, 300); // 300ms debounce
        });
      },

      clearAuth: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Clear cookies only on client side
        if (typeof window !== 'undefined') {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          // Better Auth uses its own cookie names, but we'll let it handle cleanup
        }
      },

      updateUser: updates => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      syncWithSession: async sessionUser => {
        if (sessionUser && sessionUser.id && sessionUser.email) {
          try {
            // Always fetch fresh user data from API using cookie-based auth
            // Better Auth handles authentication via cookies automatically
            const user = await getMe();

            const transformedUser: User = {
              id: (user._id || user.id) as string,
              email: user.email as string,
              name: (user.profile?.firstName || user.name) as string | null,
              image: (user.profile?.avatar || user.image) as string | null,
              username: (user.profile?.username || user.username) as
                | string
                | null,
              role: (user.roles?.[0] === 'ADMIN' ? 'ADMIN' : 'USER') as
                | 'USER'
                | 'ADMIN',
              isVerified: user.isVerified as boolean | undefined,
              profile: user.profile as User['profile'],
            };

            set({
              user: transformedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // Fallback to session user data if API call fails
            // This ensures we still have user data even if API is unavailable
            const fallbackUser: User = {
              id: sessionUser.id,
              email: sessionUser.email,
              name: sessionUser.name || null,
              image: sessionUser.image || null,
              username: sessionUser.username || null,
              role: (sessionUser.role as 'USER' | 'ADMIN') || 'USER',
            };

            set({
              user: fallbackUser,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage()),
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        // Rehydrate cookies from localStorage on app start (client side only)
        if (typeof window !== 'undefined' && state?.accessToken) {
          // Check if access token is expired on app startup
          if (isTokenExpired(state.accessToken)) {
            // Clear expired tokens
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            return;
          }

          Cookies.set('accessToken', state.accessToken);
        }
        if (typeof window !== 'undefined' && state?.refreshToken) {
          // Check if refresh token is also expired
          if (isTokenExpired(state.refreshToken)) {
            state.refreshToken = null;
            Cookies.remove('refreshToken');
          } else {
            Cookies.set('refreshToken', state.refreshToken);
          }
        }

        // Initialize auth state from cookies if we have tokens but no user
        if (
          typeof window !== 'undefined' &&
          state?.accessToken &&
          !state?.user &&
          !isTokenExpired(state.accessToken)
        ) {
          // This will trigger a refresh of user data
          const timeoutId = setTimeout(() => {
            const store = useAuthStore.getState();
            if (
              store.accessToken &&
              !store.user &&
              !isTokenExpired(store.accessToken)
            ) {
              store.refreshUser().catch(() => {
                // Silently handle refresh failure
              });
            }
          }, 100);

          // Store timeout ID for potential cleanup
          if (typeof window !== 'undefined') {
            (
              window as unknown as { __authTimeoutId?: NodeJS.Timeout }
            ).__authTimeoutId = timeoutId;
          }
        }
      },
    }
  )
);
