# Cloud-Native Issue Tracker

A fully containerized, serverless issue tracking platform built with AWS Lambda, DynamoDB, and API Gateway, designed for enterprise-scale operations. This project integrates with Slack and email for real-time notifications, supports role-based access, and includes CI/CD pipelines via GitHub Actions.

## 🏗️ Architecture

- **API Gateway**: HTTP API with CORS support
- **Lambda**: Node.js 20.x runtime with TypeScript
- **DynamoDB**: Serverless database with pay-per-request billing
- **CDK**: Infrastructure as Code with TypeScript
- **Monorepo**: npm workspaces for organized development

## 📁 Project Structure

```
cloud-native-issue-tracker/
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
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20+ (22.x recommended)
- **npm**: 10+ (comes with Node.js)
- **AWS CLI**: For deployment (optional for local testing)
- **AWS CDK**: For infrastructure deployment

### Local Development

1. **Clone and Install**:
   ```bash
   git clone https://github.com/VinceBiggz/cloud-native-issue-tracker.git
   cd cloud-native-issue-tracker
   npm install
   ```

2. **Build All Packages**:
   ```bash
   npm run build
   ```

3. **Test Locally**:
   ```bash
   node test-local.js
   ```

4. **Validate Infrastructure**:
   ```bash
   npm run synth
   ```

### Local Testing Results

The local test script validates all API endpoints:

```
🧪 Testing Lambda Handler Locally

📝 Testing: GET /issues
✅ Status: 200
📄 Response: {"items":[],"nextToken":null}

📝 Testing: POST /issues
✅ Status: 201
📄 Response: {"issueId":"demo","status":"OPEN"}

📝 Testing: GET /issues/123
✅ Status: 200
📄 Response: {"issueId":"123","status":"OPEN"}

📝 Testing: PUT /issues/123
✅ Status: 200
📄 Response: {"issueId":"123","status":"UPDATED"}

📝 Testing: DELETE /issues/123
✅ Status: 204
📄 Response:

📝 Testing: GET /unknown
✅ Status: 404
📄 Response: {"message":"Not Found"}

🎉 Local testing complete!
```

## 🛠️ Available Scripts

### Root Level
- `npm run build` - Build all workspaces
- `npm run clean` - Clean all build artifacts
- `npm run fmt` - Format code with Prettier
- `npm run lint` - Run linting (placeholder)
- `npm run synth` - Synthesize CDK CloudFormation
- `npm run deploy` - Deploy to AWS
- `npm run diff` - Show CDK diff
- `npm run bootstrap` - Bootstrap CDK environment

### Individual Workspaces
- `npm run build -w infra` - Build infrastructure
- `npm run build -w services/api` - Build API service
- `npm run build -w packages/shared` - Build shared package

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/issues` | List all issues |
| POST | `/issues` | Create new issue |
| GET | `/issues/{id}` | Get specific issue |
| PUT | `/issues/{id}` | Update issue |
| DELETE | `/issues/{id}` | Delete issue |

## 🚀 Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- CDK bootstrapped in your AWS account

### Deploy to AWS
```bash
# Bootstrap CDK (first time only)
npm run bootstrap

# Deploy the stack
npm run deploy
```

### Environment Variables
- `CDK_DEFAULT_ACCOUNT`: AWS Account ID
- `CDK_DEFAULT_REGION`: AWS Region (e.g., us-east-1)

## 🔧 Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes in appropriate workspace
3. Update tests and documentation
4. Build and test locally: `npm run build && node test-local.js`
5. Commit and push: `git commit -m "feat: add new feature"`

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration (to be added)
- Prettier formatting
- Conventional commits

## 📊 Infrastructure

The CDK stack creates:
- **DynamoDB Table**: `Issues` with `issueId` as partition key
- **Lambda Function**: API handler with 256MB memory, 10s timeout
- **API Gateway**: HTTP API with CORS enabled
- **IAM Roles**: Least privilege access to DynamoDB
- **CloudWatch**: X-Ray tracing enabled

## 🔒 Security

- IAM roles with least privilege
- CORS configured for web access
- DynamoDB encryption at rest
- Lambda execution role isolation

## 📈 Monitoring

- CloudWatch logs for Lambda
- X-Ray tracing for request tracking
- API Gateway metrics
- DynamoDB CloudWatch metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- **Repository**: https://github.com/VinceBiggz/cloud-native-issue-tracker
- **Issues**: https://github.com/VinceBiggz/cloud-native-issue-tracker/issues
- **AWS CDK**: https://docs.aws.amazon.com/cdk/
- **AWS Lambda**: https://docs.aws.amazon.com/lambda/
