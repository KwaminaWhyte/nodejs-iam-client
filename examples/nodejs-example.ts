/**
 * Node.js Example
 * 
 * This example shows how to use the IAM client in a standalone Node.js application
 */

import { IAMClient } from '@adamus/iam-client';

// Initialize the IAM client
const iamClient = new IAMClient({
  baseUrl: process.env.IAM_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  verifySSL: true,
  onTokenRefresh: (token) => {
    console.log('Token refreshed:', token);
  },
  onAuthError: (error) => {
    console.error('Authentication error:', error);
  },
});

async function main() {
  try {
    // ==================== Authentication ====================
    
    console.log('=== Authentication ===');
    
    // Login
    const loginResponse = await iamClient.login({
      email: 'admin@example.com',
      password: 'password123',
    });
    
    console.log('Login successful!');
    console.log('Access Token:', loginResponse.access_token);
    console.log('User:', loginResponse.user);
    
    // Get current user
    const currentUser = await iamClient.getCurrentUser();
    console.log('Current User:', currentUser.user);
    
    // Check permissions
    const canCreateForms = await iamClient.hasPermission('forms.create');
    console.log('Can create forms:', canCreateForms);
    
    const canDeleteUsers = await iamClient.hasPermission('users.delete');
    console.log('Can delete users:', canDeleteUsers);
    
    // Check roles
    const isAdmin = await iamClient.hasRole('admin');
    console.log('Is admin:', isAdmin);
    
    const isManager = await iamClient.hasRole('manager');
    console.log('Is manager:', isManager);
    
    // ==================== User Management ====================
    
    console.log('\n=== User Management ===');
    
    // Get all users
    const usersResponse = await iamClient.getUsers({
      page: 1,
      per_page: 10,
      search: 'john',
    });
    
    console.log(`Found ${usersResponse.total} users`);
    console.log('Users:', usersResponse.data);
    
    // Get a specific user
    if (usersResponse.data.length > 0) {
      const userId = usersResponse.data[0].id;
      const user = await iamClient.getUser(userId);
      console.log('User details:', user);
    }
    
    // Create a new user
    const newUser = await iamClient.createUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      status: 'active',
    });
    
    console.log('Created user:', newUser);
    
    // Update the user
    const updatedUser = await iamClient.updateUser(newUser.id, {
      name: 'John Updated Doe',
    });
    
    console.log('Updated user:', updatedUser);
    
    // Delete the user
    await iamClient.deleteUser(newUser.id);
    console.log('User deleted successfully');
    
    // ==================== Department Management ====================
    
    console.log('\n=== Department Management ===');
    
    // Get all departments
    const departmentsResponse = await iamClient.getDepartments({
      page: 1,
      per_page: 20,
    });
    
    console.log(`Found ${departmentsResponse.total} departments`);
    console.log('Departments:', departmentsResponse.data);
    
    // Create a new department
    const newDepartment = await iamClient.createDepartment({
      name: 'Engineering',
      description: 'Engineering Department',
      parent_department_id: null,
    });
    
    console.log('Created department:', newDepartment);
    
    // Get users in the department
    const departmentUsers = await iamClient.getUsersByDepartment(newDepartment.id);
    console.log('Department users:', departmentUsers);
    
    // ==================== Position Management ====================
    
    console.log('\n=== Position Management ===');
    
    // Get all positions
    const positionsResponse = await iamClient.getPositions({
      page: 1,
      per_page: 20,
    });
    
    console.log(`Found ${positionsResponse.total} positions`);
    console.log('Positions:', positionsResponse.data);
    
    // Create a new position
    const newPosition = await iamClient.createPosition({
      department_id: newDepartment.id,
      title: 'Senior Developer',
      description: 'Senior software developer position',
      level: 'senior',
      salary_min: 80000,
      salary_max: 120000,
    });
    
    console.log('Created position:', newPosition);
    
    // Get positions by department
    const departmentPositions = await iamClient.getPositionsByDepartment(newDepartment.id);
    console.log('Department positions:', departmentPositions);
    
    // Get users in the position
    const positionUsers = await iamClient.getUsersByPosition(newPosition.id);
    console.log('Position users:', positionUsers);
    
    // ==================== Token Management ====================
    
    console.log('\n=== Token Management ===');
    
    // Refresh token
    const refreshResponse = await iamClient.refreshToken();
    console.log('Token refreshed:', refreshResponse.access_token);
    
    // ==================== Logout ====================
    
    console.log('\n=== Logout ===');
    
    // Logout from current session
    await iamClient.logout();
    console.log('Logged out successfully');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the example
main();
