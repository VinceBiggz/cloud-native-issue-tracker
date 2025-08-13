/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Development configuration for Cloud-Native Issue Tracker
 * 
 * This file contains development-specific configuration settings
 * optimized for local development and testing.
 */

module.exports = {
  // AWS Configuration (for local development)
  aws: {
    region: 'us-east-1',
    profile: 'default',
    localstack: {
      enabled: false, // Set to true if using LocalStack
      endpoint: 'http://localhost:4566',
    },
  },

  // Application Configuration
  app: {
    name: 'cloud-native-issue-tracker',
    version: '1.0.0',
    environment: 'development',
    port: process.env.PORT || 3000,
    host: 'localhost',
  },

  // Database Configuration (Local JSON file)
  database: {
    type: 'local', // 'local' for JSON file, 'dynamodb' for AWS
    local: {
      file: './data/local-db.json',
      autoSave: true,
      backup: {
        enabled: true,
        interval: 300000, // 5 minutes
        maxBackups: 10,
      },
    },
    dynamodb: {
      tables: {
        issues: 'Issues-Dev',
        users: 'Users-Dev',
        sessions: 'UserSessions-Dev',
      },
      billing: 'PAY_PER_REQUEST',
      encryption: false, // Disabled for development
    },
  },

  // Authentication Configuration
  auth: {
    jwt: {
      secret: 'dev-secret-key-change-in-production',
      expiresIn: '24h',
      refreshExpiresIn: '7d',
    },
    password: {
      minLength: 8,
      requireSpecialChars: false, // Relaxed for development
      requireNumbers: false,
      requireUppercase: false,
    },
    rateLimit: {
      enabled: false, // Disabled for development
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000,
    },
  },

  // API Configuration
  api: {
    cors: {
      allowedOrigins: ['*'], // Allow all origins in development
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      allowCredentials: true,
    },
    throttling: {
      enabled: false, // Disabled for development
      rateLimit: 10000,
      burstLimit: 20000,
    },
    logging: {
      enabled: true,
      level: 'DEBUG',
      console: true,
      file: false,
    },
  },

  // Lambda Configuration (for local testing)
  lambda: {
    runtime: 'nodejs20.x',
    memorySize: 256,
    timeout: 10,
    environment: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'DEBUG',
    },
  },

  // Monitoring and Logging
  monitoring: {
    cloudwatch: {
      enabled: false, // Disabled for local development
    },
    xray: {
      enabled: false,
    },
    console: {
      enabled: true,
      level: 'DEBUG',
      colors: true,
    },
  },

  // Security Configuration (Relaxed for development)
  security: {
    waf: {
      enabled: false,
    },
    encryption: {
      atRest: false,
      inTransit: false,
    },
    secrets: {
      rotation: {
        enabled: false,
      },
    },
  },

  // Development Tools
  devTools: {
    hotReload: {
      enabled: true,
      watchFiles: ['src/**/*', 'web/**/*'],
    },
    debugger: {
      enabled: true,
      port: 9229,
    },
    testing: {
      enabled: true,
      framework: 'jest',
      coverage: {
        enabled: true,
        threshold: 80,
      },
    },
  },

  // Feature Flags (All enabled for development)
  features: {
    userRegistration: true,
    emailVerification: false, // Disabled for development
    passwordReset: false, // Disabled for development
    twoFactorAuth: false,
    fileAttachments: false,
    realTimeNotifications: false,
    mockData: true, // Enable mock data for development
  },

  // Development Utilities
  utilities: {
    seedData: {
      enabled: true,
      file: './data/seed-data.json',
    },
    mockServices: {
      email: true,
      slack: true,
      aws: false, // Set to true to mock AWS services
    },
  },
};
