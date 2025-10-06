# Adamus IAM Client (Node.js/TypeScript)

A complete Node.js/TypeScript client for the Adamus Identity and Access Management (IAM) service. This package provides seamless integration with centralized authentication and authorization for both Node.js backend and React.js frontend applications.

## Features

- 🔐 **Centralized Authentication** - Authenticate users against a central IAM service
- 🎫 **JWT Token Management** - Secure token-based authentication with automatic token handling
- 🔑 **Permission & Role Management** - Check user permissions and roles via IAM API
- 👥 **User/Department/Position Management** - Fetch and manage organizational data from IAM
- ⚛️ **React Integration** - Pre-built React hooks, context, and components
- 🛡️ **Protected Routes** - Easy route protection with permission/role checks
- 💾 **Token Storage** - Automatic token persistence in localStorage
- ⚡ **TypeScript Support** - Full TypeScript support with type definitions
- 🎯 **Framework Agnostic** - Core client works with any Node.js/JavaScript framework

## Installation

```bash
npm install adamus-iam-client
# or
yarn add adamus-iam-client
```

## Requirements

- Node.js 16.0 or higher
- React 18.0 or higher (for React features)
- TypeScript 5.0 or higher (optional)

## Quick Start

### Node.js/Backend Usage

```typescript
import { IAMClient } from "adamus-iam-client";

// Initialize the client
const iamClient = new IAMClient({
  baseUrl: "http://your-iam-service.com/api/v1",
  timeout: 10000,
  verifySSL: true,
});

// Login
const loginResponse = await iamClient.login({
  email: "user@example.com",
  password: "password123",
});

console.log("Access Token:", loginResponse.access_token);
console.log("User:", loginResponse.user);

// The token is automatically set in the client
// All subsequent requests will include the token

// Get current user
const currentUser = await iamClient.getCurrentUser();

// Check permissions
const canCreateForms = await iamClient.hasPermission("forms.create");

// Check roles
const isAdmin = await iamClient.hasRole("admin");

// Logout
await iamClient.logout();
```

### React.js Usage

#### 1. Setup the IAM Provider

Wrap your app with the `IAMProvider`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { IAMProvider } from "adamus-iam-client";
import App from "./App";

const iamConfig = {
  baseUrl: process.env.REACT_APP_IAM_BASE_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  verifySSL: true,
  onTokenRefresh: (token) => {
    console.log("Token refreshed:", token);
  },
  onAuthError: (error) => {
    console.error("Auth error:", error);
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IAMProvider config={iamConfig}>
      <App />
    </IAMProvider>
  </React.StrictMode>
);
```

#### 2. Use the IAM Hook

```tsx
import { useIAM } from "adamus-iam-client";

function LoginPage() {
  const { login, isLoading } = useIAM();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Redirect to dashboard or home
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

#### 3. Access User Information

```tsx
import { useIAM } from "adamus-iam-client";

function Dashboard() {
  const { user, isAuthenticated, logout } = useIAM();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 4. Protected Routes

```tsx
import { ProtectedRoute } from "adamus-iam-client";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protect routes that require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protect routes with specific permissions */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermission="admin.access">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Protect routes with specific roles */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

#### 5. Use Permission and Role Hooks

```tsx
import { usePermission, useRole } from "adamus-iam-client";

function FormActions() {
  const canCreate = usePermission("forms.create");
  const canDelete = usePermission("forms.delete");
  const isAdmin = useRole("admin");

  return (
    <div>
      {canCreate && <button>Create Form</button>}
      {canDelete && <button>Delete Form</button>}
      {isAdmin && <button>Admin Settings</button>}
    </div>
  );
}
```

#### 6. Fetch Users, Departments, and Positions

```tsx
import { useUsers, useDepartments, usePositions } from "adamus-iam-client";

function UsersPage() {
  const { users, loading, error } = useUsers({ page: 1, per_page: 15 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.data.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DepartmentsPage() {
  const { departments, loading, error } = useDepartments();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Departments</h1>
      <ul>
        {departments?.data.map((dept) => (
          <li key={dept.id}>{dept.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### IAMClient

The core client class for interacting with the IAM service.

#### Constructor

```typescript
new IAMClient(config: IAMConfig)
```

**Config Options:**

- `baseUrl` (string, required): Base URL of the IAM service
- `timeout` (number, optional): Request timeout in milliseconds (default: 10000)
- `verifySSL` (boolean, optional): Verify SSL certificates (default: true)
- `onTokenRefresh` (function, optional): Callback when token is refreshed
- `onAuthError` (function, optional): Callback when authentication error occurs

#### Authentication Methods

##### `login(credentials: LoginCredentials): Promise<LoginResponse>`

Login with email and password.

##### `verifyToken(token?: string): Promise<TokenVerificationResponse>`

Verify token and get user data.

##### `getCurrentUser(): Promise<TokenVerificationResponse>`

Get current authenticated user.

##### `hasPermission(permission: string, token?: string): Promise<boolean>`

Check if user has specific permission.

##### `hasRole(role: string, token?: string): Promise<boolean>`

Check if user has specific role.

##### `refreshToken(token?: string): Promise<RefreshTokenResponse>`

Refresh access token.

##### `logout(token?: string): Promise<void>`

Logout from current session.

##### `logoutAll(token?: string): Promise<void>`

Logout from all sessions.

#### User Management Methods

##### `getUsers(params?: QueryParams): Promise<PaginatedResponse<User>>`

Get all users with optional pagination and filters.

##### `getUser(userId: string | number): Promise<User>`

Get a specific user by ID.

##### `createUser(userData: Partial<User> & { password: string }): Promise<User>`

Create a new user.

##### `updateUser(userId: string | number, userData: Partial<User>): Promise<User>`

Update an existing user.

##### `deleteUser(userId: string | number): Promise<void>`

Delete a user.

#### Department Management Methods

##### `getDepartments(params?: QueryParams): Promise<PaginatedResponse<Department>>`

Get all departments.

##### `getDepartment(departmentId: string | number): Promise<Department>`

Get a specific department.

##### `createDepartment(departmentData: Partial<Department>): Promise<Department>`

Create a new department.

##### `updateDepartment(departmentId: string | number, departmentData: Partial<Department>): Promise<Department>`

Update a department.

##### `deleteDepartment(departmentId: string | number): Promise<void>`

Delete a department.

##### `getUsersByDepartment(departmentId: string | number): Promise<User[]>`

Get users in a specific department.

#### Position Management Methods

##### `getPositions(params?: QueryParams): Promise<PaginatedResponse<Position>>`

Get all positions.

##### `getPosition(positionId: string | number): Promise<Position>`

Get a specific position.

##### `getPositionsByDepartment(departmentId: string | number): Promise<Position[]>`

Get positions by department.

##### `createPosition(positionData: Partial<Position>): Promise<Position>`

Create a new position.

##### `updatePosition(positionId: string | number, positionData: Partial<Position>): Promise<Position>`

Update a position.

##### `deletePosition(positionId: string | number): Promise<void>`

Delete a position.

##### `getUsersByPosition(positionId: string | number): Promise<User[]>`

Get users assigned to a specific position.

### React Hooks

#### `useIAM()`

Main hook for accessing IAM context.

**Returns:**

- `client`: IAMClient instance
- `user`: Current user or null
- `token`: Current token or null
- `isAuthenticated`: Boolean indicating if user is authenticated
- `isLoading`: Boolean indicating if authentication is loading
- `login(credentials)`: Function to login
- `logout()`: Function to logout
- `refreshUser()`: Function to refresh user data
- `hasPermission(permission)`: Function to check permission
- `hasRole(role)`: Function to check role

#### `usePermission(permission: string): boolean`

Hook to check if user has a specific permission.

#### `useRole(role: string): boolean`

Hook to check if user has a specific role.

#### `useUsers(params?: QueryParams)`

Hook to fetch users with pagination.

#### `useUser(userId: string | number | null)`

Hook to fetch a single user.

#### `useDepartments(params?: QueryParams)`

Hook to fetch departments with pagination.

#### `usePositions(params?: QueryParams)`

Hook to fetch positions with pagination.

## Environment Variables

Create a `.env` file in your project root:

```env
# Required
REACT_APP_IAM_BASE_URL=http://your-iam-service.com/api/v1

# Optional
REACT_APP_IAM_TIMEOUT=10000
REACT_APP_IAM_VERIFY_SSL=true
```

For Node.js backend:

```env
IAM_BASE_URL=http://your-iam-service.com/api/v1
IAM_TIMEOUT=10000
IAM_VERIFY_SSL=true
```

## Examples

### Express.js Middleware

```typescript
import express from "express";
import { IAMClient } from "adamus-iam-client";

const app = express();
const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL!,
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const userData = await iamClient.verifyToken(token);
    req.user = userData.user;
    req.permissions = userData.permissions;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Permission middleware
const requirePermission = (permission: string) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const hasPermission = await iamClient.hasPermission(permission, token);

    if (!hasPermission) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Protected routes
app.get("/api/users", authenticate, async (req, res) => {
  const users = await iamClient.getUsers();
  res.json(users);
});

app.post(
  "/api/users",
  authenticate,
  requirePermission("users.create"),
  async (req, res) => {
    const newUser = await iamClient.createUser(req.body);
    res.json(newUser);
  }
);
```

### Next.js API Route

```typescript
// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IAMClient } from "adamus-iam-client";

const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;
    const loginResponse = await iamClient.login({ email, password });

    res.status(200).json(loginResponse);
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All types are exported for your use:

```typescript
import {
  IAMClient,
  IAMConfig,
  User,
  LoginCredentials,
  LoginResponse,
  Department,
  Position,
  PaginatedResponse,
  // ... and more
} from "adamus-iam-client";
```

## Error Handling

The client throws errors that you should handle appropriately:

```typescript
try {
  await iamClient.login({ email, password });
} catch (error) {
  if (error.message.includes("401")) {
    console.error("Invalid credentials");
  } else if (error.message.includes("Network")) {
    console.error("Network error");
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Security Considerations

- Always use HTTPS in production
- Set `verifySSL: true` in production
- Tokens are stored in localStorage (consider using httpOnly cookies for enhanced security)
- Never expose your IAM service credentials in client-side code
- Implement proper CORS configuration on your IAM service
- Use environment variables for sensitive configuration

## Testing

```bash
npm test
```

## Building

```bash
npm run build
```

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Support

For issues, questions, or contributions, please contact the Adamus development team.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
