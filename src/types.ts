export interface IAMConfig {
  baseUrl: string;
  timeout?: number;
  verifySSL?: boolean;
  onTokenRefresh?: (token: string) => void;
  onAuthError?: (error: Error) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  permissions?: string[];
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  status?: string;
  roles?: Role[];
  departments?: Department[];
  positions?: Position[];
}

export interface Role {
  id: string | number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string | number;
  name: string;
}

export interface Department {
  id: string | number;
  name: string;
  description?: string;
  parent_department_id?: string | number | null;
  manager_id?: string | number | null;
}

export interface Position {
  id: string | number;
  department_id: string | number;
  title: string;
  description?: string;
  level?: string;
  salary_min?: number;
  salary_max?: number;
  reports_to_position_id?: string | number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: any;
}

export interface TokenVerificationResponse {
  user: User;
  permissions: string[];
  roles: string[];
}

export interface PermissionCheckResponse {
  has_permission: boolean;
  permission: string;
}

export interface RoleCheckResponse {
  has_role: boolean;
  role: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
