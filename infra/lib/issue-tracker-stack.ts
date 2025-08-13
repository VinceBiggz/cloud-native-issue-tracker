/**
 * @author Vincent Wachira
 * @version v1.0.0
 * @date 12-Aug-2025
 * @description CDK Stack - Issue Tracker Infrastructure
 * 
 * This stack defines the complete infrastructure for the cloud-native issue tracker.
 * It creates all necessary AWS resources including database, compute, and API layers.
 * 
 * Resources created:
 * - DynamoDB table for issue storage
 * - DynamoDB table for user management
 * - DynamoDB table for user sessions
 * - Lambda function for API handling
 * - Lambda function for authentication
 * - API Gateway for HTTP endpoints
 * - IAM roles with least privilege access
 * - CloudWatch logging and X-Ray tracing
 * 
 * Security features:
 * - Least privilege IAM policies
 * - CORS configuration for web access
 * - DynamoDB encryption at rest
 * - Lambda execution role isolation
 * - JWT secret management
 */

import { Duration, RemovalPolicy, Stack, StackProps, CfnOutput, SecretValue } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, CorsHttpMethod, CorsPreflightOptions, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import * as path from "path";

/**
 * Main infrastructure stack for the issue tracker application
 */
export class IssueTrackerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create JWT secret in Secrets Manager
    const jwtSecret = new Secret(this, "JWTSecret", {
      secretName: "issue-tracker/jwt-secret",
      description: "JWT secret for issue tracker authentication",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ purpose: "jwt-signing" }),
        generateStringKey: "secret",
        passwordLength: 32,
        excludeCharacters: '"@/\\',
      },
    });

    // Create DynamoDB table for issues
    const issuesTable = new Table(this, "IssuesTable", {
      tableName: "Issues",
      partitionKey: { name: "issueId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST, // Cost-effective for variable workloads
      removalPolicy: RemovalPolicy.RETAIN, // Prevent accidental deletion
    });

    // Create DynamoDB table for users
    const usersTable = new Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Add GSI for email lookup
    usersTable.addGlobalSecondaryIndex({
      indexName: "EmailIndex",
      partitionKey: { name: "email", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // Create DynamoDB table for user sessions
    const sessionsTable = new Table(this, "SessionsTable", {
      tableName: "UserSessions",
      partitionKey: { name: "sessionId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      timeToLiveAttribute: "expiresAt", // Auto-delete expired sessions
    });

    // Add GSI for user sessions lookup
    sessionsTable.addGlobalSecondaryIndex({
      indexName: "UserIdIndex",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "expiresAt", type: AttributeType.NUMBER },
      projectionType: ProjectionType.ALL,
    });

    // Resolve paths to Lambda handlers
    const apiEntry = path.resolve(process.cwd(), "..", "services", "api", "src", "handler.ts");
    const authEntry = path.resolve(process.cwd(), "..", "services", "auth", "src", "handler.ts");

    // Create Lambda function for API handling
    const apiHandler = new NodejsFunction(this, "ApiHandler", {
      runtime: Runtime.NODEJS_20_X, // Latest LTS version
      entry: apiEntry,
      handler: "handler",
      memorySize: 256, // MB - suitable for API handling
      timeout: Duration.seconds(10), // 10 second timeout
      tracing: Tracing.ACTIVE, // Enable X-Ray tracing for monitoring
      bundling: {
        minify: true, // Reduce bundle size
        sourceMap: true, // Enable debugging
        target: "es2020", // Modern JavaScript target
        externalModules: ["aws-sdk"], // Use AWS SDK from runtime
      },
      environment: {
        TABLE_NAME: issuesTable.tableName,
        USERS_TABLE: usersTable.tableName,
        SESSIONS_TABLE: sessionsTable.tableName,
        JWT_SECRET_ARN: jwtSecret.secretArn,
      },
    });

    // Create Lambda function for authentication
    const authHandler = new NodejsFunction(this, "AuthHandler", {
      runtime: Runtime.NODEJS_20_X,
      entry: authEntry,
      handler: "handler",
      memorySize: 256,
      timeout: Duration.seconds(10),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
      environment: {
        USERS_TABLE: usersTable.tableName,
        SESSIONS_TABLE: sessionsTable.tableName,
        JWT_SECRET_ARN: jwtSecret.secretArn,
      },
    });

    // Grant permissions to API handler
    issuesTable.grantReadWriteData(apiHandler);
    usersTable.grantReadData(apiHandler);
    sessionsTable.grantReadData(apiHandler);

    // Grant permissions to Auth handler
    usersTable.grantReadWriteData(authHandler);
    sessionsTable.grantReadWriteData(authHandler);
    jwtSecret.grantRead(authHandler);

    // Configure CORS for web application access
    const cors: CorsPreflightOptions = {
      allowHeaders: ["*"], // Allow all headers
      allowMethods: [
        CorsHttpMethod.GET,
        CorsHttpMethod.POST,
        CorsHttpMethod.PUT,
        CorsHttpMethod.DELETE,
        CorsHttpMethod.OPTIONS,
      ],
      allowOrigins: ["*"], // Allow all origins (configure for production)
    };

    // Create HTTP API Gateway
    const httpApi = new HttpApi(this, "HttpApi", { corsPreflight: cors });

    // Create Lambda integrations
    const apiIntegration = new HttpLambdaIntegration("ApiIntegration", apiHandler);
    const authIntegration = new HttpLambdaIntegration("AuthIntegration", authHandler);

    // Define API routes for issues
    // GET /issues - List all issues
    // POST /issues - Create new issue
    httpApi.addRoutes({ 
      path: "/issues", 
      methods: [HttpMethod.GET, HttpMethod.POST], 
      integration: apiIntegration 
    });

    // GET /issues/{id} - Get specific issue
    // PUT /issues/{id} - Update issue
    // DELETE /issues/{id} - Delete issue
    httpApi.addRoutes({ 
      path: "/issues/{id}", 
      methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE], 
      integration: apiIntegration 
    });

    // Define API routes for authentication
    // POST /auth/register - User registration
    // POST /auth/login - User login
    // POST /auth/refresh - Refresh JWT token
    // GET /auth/me - Get current user info
    // POST /auth/logout - User logout
    httpApi.addRoutes({
      path: "/auth/register",
      methods: [HttpMethod.POST],
      integration: authIntegration,
    });

    httpApi.addRoutes({
      path: "/auth/login",
      methods: [HttpMethod.POST],
      integration: authIntegration,
    });

    httpApi.addRoutes({
      path: "/auth/refresh",
      methods: [HttpMethod.POST],
      integration: authIntegration,
    });

    httpApi.addRoutes({
      path: "/auth/me",
      methods: [HttpMethod.GET],
      integration: authIntegration,
    });

    httpApi.addRoutes({
      path: "/auth/logout",
      methods: [HttpMethod.POST],
      integration: authIntegration,
    });

    // Output the API endpoint URL for easy access
    new CfnOutput(this, "HttpApiUrl", { 
      value: httpApi.apiEndpoint, 
      exportName: "HttpApiUrl",
      description: "HTTP API Gateway endpoint URL"
    });

    // Output the JWT secret ARN
    new CfnOutput(this, "JWTSecretArn", {
      value: jwtSecret.secretArn,
      exportName: "JWTSecretArn",
      description: "JWT Secret ARN in Secrets Manager",
    });

    // Output table names
    new CfnOutput(this, "IssuesTableName", {
      value: issuesTable.tableName,
      exportName: "IssuesTableName",
      description: "DynamoDB table name for issues",
    });

    new CfnOutput(this, "UsersTableName", {
      value: usersTable.tableName,
      exportName: "UsersTableName",
      description: "DynamoDB table name for users",
    });

    new CfnOutput(this, "SessionsTableName", {
      value: sessionsTable.tableName,
      exportName: "SessionsTableName",
      description: "DynamoDB table name for user sessions",
    });
  }
}
