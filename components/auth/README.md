# Authentication Patterns

This directory contains reusable authentication patterns for Better Auth integration with Next.js. These patterns provide different ways to handle authentication throughout your application.

## Available Patterns

### 1. Enhanced Hook (`useRequireAuthEnhanced`)

A simplified hook that automatically redirects unauthenticated users.

```typescript
import { useRequireAuthEnhanced } from '@/hooks/use-auth'

function MyComponent() {
  const { session, isPending, isAuthenticated } = useRequireAuthEnhanced('/login')

  if (isPending) return <div>Loading...</div>
  if (!isAuthenticated) return null // Will redirect automatically

  return <div>Welcome {session.user.name}!</div>
}
```

### 2. Higher-Order Component (`withAuth`)

Wraps components to require authentication.

```typescript
import { withAuth } from '@/components/auth'

function Dashboard({ session }) {
  return <h1>Welcome {session.user.name}</h1>
}

const ProtectedDashboard = withAuth(Dashboard, '/login')
```

### 3. Auth Guard Component (`AuthGuard`)

A component wrapper that protects its children.

```typescript
import { AuthGuard } from '@/components/auth'

function App() {
  return (
    <AuthGuard fallback={<Spinner />} redirectTo="/login">
      <ProtectedContent />
    </AuthGuard>
  )
}
```

### 4. Auth Context Provider (`AuthProvider`)

Provides authentication state throughout the component tree.

```typescript
import { AuthProvider, useAuthContext } from '@/components/auth'

function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  )
}

function Profile() {
  const { data: session, isPending } = useAuthContext()
  // Use session data...
}
```

### 5. Client Utilities (`requireAuthClient`)

Programmatic authentication checks for actions.

```typescript
import {
  requireAuthClient,
  handleProtectedAction,
} from '@/lib/auth/client-utils';

async function deleteAccount() {
  const session = await requireAuthClient();
  if (!session) return;

  // Proceed with deletion...
}
```

## Integration with Existing Auth

These patterns work alongside your existing `ProtectedRoute` component:

- **Use `ProtectedRoute`** for complex requirements (roles, verification, etc.)
- **Use these patterns** for simple authentication requirements
- **Combine patterns** as needed for your specific use cases

## Quick Start

```typescript
// In your layout or _app.tsx
import { AuthProvider } from '@/components/auth'

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// In components
import { AuthGuard, withAuth } from '@/components/auth'
import { useRequireAuthEnhanced } from '@/hooks/use-auth'
```

## Best Practices

1. **Choose the right pattern** for your use case:
   - Simple auth checks → `useRequireAuthEnhanced`
   - Component wrapping → `withAuth` or `AuthGuard`
   - Global state access → `AuthProvider`
   - Programmatic checks → `requireAuthClient`

2. **Use consistent redirect URLs** across your app

3. **Combine with existing patterns** when needed

4. **Test authentication flows** in development

## Migration from Existing Code

Your existing authentication patterns remain unchanged. These new patterns provide additional options:

- `useAuth()` → Still available for complex auth logic
- `ProtectedRoute` → Still available for advanced requirements
- `useRequireAuthEnhanced` → Simpler alternative for basic auth

## Examples

See `examples.tsx` for comprehensive usage examples showing all patterns working together.
