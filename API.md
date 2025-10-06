# API Reference

Complete API reference for the Adamus IAM Client.

## Table of Contents

- [IAMClient](#iamclient)
- [React Hooks](#react-hooks)
- [React Components](#react-components)
- [TypeScript Types](#typescript-types)

---

## IAMClient

The core client class for interacting with the IAM service.

### Constructor

```typescript
new IAMClient(config: IAMConfig)
```

**Parameters:**
- `config.baseUrl` (string, required) - Base URL of the IAM service
- `config.timeout` (number, optional) - Request timeout in milliseconds (default: 10000)
- `config.verifySSL` (boolean, optional) - Verify SSL certificates (default: true)
- `config.onTokenRefresh` (function, optional) - Callback when token is refreshed
- `config.onAuthError` (function, optional) - Callback when authentication error occurs

**Example:**
```typescript
const client = new IAMClient({
  baseUrl: 'http://localhost:8000/api/v1',
  timeout: 10000,
  verifySSL: true,
  onTokenRefresh: (token) => console.log('Token refreshed'),
  onAuthError: (error) => console.error('Auth error:', error),
});
```

### Token Management

#### `setToken(token: string): void`

Set the authentication token.

```typescript
client.setToken('your-jwt-token');
```

#### `getToken(): string | null`

Get the current authentication token.

```typescript
const token = client.getToken();
```

#### `clearToken(): void`

Clear the authentication token.

```typescript
client.clearToken();
```

### Authentication Methods

#### `login(credentials: LoginCredentials): Promise<LoginResponse>`

Login with email and password.

**Parameters:**
- `credentials.email` (string) - User email
- `credentials.password` (string) - User password

**Returns:** Promise resolving to LoginResponse

**Example:**
```typescript
const response = await client.login({
  email: 'user@example.com',
  password: 'password123',
});

console.log(response.access_token);
console.log(response.user);
```

#### `verifyToken(token?: string): Promise<TokenVerificationResponse>`

Verify token and get user data.

**Parameters:**
- `token` (string, optional) - Token to verify (uses stored token if not provided)

**Returns:** Promise resolving to TokenVerificationResponse

**Example:**
```typescript
const userData = await client.verifyToken();
console.log(userData.user);
console.log(userData.permissions);
```

#### `getCurrentUser(): Promise<TokenVerificationResponse>`

Get current authenticated user (alias for verifyToken).

**Example:**
```typescript
const userData = await client.getCurrentUser();
```

#### `hasPermission(permission: string, token?: string): Promise<boolean>`

Check if user has specific permission.

**Parameters:**
- `permission` (string) - Permission name to check
- `token` (string, optional) - Token to use (uses stored token if not provided)

**Returns:** Promise resolving to boolean

**Example:**
```typescript
const canCreate = await client.hasPermission('forms.create');
if (canCreate) {
  console.log('User can create forms');
}
```

#### `hasRole(role: string, token?: string): Promise<boolean>`

Check if user has specific role.

**Parameters:**
- `role` (string) - Role name to check
- `token` (string, optional) - Token to use (uses stored token if not provided)

**Returns:** Promise resolving to boolean

**Example:**
```typescript
const isAdmin = await client.hasRole('admin');
if (isAdmin) {
  console.log('User is an admin');
}
```

#### `refreshToken(token?: string): Promise<RefreshTokenResponse>`

Refresh access token.

**Parameters:**
- `token` (string, optional) - Token to refresh (uses stored token if not provided)

**Returns:** Promise resolving to RefreshTokenResponse

**Example:**
```typescript
const response = await client.refreshToken();
console.log('New token:', response.access_token);
```

#### `logout(token?: string): Promise<void>`

Logout from current session.

**Parameters:**
- `token` (string, optional) - Token to logout (uses stored token if not provided)

**Example:**
```typescript
await client.logout();
```

#### `logoutAll(token?: string): Promise<void>`

Logout from all sessions.

**Parameters:**
- `token` (string, optional) - Token to use (uses stored token if not provided)

**Example:**
```typescript
await client.logoutAll();
```

### User Management Methods

#### `getUsers(params?: QueryParams): Promise<PaginatedResponse<User>>`

Get all users with optional pagination and filters.

**Parameters:**
- `params.page` (number, optional) - Page number
- `params.per_page` (number, optional) - Items per page
- `params.search` (string, optional) - Search query

**Returns:** Promise resolving to PaginatedResponse<User>

**Example:**
```typescript
const users = await client.getUsers({
  page: 1,
  per_page: 15,
  search: 'john',
});

console.log(users.data); // Array of users
console.log(users.total); // Total count
```

#### `getUser(userId: string | number): Promise<User>`

Get a specific user by ID.

**Example:**
```typescript
const user = await client.getUser(123);
console.log(user.name, user.email);
```

#### `createUser(userData: Partial<User> & { password: string }): Promise<User>`

Create a new user.

**Example:**
```typescript
const newUser = await client.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  status: 'active',
});
```

#### `updateUser(userId: string | number, userData: Partial<User>): Promise<User>`

Update an existing user.

**Example:**
```typescript
const updatedUser = await client.updateUser(123, {
  name: 'Jane Doe',
  status: 'inactive',
});
```

#### `deleteUser(userId: string | number): Promise<void>`

Delete a user.

**Example:**
```typescript
await client.deleteUser(123);
```

### Department Management Methods

#### `getDepartments(params?: QueryParams): Promise<PaginatedResponse<Department>>`

Get all departments.

**Example:**
```typescript
const departments = await client.getDepartments({ page: 1, per_page: 20 });
```

#### `getDepartment(departmentId: string | number): Promise<Department>`

Get a specific department.

**Example:**
```typescript
const dept = await client.getDepartment(1);
```

#### `createDepartment(departmentData: Partial<Department>): Promise<Department>`

Create a new department.

**Example:**
```typescript
const dept = await client.createDepartment({
  name: 'Engineering',
  description: 'Engineering Department',
});
```

#### `updateDepartment(departmentId: string | number, departmentData: Partial<Department>): Promise<Department>`

Update a department.

**Example:**
```typescript
const dept = await client.updateDepartment(1, {
  name: 'Software Engineering',
});
```

#### `deleteDepartment(departmentId: string | number): Promise<void>`

Delete a department.

**Example:**
```typescript
await client.deleteDepartment(1);
```

#### `getUsersByDepartment(departmentId: string | number): Promise<User[]>`

Get users in a specific department.

**Example:**
```typescript
const users = await client.getUsersByDepartment(1);
```

### Position Management Methods

#### `getPositions(params?: QueryParams): Promise<PaginatedResponse<Position>>`

Get all positions.

**Example:**
```typescript
const positions = await client.getPositions({ page: 1 });
```

#### `getPosition(positionId: string | number): Promise<Position>`

Get a specific position.

**Example:**
```typescript
const position = await client.getPosition(1);
```

#### `getPositionsByDepartment(departmentId: string | number): Promise<Position[]>`

Get positions by department.

**Example:**
```typescript
const positions = await client.getPositionsByDepartment(1);
```

#### `createPosition(positionData: Partial<Position>): Promise<Position>`

Create a new position.

**Example:**
```typescript
const position = await client.createPosition({
  department_id: 1,
  title: 'Senior Developer',
  level: 'senior',
});
```

#### `updatePosition(positionId: string | number, positionData: Partial<Position>): Promise<Position>`

Update a position.

**Example:**
```typescript
const position = await client.updatePosition(1, {
  title: 'Lead Developer',
});
```

#### `deletePosition(positionId: string | number): Promise<void>`

Delete a position.

**Example:**
```typescript
await client.deletePosition(1);
```

#### `getUsersByPosition(positionId: string | number): Promise<User[]>`

Get users assigned to a specific position.

**Example:**
```typescript
const users = await client.getUsersByPosition(1);
```

---

## React Hooks

### `useIAM()`

Main hook for accessing IAM context.

**Returns:**
```typescript
{
  client: IAMClient;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  hasRole: (role: string) => Promise<boolean>;
}
```

**Example:**
```tsx
import { useIAM } from '@adamus/iam-client';

function Component() {
  const { user, isAuthenticated, login, logout } = useIAM();
  
  if (!isAuthenticated) {
    return <button onClick={() => login({ email, password })}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### `usePermission(permission: string)`

Hook to check if user has a specific permission.

**Parameters:**
- `permission` (string) - Permission name to check

**Returns:** boolean

**Example:**
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

### `useRole(role: string)`

Hook to check if user has a specific role.

**Parameters:**
- `role` (string) - Role name to check

**Returns:** boolean

**Example:**
```tsx
import { useRole } from '@adamus/iam-client';

function Component() {
  const isAdmin = useRole('admin');
  
  return (
    <div>
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

### `useUsers(params?: QueryParams)`

Hook to fetch users with pagination.

**Returns:**
```typescript
{
  users: PaginatedResponse<User> | null;
  loading: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
import { useUsers } from '@adamus/iam-client';

function UsersPage() {
  const { users, loading, error } = useUsers({ page: 1, per_page: 15 });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {users?.data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### `useUser(userId: string | number | null)`

Hook to fetch a single user.

**Returns:**
```typescript
{
  user: User | null;
  loading: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
import { useUser } from '@adamus/iam-client';

function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{user?.name}</div>;
}
```

### `useDepartments(params?: QueryParams)`

Hook to fetch departments with pagination.

**Returns:**
```typescript
{
  departments: PaginatedResponse<Department> | null;
  loading: boolean;
  error: Error | null;
}
```

### `usePositions(params?: QueryParams)`

Hook to fetch positions with pagination.

**Returns:**
```typescript
{
  positions: PaginatedResponse<Position> | null;
  loading: boolean;
  error: Error | null;
}
```

---

## React Components

### `IAMProvider`

Context provider for IAM functionality.

**Props:**
```typescript
{
  config: IAMConfig;
  children: ReactNode;
  tokenStorageKey?: string;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}
```

**Example:**
```tsx
import { IAMProvider } from '@adamus/iam-client';

<IAMProvider 
  config={{ baseUrl: 'http://localhost:8000/api/v1' }}
  tokenStorageKey="iam_token"
  onAuthStateChange={(isAuth) => console.log('Auth changed:', isAuth)}
>
  <App />
</IAMProvider>
```

### `ProtectedRoute`

Component for protecting routes with authentication and authorization.

**Props:**
```typescript
{
  children: ReactNode;
  fallback?: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  redirectTo?: string;
}
```

**Example:**
```tsx
import { ProtectedRoute } from '@adamus/iam-client';

// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require specific permission
<ProtectedRoute requiredPermission="admin.access">
  <AdminPanel />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="manager">
  <ManagerDashboard />
</ProtectedRoute>

// Custom fallback
<ProtectedRoute fallback={<Spinner />}>
  <Dashboard />
</ProtectedRoute>
```

---

## TypeScript Types

### `IAMConfig`

```typescript
interface IAMConfig {
  baseUrl: string;
  timeout?: number;
  verifySSL?: boolean;
  onTokenRefresh?: (token: string) => void;
  onAuthError?: (error: Error) => void;
}
```

### `User`

```typescript
interface User {
  id: string | number;
  name: string;
  email: string;
  status?: string;
  roles?: Role[];
  departments?: Department[];
  positions?: Position[];
}
```

### `Department`

```typescript
interface Department {
  id: string | number;
  name: string;
  description?: string;
  parent_department_id?: string | number | null;
  manager_id?: string | number | null;
}
```

### `Position`

```typescript
interface Position {
  id: string | number;
  department_id: string | number;
  title: string;
  description?: string;
  level?: string;
  salary_min?: number;
  salary_max?: number;
  reports_to_position_id?: string | number | null;
}
```

### `PaginatedResponse<T>`

```typescript
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
```

### `LoginResponse`

```typescript
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  permissions?: string[];
}
```

---

For more examples and use cases, see the [examples](examples/) directory.
