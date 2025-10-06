/**
 * Express.js Example
 * 
 * This example shows how to use the IAM client in an Express.js application
 */

import express from 'express';
import { IAMClient } from '@adamus/iam-client';

const app = express();
app.use(express.json());

// Initialize IAM client
const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  verifySSL: true,
});

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const userData = await iamClient.verifyToken(token);
    req.user = userData.user;
    req.permissions = userData.permissions;
    req.roles = userData.roles;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Permission middleware
const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    const hasPermission = await iamClient.hasPermission(permission, req.token);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission 
      });
    }
    
    next();
  };
};

// Role middleware
const requireRole = (role: string) => {
  return async (req: any, res: any, next: any) => {
    const hasRole = await iamClient.hasRole(role, req.token);
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Insufficient role',
        required: role 
      });
    }
    
    next();
  };
};

// Public routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginResponse = await iamClient.login({ email, password });
    
    res.json({
      success: true,
      data: loginResponse,
    });
  } catch (error: any) {
    res.status(401).json({ 
      success: false,
      error: 'Invalid credentials',
      message: error.message 
    });
  }
});

// Protected routes
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      permissions: req.permissions,
      roles: req.roles,
    },
  });
});

app.post('/api/auth/logout', authenticate, async (req: any, res) => {
  try {
    await iamClient.logout(req.token);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User management routes
app.get('/api/users', authenticate, async (req: any, res) => {
  try {
    const users = await iamClient.getUsers({
      page: parseInt(req.query.page) || 1,
      per_page: parseInt(req.query.per_page) || 15,
      search: req.query.search,
    });
    
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id', authenticate, async (req: any, res) => {
  try {
    const user = await iamClient.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'User not found' });
  }
});

app.post('/api/users', authenticate, requirePermission('users.create'), async (req: any, res) => {
  try {
    const newUser = await iamClient.createUser(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/users/:id', authenticate, requirePermission('users.edit'), async (req: any, res) => {
  try {
    const updatedUser = await iamClient.updateUser(req.params.id, req.body);
    res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/users/:id', authenticate, requirePermission('users.delete'), async (req: any, res) => {
  try {
    await iamClient.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Department routes
app.get('/api/departments', authenticate, async (req: any, res) => {
  try {
    const departments = await iamClient.getDepartments({
      page: parseInt(req.query.page) || 1,
      per_page: parseInt(req.query.per_page) || 20,
    });
    
    res.json({ success: true, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/departments', authenticate, requireRole('admin'), async (req: any, res) => {
  try {
    const newDepartment = await iamClient.createDepartment(req.body);
    res.status(201).json({ success: true, data: newDepartment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
