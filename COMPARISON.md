# Laravel vs Node.js IAM Client Comparison

This document compares the Laravel IAM Client package with the Node.js/TypeScript IAM Client package to help you understand the similarities and differences.

## Overview

Both packages provide the same core functionality for integrating with the Adamus IAM service, but they are tailored to their respective ecosystems.

## Feature Comparison

| Feature | Laravel Package | Node.js Package |
|---------|----------------|-----------------|
| **Authentication** | ✅ Via IAMService | ✅ Via IAMClient |
| **JWT Token Management** | ✅ Session-based | ✅ localStorage/Manual |
| **Permission Checking** | ✅ hasPermission() | ✅ hasPermission() |
| **Role Checking** | ✅ hasRole() | ✅ hasRole() |
| **User Management** | ✅ Full CRUD | ✅ Full CRUD |
| **Department Management** | ✅ Full CRUD | ✅ Full CRUD |
| **Position Management** | ✅ Full CRUD | ✅ Full CRUD |
| **Middleware/Guards** | ✅ Laravel Middleware | ✅ Express Middleware (manual) |
| **React Integration** | ✅ Inertia.js | ✅ React Hooks & Context |
| **TypeScript Support** | ❌ PHP | ✅ Full TypeScript |
| **Frontend Components** | ✅ React (via Inertia) | ✅ React Hooks & Components |

## Code Comparison

### 1. Initialization

#### Laravel
```php
// Automatic via Service Provider
// Configuration in config/iam.php
use Adamus\LaravelIamClient\Services\IAMService;

public function __construct(private IAMService $iamService) {}
```

#### Node.js
```typescript
import { IAMClient } from '@adamus/iam-client';

const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL!,
  timeout: 10000,
  verifySSL: true,
});
```

### 2. Login

#### Laravel
```php
$response = $this->iamService->login($email, $password);
session(['iam_token' => $response['access_token']]);
Auth::guard('iam')->login($user);
```

#### Node.js
```typescript
const response = await iamClient.login({ email, password });
// Token is automatically set in the client
console.log(response.access_token);
```

### 3. Get Current User

#### Laravel
```php
$user = Auth::guard('iam')->user();
```

#### Node.js
```typescript
const userData = await iamClient.getCurrentUser();
const user = userData.user;
```

### 4. Check Permissions

#### Laravel
```php
if (Auth::guard('iam')->hasPermission('forms.create')) {
    // User has permission
}

// Or via service
$hasPermission = $this->iamService->hasPermission($token, 'forms.create');
```

#### Node.js
```typescript
const hasPermission = await iamClient.hasPermission('forms.create');
```

### 5. Check Roles

#### Laravel
```php
if (Auth::guard('iam')->hasRole('admin')) {
    // User has role
}
```

#### Node.js
```typescript
const isAdmin = await iamClient.hasRole('admin');
```

### 6. Protect Routes

#### Laravel
```php
Route::middleware('iam.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

#### Node.js (Express)
```typescript
app.get('/dashboard', authenticate, (req, res) => {
    res.json({ message: 'Dashboard' });
});
```

### 7. User Management

#### Laravel
```php
// Get users
$users = $this->iamService->getUsers($token, [
    'page' => 1,
    'per_page' => 15,
]);

// Create user
$user = $this->iamService->createUser($token, [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => 'password',
]);
```

#### Node.js
```typescript
// Get users
const users = await iamClient.getUsers({
    page: 1,
    per_page: 15,
});

// Create user
const user = await iamClient.createUser({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
});
```

## React Integration Comparison

### Laravel (Inertia.js)

#### Login Component
```tsx
import { useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('iam.login'));
    };

    return <form onSubmit={submit}>...</form>;
}
```

#### Access User
```tsx
import { usePage } from '@inertiajs/react';

function Component() {
    const { auth } = usePage().props;
    return <div>{auth.user.name}</div>;
}
```

### Node.js (React Hooks)

#### Login Component
```tsx
import { useIAM } from '@adamus/iam-client';

function Login() {
    const { login, isLoading } = useIAM();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password });
    };

    return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Access User
```tsx
import { useIAM } from '@adamus/iam-client';

function Component() {
    const { user } = useIAM();
    return <div>{user?.name}</div>;
}
```

#### Protected Routes
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

#### Permission Hooks
```tsx
import { usePermission } from '@adamus/iam-client';

function Component() {
    const canCreate = usePermission('forms.create');
    
    return (
        <div>
            {canCreate && <button>Create Form</button>}
        </div>
    );
}
```

## When to Use Which Package

### Use Laravel Package When:
- Building a Laravel application
- Need tight integration with Laravel's authentication system
- Using Inertia.js for frontend
- Want automatic session management
- Need Laravel-specific features (middleware, guards, etc.)

### Use Node.js Package When:
- Building a Node.js backend (Express, Fastify, etc.)
- Building a React SPA (Create React App, Vite, etc.)
- Building a Next.js application
- Need TypeScript support
- Want framework-agnostic client
- Building microservices in Node.js

## Migration Guide

### From Laravel to Node.js

If you're migrating from Laravel to Node.js:

1. **Replace IAMService with IAMClient**
   ```typescript
   // Before (Laravel)
   $this->iamService->login($email, $password);
   
   // After (Node.js)
   await iamClient.login({ email, password });
   ```

2. **Update Token Storage**
   ```typescript
   // Laravel stores in session automatically
   // Node.js requires manual storage
   const response = await iamClient.login({ email, password });
   localStorage.setItem('iam_token', response.access_token);
   ```

3. **Update Middleware**
   ```typescript
   // Create Express middleware similar to Laravel's
   const authenticate = async (req, res, next) => {
       const token = req.headers.authorization?.replace('Bearer ', '');
       const userData = await iamClient.verifyToken(token);
       req.user = userData.user;
       next();
   };
   ```

4. **Update React Components**
   ```tsx
   // Replace Inertia with IAM hooks
   import { useIAM } from '@adamus/iam-client';
   
   function Component() {
       const { user, isAuthenticated } = useIAM();
       // Use user data
   }
   ```

## API Compatibility

Both packages communicate with the same IAM API endpoints, so they are fully compatible:

- `/auth/login` - Login
- `/auth/me` - Get current user
- `/auth/check-permission` - Check permission
- `/auth/check-role` - Check role
- `/auth/refresh` - Refresh token
- `/auth/logout` - Logout
- `/users` - User management
- `/departments` - Department management
- `/positions` - Position management

## Conclusion

Both packages provide the same core functionality but are optimized for their respective ecosystems. Choose the package that best fits your technology stack and development workflow.
