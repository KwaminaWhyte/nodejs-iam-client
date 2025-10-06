/**
 * React Example
 * 
 * This example shows how to use the IAM client in a React application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  IAMProvider,
  useIAM,
  usePermission,
  useUsers,
  ProtectedRoute,
} from '@adamus/iam-client';

// ==================== App Setup ====================

const iamConfig = {
  baseUrl: process.env.REACT_APP_IAM_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  verifySSL: true,
  onTokenRefresh: (token: string) => {
    console.log('Token refreshed');
  },
  onAuthError: (error: Error) => {
    console.error('Auth error:', error);
  },
};

// ==================== Login Page ====================

function LoginPage() {
  const { login, isLoading } = useIAM();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({ email, password });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <h1>Login to Adamus IAM</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// ==================== Dashboard ====================

function Dashboard() {
  const { user, logout } = useIAM();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="user-info">
        <p>Welcome, {user?.name}!</p>
        <p>Email: {user?.email}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// ==================== Users Page ====================

function UsersPage() {
  const { users, loading, error } = useUsers({ page: 1, per_page: 15 });
  const canCreateUsers = usePermission('users.create');

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="users-page">
      <h1>Users</h1>
      
      {canCreateUsers && (
        <button onClick={() => console.log('Create user')}>
          Create New User
        </button>
      )}
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users?.data.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users && (
        <div className="pagination">
          Page {users.current_page} of {users.last_page}
        </div>
      )}
    </div>
  );
}

// ==================== Admin Panel ====================

function AdminPanel() {
  const { user } = useIAM();

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <p>Welcome to the admin panel, {user?.name}</p>
      <p>You have admin access!</p>
    </div>
  );
}

// ==================== App Component ====================

function App() {
  const { isAuthenticated, isLoading } = useIAM();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="users.view">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

// ==================== Render App ====================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IAMProvider config={iamConfig}>
      <App />
    </IAMProvider>
  </React.StrictMode>
);
