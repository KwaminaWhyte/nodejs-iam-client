import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  IAMConfig,
  LoginCredentials,
  PhoneLoginCredentials,
  SendOtpRequest,
  SendOtpResponse,
  LoginResponse,
  User,
  Department,
  Position,
  PaginatedResponse,
  QueryParams,
  TokenVerificationResponse,
  PermissionCheckResponse,
  RoleCheckResponse,
  RefreshTokenResponse,
  PhoneVerificationResponse,
} from './types';

export class IAMClient {
  private client: AxiosInstance;
  private config: IAMConfig;
  private token: string | null = null;
  private tokenCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration: number = 60000; // 1 minute cache like Laravel

  constructor(config: IAMConfig) {
    this.config = {
      timeout: 10000,
      verifySSL: true,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl.replace(/\/$/, ''),
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && this.config.onAuthError) {
          this.config.onAuthError(new Error('Authentication failed'));
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
    this.clearTokenCache();
  }

  // ==================== Authentication ====================

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/auth/login', credentials);
      this.setToken(response.data.access_token);
      
      // Extract permissions from roles like Laravel does
      const enrichedResponse = {
        ...response.data,
        permissions: this.extractPermissionsFromLoginResponse(response.data),
      };
      
      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error, 'Login failed');
    }
  }

  /**
   * Extract permissions from login response (like Laravel does)
   */
  private extractPermissionsFromLoginResponse(response: LoginResponse): string[] {
    const permissions = new Set<string>(response.permissions || []);
    
    // Extract permissions from user roles
    if (response.user?.roles) {
      for (const role of response.user.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            const permName = typeof permission === 'string' ? permission : permission.name;
            permissions.add(permName);
          }
        }
      }
    }
    
    return Array.from(permissions);
  }

  /**
   * Verify token and get user data (with caching)
   */
  async verifyToken(token?: string): Promise<TokenVerificationResponse> {
    const tokenToVerify = token || this.token;
    if (!tokenToVerify) {
      throw new Error('No token provided');
    }

    // Check cache first (1 minute cache like Laravel)
    const cacheKey = `token_${tokenToVerify}`;
    const cached = this.tokenCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const headers = { Authorization: `Bearer ${tokenToVerify}` };
      const response = await this.client.get<TokenVerificationResponse>('/auth/me', { headers });
      
      // Extract permissions from roles like Laravel does
      const enrichedData = this.enrichPermissionsFromRoles(response.data);
      
      // Cache the result
      this.tokenCache.set(cacheKey, {
        data: enrichedData,
        timestamp: Date.now(),
      });
      
      return enrichedData;
    } catch (error) {
      // Clear cache on error
      this.tokenCache.delete(cacheKey);
      throw this.handleError(error, 'Token verification failed');
    }
  }

  /**
   * Extract permissions from roles (like Laravel does)
   */
  private enrichPermissionsFromRoles(data: TokenVerificationResponse): TokenVerificationResponse {
    const permissions = new Set<string>(data.permissions || []);
    
    // Extract permissions from user roles
    if (data.user?.roles) {
      for (const role of data.user.roles) {
        if (role.permissions) {
          for (const permission of role.permissions) {
            const permName = typeof permission === 'string' ? permission : permission.name;
            permissions.add(permName);
          }
        }
      }
    }
    
    return {
      ...data,
      permissions: Array.from(permissions),
    };
  }

  /**
   * Clear token cache
   */
  clearTokenCache(): void {
    this.tokenCache.clear();
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<TokenVerificationResponse> {
    return this.verifyToken();
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission: string, token?: string): Promise<boolean> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.post<PermissionCheckResponse>(
        '/auth/check-permission',
        { permission },
        { headers }
      );
      return response.data.has_permission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: string, token?: string): Promise<boolean> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.post<RoleCheckResponse>(
        '/auth/check-role',
        { role },
        { headers }
      );
      return response.data.has_role;
    } catch (error) {
      console.error('Role check failed:', error);
      return false;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(token?: string): Promise<RefreshTokenResponse> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', {}, { headers });
      
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        if (this.config.onTokenRefresh) {
          this.config.onTokenRefresh(response.data.access_token);
        }
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Token refresh failed');
    }
  }

  /**
   * Logout from current session
   */
  async logout(token?: string): Promise<void> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await this.client.post('/auth/logout', {}, { headers });
      this.clearToken();
    } catch (error) {
      console.error('Logout failed:', error);
      this.clearToken();
    }
  }

  /**
   * Logout from all sessions
   */
  async logoutAll(token?: string): Promise<void> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await this.client.post('/auth/logout-all', {}, { headers });
      this.clearToken();
    } catch (error) {
      throw this.handleError(error, 'Logout all failed');
    }
  }

  // ==================== Phone/OTP Authentication ====================

  /**
   * Send OTP to phone number
   */
  async sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
    try {
      const response = await this.client.post<SendOtpResponse>('/auth/send-otp', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to send OTP');
    }
  }

  /**
   * Login with phone and OTP
   */
  async loginWithPhone(credentials: PhoneLoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/auth/login-with-phone', credentials);
      this.setToken(response.data.access_token);

      // Extract permissions from roles like Laravel does
      const enrichedResponse = {
        ...response.data,
        permissions: this.extractPermissionsFromLoginResponse(response.data),
      };

      return enrichedResponse;
    } catch (error) {
      throw this.handleError(error, 'Phone login failed');
    }
  }

  /**
   * Send phone verification OTP
   */
  async verifyPhone(phone: string): Promise<SendOtpResponse> {
    try {
      const response = await this.client.post<SendOtpResponse>('/auth/verify-phone', { phone });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to send phone verification OTP');
    }
  }

  /**
   * Confirm phone verification with OTP
   */
  async confirmPhoneVerification(phone: string, otp: string): Promise<PhoneVerificationResponse> {
    try {
      const response = await this.client.post<PhoneVerificationResponse>('/auth/confirm-phone-verification', {
        phone,
        otp,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to confirm phone verification');
    }
  }

  // ==================== User Management ====================

  /**
   * Get all users
   */
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await this.client.get<PaginatedResponse<User>>('/users', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch users');
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: string | number): Promise<User> {
    try {
      const response = await this.client.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    try {
      const response = await this.client.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create user');
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string | number, userData: Partial<User>): Promise<User> {
    try {
      const response = await this.client.put<User>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string | number): Promise<void> {
    try {
      await this.client.delete(`/users/${userId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete user');
    }
  }

  // ==================== Department Management ====================

  /**
   * Get all departments
   */
  async getDepartments(params?: QueryParams): Promise<PaginatedResponse<Department>> {
    try {
      const response = await this.client.get<PaginatedResponse<Department>>('/departments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch departments');
    }
  }

  /**
   * Get a specific department by ID
   */
  async getDepartment(departmentId: string | number): Promise<Department> {
    try {
      const response = await this.client.get<Department>(`/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch department');
    }
  }

  /**
   * Create a new department
   */
  async createDepartment(departmentData: Partial<Department>): Promise<Department> {
    try {
      const response = await this.client.post<Department>('/departments', departmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create department');
    }
  }

  /**
   * Update an existing department
   */
  async updateDepartment(departmentId: string | number, departmentData: Partial<Department>): Promise<Department> {
    try {
      const response = await this.client.put<Department>(`/departments/${departmentId}`, departmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update department');
    }
  }

  /**
   * Delete a department
   */
  async deleteDepartment(departmentId: string | number): Promise<void> {
    try {
      await this.client.delete(`/departments/${departmentId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete department');
    }
  }

  /**
   * Get users in a specific department
   */
  async getUsersByDepartment(departmentId: string | number): Promise<User[]> {
    try {
      const response = await this.client.get<User[]>(`/departments/${departmentId}/users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch department users');
    }
  }

  // ==================== Position Management ====================

  /**
   * Get all positions
   */
  async getPositions(params?: QueryParams): Promise<PaginatedResponse<Position>> {
    try {
      const response = await this.client.get<PaginatedResponse<Position>>('/positions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch positions');
    }
  }

  /**
   * Get a specific position by ID
   */
  async getPosition(positionId: string | number): Promise<Position> {
    try {
      const response = await this.client.get<Position>(`/positions/${positionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch position');
    }
  }

  /**
   * Get positions by department
   */
  async getPositionsByDepartment(departmentId: string | number): Promise<Position[]> {
    try {
      const response = await this.client.get<Position[]>(`/departments/${departmentId}/positions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch department positions');
    }
  }

  /**
   * Create a new position
   */
  async createPosition(positionData: Partial<Position>): Promise<Position> {
    try {
      const response = await this.client.post<Position>('/positions', positionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create position');
    }
  }

  /**
   * Update an existing position
   */
  async updatePosition(positionId: string | number, positionData: Partial<Position>): Promise<Position> {
    try {
      const response = await this.client.put<Position>(`/positions/${positionId}`, positionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update position');
    }
  }

  /**
   * Delete a position
   */
  async deletePosition(positionId: string | number): Promise<void> {
    try {
      await this.client.delete(`/positions/${positionId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete position');
    }
  }

  /**
   * Get users assigned to a specific position
   */
  async getUsersByPosition(positionId: string | number): Promise<User[]> {
    try {
      const response = await this.client.get<User[]>(`/positions/${positionId}/users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch position users');
    }
  }

  // ==================== Error Handling ====================

  private handleError(error: any, message: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.data) {
        const errorData: any = axiosError.response.data;
        
        // Extract the most relevant error message
        let errorMessage = message;
        
        // Check for Laravel validation errors format
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // If there are specific field errors, include them
        if (errorData.errors) {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages : [messages];
              return msgs.join(', ');
            })
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
        
        return new Error(errorMessage);
      }
      
      return new Error(`${message}: ${axiosError.message}`);
    }
    
    return new Error(`${message}: ${error.message || 'Unknown error'}`);
  }
}
