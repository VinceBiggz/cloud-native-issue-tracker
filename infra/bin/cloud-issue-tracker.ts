/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description CDK App Entry Point - Cloud-Native Issue Tracker
 * 
 * This is the main entry point for the AWS CDK application.
 * It initializes the CDK app and creates the main infrastructure stack.
 * 
 * The stack includes:
 * - DynamoDB table for issue storage
 * - Lambda function for API handling
 * - API Gateway for HTTP endpoints
 * - IAM roles and policies
 * 
 * Usage:
 * - npm run synth: Generate CloudFormation template
 * - npm run deploy: Deploy to AWS
 * - npm run diff: Show changes before deployment
 */

import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { IssueTrackerStack } from "../lib/issue-tracker-stack";

// Initialize the CDK app
const app = new App();

// Create the main infrastructure stack
new IssueTrackerStack(app, "IssueTrackerStack", {
  /* 
   * Environment configuration
   * Uncomment and configure for specific AWS account/region
   * env: { 
   *   account: process.env.CDK_DEFAULT_ACCOUNT, 
   *   region: process.env.CDK_DEFAULT_REGION 
   * }
   */
});
