# Cloud-Native Issue Tracker

Serverless issue tracking platform on AWS (API Gateway + Lambda + DynamoDB) with Slack/email notifications and RBAC. Monorepo with workspaces for infra and services.

## Structure
- infra: IaC (AWS CDK)
- services/api: Lambda handlers & API
- packages/shared: shared libs and types

## Getting started
- Node.js 20+ recommended (22 OK)
- npm install -ws
- npm run build -ws

Publish with GitHub Desktop or `gh repo create cloud-issue-tracker`.
