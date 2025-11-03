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

/**
 * Phone login credentials
 * @property phone - 10-digit phone number starting with 0 (e.g., "0248048753")
 * @property otp - 4-digit OTP code
 * @property device_name - Optional device identifier
 */
export interface PhoneLoginCredentials {
  phone: string;
  otp: string;
  device_name?: string;
}

/**
 * Send OTP request
 * @property phone - 10-digit phone number starting with 0 (e.g., "0248048753")
 * @property purpose - Purpose of the OTP (default: 'login')
 */
export interface SendOtpRequest {
  phone: string;
  purpose?: 'login' | 'verification' | 'password_reset';
}

export interface SendOtpResponse {
  message: string;
  expires_at: string;
  phone: string;
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
  phone?: string;
  phone_verified?: boolean;
  phone_verified_at?: string;
  preferred_login_method?: 'email' | 'phone';
  status?: string;

  // Personal Information
  employee_id?: string;
  first_name?: string;
  surname?: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;

  // Work Information
  site_location?: string;
  company?: string;
  date_employed?: string;

  // Profile
  profile_photo_url?: string;

  // Medical Information
  blood_group?: string;
  allergies?: string;
  chronic_conditions?: string;

  // Emergency Contacts
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Relationships
  roles?: Role[];
  departments?: Department[];
  positions?: Position[];
  phone_numbers?: UserPhoneNumber[];
}

export interface UserPhoneNumber {
  id: string;
  user_id: string;
  phone: string;
  label?: string;
  is_primary: boolean;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
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

export interface PhoneVerificationResponse {
  message: string;
  phone_verified: boolean;
  phone_verified_at: string;
}
