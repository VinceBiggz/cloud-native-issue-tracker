# 🚀 Cloud-Native Issue Tracker

> **A fully containerized, serverless issue tracking platform built with AWS Lambda, DynamoDB, and API Gateway**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue.svg)](https://www.typescriptlang.org/)
[![AWS CDK](https://img.shields.io/badge/AWS%20CDK-2.x-orange.svg)](https://aws.amazon.com/cdk/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Cloud-Native Issue Tracker is a modern, scalable issue tracking system designed for enterprise-scale operations. Built with serverless architecture on AWS, it provides real-time issue management, user authentication, and comprehensive reporting capabilities.

### Key Highlights

- **🔐 Secure Authentication**: JWT-based authentication with role-based access control
- **📊 Real-time Dashboard**: Live metrics and issue tracking
- **🔧 API-First Design**: RESTful API with comprehensive documentation
- **☁️ Serverless Architecture**: Built on AWS Lambda, DynamoDB, and API Gateway
- **🛡️ Enterprise Security**: WAF protection, encryption, and audit logging
- **📱 Responsive UI**: Modern, mobile-friendly interface

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure JWT-based authentication with email validation
- **Role-Based Access Control**: Admin, Support Staff, and End User roles with granular permissions
- **Session Management**: Secure token refresh and logout with session tracking
- **Password Security**: Bcrypt hashing with configurable requirements and strength validation
- **Local Development**: Mock authentication for testing without external dependencies

### 📋 Issue Management
- **Create & Track Issues**: Full CRUD operations for issue management with real-time updates
- **Priority Levels**: Low, Medium, High, Critical priority classification with visual indicators
- **Status Tracking**: Open, In Progress, Resolved, Closed, Reopened with workflow enforcement
- **Assignment & Ownership**: Assign issues to team members with notification system
- **Tags & Categories**: Flexible issue categorization and filtering
- **Local Storage**: JSON-based local database for development and testing

### 📊 Dashboard & Analytics
- **Real-time Metrics**: Live issue statistics and trends with auto-refresh
- **Visual Charts**: Status and priority distribution charts with interactive elements
- **Key Performance Indicators**: Total Issues, Open Issues, In Progress, Critical Issues tracking
- **Navigation System**: Multi-section interface with URL routing and browser history support
- **Responsive Design**: Mobile-friendly dashboard with adaptive layouts

### 🔧 API & Integration
- **RESTful API**: Comprehensive API with OpenAPI documentation and consistent response formats
- **Local Development Server**: Built-in server for testing with mock responses
- **API Testing Interface**: Integrated testing panel within the application
- **CORS Support**: Cross-origin resource sharing for web application integration
- **Error Handling**: Comprehensive error responses with detailed messages

### 🛡️ Security & Compliance
- **Input Validation**: Zod schema validation for all API endpoints
- **CORS Configuration**: Configurable cross-origin policies for development and production
- **Rate Limiting**: API protection against abuse with configurable thresholds
- **Environment Configuration**: Separate development and production settings
- **Code Quality**: ESLint and Prettier for consistent code formatting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   (React/Vue)   │◄──►│   (AWS)         │◄──►│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   DynamoDB      │    │   CloudWatch    │
                       │   (Database)    │    │   (Monitoring)  │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   S3            │
                       │   (File Storage)│
                       └─────────────────┘
```

### Architecture Components

- **Frontend**: Modern web interface with responsive design
- **API Gateway**: HTTP API with CORS and authentication
- **Lambda Functions**: Serverless compute for business logic
- **DynamoDB**: NoSQL database for data persistence
- **CloudWatch**: Monitoring, logging, and alerting
- **S3**: File storage for attachments and static assets

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.5.4
- **Framework**: AWS CDK 2.x
- **Database**: Amazon DynamoDB
- **Compute**: AWS Lambda
- **API**: Amazon API Gateway
- **Authentication**: JWT with bcrypt

### Frontend
- **Language**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Build Tools**: Webpack (planned)
- **Testing**: Jest (planned)

### DevOps & Tools
- **Infrastructure**: AWS CDK
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: CloudWatch, X-Ray
- **Security**: AWS WAF, Secrets Manager
- **Testing**: Jest, Playwright (planned)

## 📁 Project Structure

```
cloud-native-issue-tracker/
├── 📁 infra/                    # AWS CDK Infrastructure
│   ├── 📁 bin/                  # CDK App Entry Point
│   ├── 📁 lib/                  # CDK Stack Definitions
│   ├── 📁 test/                 # Infrastructure Tests
│   └── 📄 package.json          # Infrastructure Dependencies
├── 📁 services/                 # Lambda Services
│   ├── 📁 api/                  # Main API Handler
│   │   ├── 📁 src/              # TypeScript Source
│   │   └── 📄 package.json      # API Dependencies
│   └── 📁 auth/                 # Authentication Handler
│       ├── 📁 src/              # TypeScript Source
│       └── 📄 package.json      # Auth Dependencies
├── 📁 packages/                 # Shared Packages
│   └── 📁 shared/               # Shared Types & Utilities
│       ├── 📁 src/              # TypeScript Source
│       └── 📄 package.json      # Shared Dependencies
├── 📁 web/                      # Frontend Application
│   ├── 📁 styles/               # CSS Stylesheets
│   │   └── 📄 main.css          # Main Stylesheet
│   ├── 📁 js/                   # JavaScript Modules
│   │   └── 📄 app.js            # Main Application Logic
│   └── 📄 index.html            # Main HTML File
├── 📁 config/                   # Configuration Files
│   ├── 📄 development.js        # Development Config
│   └── 📄 production.js         # Production Config
├── 📁 data/                     # Local Data Storage
│   └── 📄 local-db.json         # Local Database
├── 📄 server.js                 # Local Development Server
├── 📄 package.json              # Root Package Configuration
└── 📄 README.md                 # Project Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher
- **AWS CLI**: Configured with appropriate credentials
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VinceBiggz/cloud-native-issue-tracker.git
   cd cloud-native-issue-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start local development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Local Development

The project includes a comprehensive local development environment:

- **Local Server**: Node.js server with API simulation and CORS support
- **Local Database**: JSON-based data storage with auto-save functionality
- **Authentication System**: Mock JWT authentication with role-based access
- **Dashboard Interface**: Real-time metrics and interactive charts
- **Multi-section Navigation**: Dashboard, Issues, and API Testing sections
- **URL Routing**: Browser history support with back/forward navigation
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Mock Services**: Simulated AWS services for development

## 🔧 Development

### Available Scripts

```bash
# Build all packages
npm run build

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run fmt

# Deploy to AWS
npm run deploy

# Synthesize CDK
npm run synth
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Implement changes with proper testing
   - Update documentation
   - Submit pull request

2. **Code Quality**
   - Follow TypeScript best practices
   - Use ESLint for code linting
   - Maintain test coverage above 80%
   - Document all public APIs

3. **Testing Strategy**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for user workflows
   - Infrastructure tests for CDK stacks

### Environment Configuration

The project supports multiple environments:

- **Development**: Local development with mock services
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

Configuration files are located in the `config/` directory.

## 🚀 Deployment

### AWS Deployment

1. **Bootstrap CDK** (first time only)
   ```bash
   npm run bootstrap
   ```

2. **Deploy to AWS**
   ```bash
   npm run deploy
   ```

3. **Verify deployment**
   ```bash
   npm run diff
   ```

### Environment Variables

Set the following environment variables for production:

```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id
DOMAIN_NAME=your-domain.com
JWT_SECRET_ARN=arn:aws:secretsmanager:...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### CI/CD Pipeline

The project includes GitHub Actions for automated deployment:

- **Build**: Compile TypeScript and run tests
- **Test**: Execute unit and integration tests
- **Deploy**: Deploy to AWS using CDK
- **Monitor**: Verify deployment health

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "END_USER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "END_USER",
      "status": "PENDING_VERIFICATION"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 86400
  }
}
```

#### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Issue Management Endpoints

#### GET /issues
Retrieve list of issues with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `priority`: Filter by priority

#### POST /issues
Create a new issue.

**Request Body:**
```json
{
  "title": "Bug Report",
  "description": "Application crashes on login",
  "priority": "HIGH",
  "tags": ["bug", "critical"]
}
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Update documentation**
6. **Submit a pull request**

### Development Standards

- **Code Style**: Follow TypeScript and ESLint rules
- **Testing**: Maintain 80%+ test coverage
- **Documentation**: Update README and API docs
- **Commits**: Use conventional commit messages

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vincent Wachira**
- GitHub: [@VinceBiggz](https://github.com/VinceBiggz)
- Email: [contact@vincentwachira.com]

## 🙏 Acknowledgments

- AWS CDK team for the excellent infrastructure framework
- The open-source community for inspiration and tools
- All contributors who help improve this project

---

**Version**: 1.0.0  
**Last Updated**: 12-Aug-2025  
**Status**: Active Development
