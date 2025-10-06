# Quick Start Guide

Get up and running with the Adamus IAM Client in 5 minutes.

## Installation

```bash
npm install @adamus/iam-client
```

## Setup

### Option 1: Node.js Backend

```typescript
import { IAMClient } from '@adamus/iam-client';

// Initialize
const client = new IAMClient({
  baseUrl: 'http://your-iam-service.com/api/v1',
});

// Login
const response = await client.login({
  email: 'user@example.com',
  password: 'password',
});

console.log('Logged in:', response.user);
```

### Option 2: React Application

#### Step 1: Setup Provider

```tsx
// index.tsx
import { IAMProvider } from '@adamus/iam-client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <IAMProvider config={{ baseUrl: 'http://your-iam-service.com/api/v1' }}>
    <App />
  </IAMProvider>
);
```

#### Step 2: Use in Components

```tsx
// Login.tsx
import { useIAM } from '@adamus/iam-client';

function Login() {
  const { login } = useIAM();
  
  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password' });
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

```tsx
// Dashboard.tsx
import { useIAM } from '@adamus/iam-client';

function Dashboard() {
  const { user, logout } = useIAM();
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Common Tasks

### Check Permissions

```typescript
// Node.js
const canCreate = await client.hasPermission('forms.create');

// React
import { usePermission } from '@adamus/iam-client';
const canCreate = usePermission('forms.create');
```

### Check Roles

```typescript
// Node.js
const isAdmin = await client.hasRole('admin');

// React
import { useRole } from '@adamus/iam-client';
const isAdmin = useRole('admin');
```

### Protect Routes (React)

```tsx
import { ProtectedRoute } from '@adamus/iam-client';

<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### Fetch Users

```typescript
// Node.js
const users = await client.getUsers({ page: 1, per_page: 15 });

// React
import { useUsers } from '@adamus/iam-client';
const { users, loading } = useUsers({ page: 1, per_page: 15 });
```

## Express.js Middleware

```typescript
import express from 'express';
import { IAMClient } from '@adamus/iam-client';

const app = express();
const client = new IAMClient({ baseUrl: 'http://your-iam-service.com/api/v1' });

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    const userData = await client.verifyToken(token);
    req.user = userData.user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Protected route
app.get('/api/profile', authenticate, (req, res) => {
  res.json(req.user);
});
```

## Next Steps

- Read the [full README](README.md) for complete API documentation
- Check out [examples](examples/) for more use cases
- Review [COMPARISON.md](COMPARISON.md) to see differences from Laravel package

## Need Help?

- Check [INSTALL.md](INSTALL.md) for detailed installation instructions
- Review [examples/](examples/) for complete working examples
- Contact Adamus support team
