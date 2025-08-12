# Cloud-Native Issue Tracker - Project Documentation

**@author** Vincent Wachira  
**@version** v1.0.0  
**@date** 12-Aug-2025  
**@description** Cloud-native issue tracking platform built with AWS Lambda, DynamoDB, and API Gateway

## Project Overview

This is a fully containerized, serverless issue tracking platform designed for enterprise-scale operations. The project demonstrates modern cloud-native architecture using AWS services and follows best practices for scalability, security, and maintainability.

## Architecture Components

### Infrastructure (CDK)
- **Location**: `infra/`
- **Purpose**: AWS CDK infrastructure as code
- **Components**: DynamoDB, Lambda, API Gateway, IAM roles
- **Technology**: TypeScript, AWS CDK v2

### API Service (Lambda)
- **Location**: `services/api/`
- **Purpose**: REST API handlers for issue management
- **Components**: Lambda functions, API endpoints
- **Technology**: TypeScript, AWS Lambda, API Gateway

### Shared Package
- **Location**: `packages/shared/`
- **Purpose**: Common utilities, types, and constants
- **Components**: Shared types, utility functions
- **Technology**: TypeScript

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint with TypeScript rules
- Prettier for code formatting
- Conventional commits

### Testing Strategy
- Unit tests for Lambda functions
- Integration tests for API endpoints
- Local testing with simulated events
- CDK synthesis validation

### Deployment
- AWS CDK for infrastructure
- GitHub Actions for CI/CD
- Environment-specific configurations
- Security best practices

## File Structure

```
cloud-issue-tracker/
├── infra/                    # AWS CDK Infrastructure
│   ├── bin/                  # CDK app entry point
│   ├── lib/                  # CDK stack definitions
│   ├── package.json          # CDK dependencies
│   └── tsconfig.json         # TypeScript config
├── services/
│   └── api/                  # Lambda API service
│       ├── src/              # Lambda handler source
│       ├── package.json      # API dependencies
│       └── tsconfig.json     # TypeScript config
├── packages/
│   └── shared/               # Shared utilities and types
│       ├── src/              # Shared source code
│       ├── package.json      # Shared dependencies
│       └── tsconfig.json     # TypeScript config
├── .github/workflows/        # CI/CD pipelines
├── package.json              # Root workspace config
└── README.md                 # Main documentation
```

## Version History

### v1.0.0 (12-Aug-2025)
- Initial project setup
- Monorepo structure with npm workspaces
- CDK infrastructure for AWS services
- Basic Lambda API with CRUD operations
- Local testing framework
- Comprehensive documentation
