/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Shared Package - Common Utilities and Types
 * 
 * This package contains shared utilities, types, and constants used across
 * the cloud-native issue tracker application.
 * 
 * Contents:
 * - Project constants and configuration
 * - Shared TypeScript types and interfaces
 * - Utility functions for common operations
 * - Validation schemas (when Zod is added)
 * 
 * Usage:
 * Import this package in other workspaces to share common functionality
 * and maintain consistency across the application.
 */

/**
 * Project name constant used throughout the application
 * This ensures consistent naming across all components
 */
export const projectName = "cloud-issue-tracker";

/**
 * Application version - should match package.json version
 */
export const APP_VERSION = "1.0.0";

/**
 * User roles enumeration
 * Defines the different user roles in the system
 */
export enum UserRole {
  ADMIN = "ADMIN",
  SUPPORT_STAFF = "SUPPORT_STAFF",
  END_USER = "END_USER",
}

/**
 * User status enumeration
 * Defines the possible states a user account can be in
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

/**
 * Issue status enumeration
 * Defines the possible states an issue can be in
 */
export enum IssueStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

/**
 * Issue priority enumeration
 * Defines the priority levels for issues
 */
export enum IssuePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * User interface definition
 * Represents the structure of a user in the system
 */
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  phone?: string;
  organization?: string;
}

/**
 * User registration request interface
 * Data required to register a new user
 */
export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  organization?: string;
}

/**
 * User login request interface
 * Data required to authenticate a user
 */
export interface UserLoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication response interface
 * Response data after successful authentication
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT payload interface
 * Data stored in the JWT token
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Issue type definition
 * Represents the structure of an issue in the system
 */
export interface Issue {
  issueId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

/**
 * Pagination interface
 * For paginated API responses
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
