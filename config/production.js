/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description Production configuration for Cloud-Native Issue Tracker
 * 
 * This file contains production-specific configuration settings
 * including AWS resources, security settings, and deployment options.
 */

module.exports = {
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accountId: process.env.AWS_ACCOUNT_ID,
    profile: process.env.AWS_PROFILE || 'default',
  },

  // Application Configuration
  app: {
    name: 'cloud-native-issue-tracker',
    version: '1.0.0',
    environment: 'production',
    domain: process.env.DOMAIN_NAME || 'issue-tracker.yourdomain.com',
  },

  // Database Configuration
  database: {
    tables: {
      issues: 'Issues',
      users: 'Users',
      sessions: 'UserSessions',
    },
    billing: 'PAY_PER_REQUEST',
    encryption: true,
    backup: {
      enabled: true,
      retention: 7, // days
    },
  },

  // Authentication Configuration
  auth: {
    jwt: {
      secretArn: process.env.JWT_SECRET_ARN,
      expiresIn: '24h',
      refreshExpiresIn: '7d',
    },
    password: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // requests per window
    },
  },

  // API Gateway Configuration
  api: {
    cors: {
      allowedOrigins: [
        'https://issue-tracker.yourdomain.com',
        'https://www.issue-tracker.yourdomain.com',
      ],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      allowCredentials: true,
    },
    throttling: {
      enabled: true,
      rateLimit: 1000, // requests per second
      burstLimit: 2000, // burst requests
    },
    logging: {
      enabled: true,
      level: 'INFO',
      retention: 30, // days
    },
  },

  // Lambda Configuration
  lambda: {
    runtime: 'nodejs20.x',
    memorySize: 512,
    timeout: 30,
    environment: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'INFO',
    },
    layers: [
      // Add custom layers for shared dependencies
    ],
  },

  // Monitoring and Logging
  monitoring: {
    cloudwatch: {
      enabled: true,
      logRetention: 30, // days
      metrics: {
        enabled: true,
        customMetrics: true,
      },
    },
    xray: {
      enabled: true,
      tracing: true,
    },
    alarms: {
      enabled: true,
      errorRate: {
        threshold: 5, // percentage
        evaluationPeriods: 2,
      },
      latency: {
        threshold: 1000, // milliseconds
        evaluationPeriods: 2,
      },
    },
  },

  // Security Configuration
  security: {
    waf: {
      enabled: true,
      rules: [
        'AWSManagedRulesCommonRuleSet',
        'AWSManagedRulesKnownBadInputsRuleSet',
        'AWSManagedRulesSQLiRuleSet',
      ],
    },
    encryption: {
      atRest: true,
      inTransit: true,
    },
    secrets: {
      rotation: {
        enabled: true,
        interval: 90, // days
      },
    },
  },

  // Deployment Configuration
  deployment: {
    pipeline: {
      enabled: true,
      source: {
        type: 'github',
        repository: 'VinceBiggz/cloud-native-issue-tracker',
        branch: 'main',
      },
      stages: [
        'build',
        'test',
        'deploy',
      ],
    },
    rollback: {
      enabled: true,
      automatic: true,
      threshold: 5, // percentage error rate
    },
  },

  // Notification Configuration
  notifications: {
    email: {
      enabled: true,
      ses: {
        region: 'us-east-1',
        fromAddress: 'noreply@yourdomain.com',
      },
    },
    slack: {
      enabled: true,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#issue-tracker',
    },
  },

  // Feature Flags
  features: {
    userRegistration: true,
    emailVerification: true,
    passwordReset: true,
    twoFactorAuth: false, // TODO: Implement in future
    fileAttachments: false, // TODO: Implement in future
    realTimeNotifications: false, // TODO: Implement in future
  },
};
