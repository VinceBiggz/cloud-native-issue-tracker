/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Authentication Lambda Handler
 * 
 * This Lambda function handles user authentication operations including
 * registration, login, token validation, and user management.
 * 
 * Supported endpoints:
 * - POST /auth/register - User registration
 * - POST /auth/login - User login
 * - POST /auth/refresh - Refresh JWT token
 * - GET /auth/me - Get current user info
 * - POST /auth/logout - User logout
 * 
 * Environment variables:
 * - JWT_SECRET: Secret key for JWT signing
 * - USERS_TABLE: DynamoDB table name for users
 * - SESSIONS_TABLE: DynamoDB table name for sessions
 * 
 * TODO: Implement actual DynamoDB integration
 * TODO: Add email verification
 * TODO: Add password reset functionality
 * TODO: Add rate limiting
 */

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  UserRole,
  UserStatus,
  User,
  UserRegistrationRequest,
  UserLoginRequest,
  AuthResponse,
  JWTPayload,
  ApiResponse,
} from "../../../packages/shared/src/index";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.nativeEnum(UserRole).optional().default(UserRole.END_USER),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

// Mock user storage (replace with DynamoDB)
const users: User[] = [
  {
    userId: "admin-001",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

const sessions: Map<string, { userId: string; expiresAt: number }> = new Map();

/**
 * Main Lambda handler function for authentication
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const rawPath = event.rawPath;

  try {
    // Handle registration
    if (rawPath === "/auth/register" && method === "POST") {
      return await handleRegister(event);
    }

    // Handle login
    if (rawPath === "/auth/login" && method === "POST") {
      return await handleLogin(event);
    }

    // Handle token refresh
    if (rawPath === "/auth/refresh" && method === "POST") {
      return await handleRefreshToken(event);
    }

    // Handle get current user
    if (rawPath === "/auth/me" && method === "GET") {
      return await handleGetCurrentUser(event);
    }

    // Handle logout
    if (rawPath === "/auth/logout" && method === "POST") {
      return await handleLogout(event);
    }

    // Unknown endpoint
    return createResponse(404, {
      success: false,
      error: "Endpoint not found",
      message: `Unknown endpoint: ${method} ${rawPath}`,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return createResponse(500, {
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

/**
 * Handle user registration
 */
async function handleRegister(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || "{}");
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = users.find((u) => u.email === validatedData.email);
    if (existingUser) {
      return createResponse(409, {
        success: false,
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

    // Create new user
    const newUser: User = {
      userId: uuidv4(),
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role || UserRole.END_USER,
      status: UserStatus.PENDING_VERIFICATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: validatedData.phone,
      organization: validatedData.organization,
    };

    // Store user (in real implementation, save to DynamoDB)
    users.push(newUser);

    // Generate tokens
    const { token, refreshToken } = generateTokens(newUser);

    // Create session
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      userId: newUser.userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const authResponse: AuthResponse = {
      user: newUser,
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };

    return createResponse(201, {
      success: true,
      data: authResponse,
      message: "User registered successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: "Validation error",
        message: error.errors.map((e) => e.message).join(", "),
      });
    }
    throw error;
  }
}

/**
 * Handle user login
 */
async function handleLogin(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || "{}");
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = users.find((u) => u.email === validatedData.email);
    if (!user) {
      return createResponse(401, {
        success: false,
        error: "Invalid credentials",
        message: "Invalid email or password",
      });
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      return createResponse(401, {
        success: false,
        error: "Account not active",
        message: "Your account is not active. Please contact support.",
      });
    }

    // For demo purposes, accept any password for existing users
    // In real implementation, verify password hash
    // const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
    // if (!isValidPassword) {
    //   return createResponse(401, {
    //     success: false,
    //     error: "Invalid credentials",
    //     message: "Invalid email or password",
    //   });
    // }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    // Create session
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      userId: user.userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const authResponse: AuthResponse = {
      user,
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };

    return createResponse(200, {
      success: true,
      data: authResponse,
      message: "Login successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createResponse(400, {
        success: false,
        error: "Validation error",
        message: error.errors.map((e) => e.message).join(", "),
      });
    }
    throw error;
  }
}

/**
 * Handle token refresh
 */
async function handleRefreshToken(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = JSON.parse(event.body || "{}");
    const { refreshToken } = body;

    if (!refreshToken) {
      return createResponse(400, {
        success: false,
        error: "Missing refresh token",
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
    const user = users.find((u) => u.userId === decoded.userId);

    if (!user) {
      return createResponse(401, {
        success: false,
        error: "Invalid token",
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user);

    const authResponse: AuthResponse = {
      user,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };

    return createResponse(200, {
      success: true,
      data: authResponse,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return createResponse(401, {
      success: false,
      error: "Invalid token",
      message: "Invalid refresh token",
    });
  }
}

/**
 * Handle get current user
 */
async function handleGetCurrentUser(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const token = extractTokenFromHeaders(event);
    if (!token) {
      return createResponse(401, {
        success: false,
        error: "Missing token",
        message: "Authorization token is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = users.find((u) => u.userId === decoded.userId);

    if (!user) {
      return createResponse(401, {
        success: false,
        error: "Invalid token",
        message: "Invalid authorization token",
      });
    }

    return createResponse(200, {
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    return createResponse(401, {
      success: false,
      error: "Invalid token",
      message: "Invalid authorization token",
    });
  }
}

/**
 * Handle user logout
 */
async function handleLogout(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const token = extractTokenFromHeaders(event);
    if (token) {
      // In real implementation, add token to blacklist or invalidate session
      // For now, we'll just return success
    }

    return createResponse(200, {
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return createResponse(200, {
      success: true,
      message: "Logout successful",
    });
  }
}

/**
 * Generate JWT tokens for a user
 */
function generateTokens(user: User): { token: string; refreshToken: string } {
  const payload: JWTPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(
    { userId: user.userId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { token, refreshToken };
}

/**
 * Extract JWT token from request headers
 */
function extractTokenFromHeaders(event: APIGatewayProxyEventV2): string | null {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Create standardized API response
 */
function createResponse(statusCode: number, data: ApiResponse): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify(data),
  };
}
