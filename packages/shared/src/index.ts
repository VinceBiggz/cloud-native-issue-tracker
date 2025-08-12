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
 * Default API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
