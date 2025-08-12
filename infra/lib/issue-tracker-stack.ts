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
 * - Lambda function for API handling
 * - API Gateway for HTTP endpoints
 * - IAM roles with least privilege access
 * - CloudWatch logging and X-Ray tracing
 * 
 * Security features:
 * - Least privilege IAM policies
 * - CORS configuration for web access
 * - DynamoDB encryption at rest
 * - Lambda execution role isolation
 */

import { Duration, RemovalPolicy, Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, CorsHttpMethod, CorsPreflightOptions, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

/**
 * Main infrastructure stack for the issue tracker application
 */
export class IssueTrackerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for issue storage
    // Uses pay-per-request billing for cost optimization
    const table = new Table(this, "IssuesTable", {
      tableName: "Issues",
      partitionKey: { name: "issueId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST, // Cost-effective for variable workloads
      removalPolicy: RemovalPolicy.RETAIN, // Prevent accidental deletion
    });

    // Resolve path to the Lambda handler source code
    const apiEntry = path.resolve(process.cwd(), "..", "services", "api", "src", "handler.ts");

    // Create Lambda function for API handling
    // Bundles TypeScript code and optimizes for production
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
        TABLE_NAME: table.tableName, // Pass table name to Lambda
      },
    });

    // Grant Lambda function read/write access to DynamoDB table
    table.grantReadWriteData(apiHandler);

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

    // Create Lambda integration for API Gateway
    const integration = new HttpLambdaIntegration("ApiIntegration", apiHandler);

    // Define API routes
    // GET /issues - List all issues
    // POST /issues - Create new issue
    httpApi.addRoutes({ 
      path: "/issues", 
      methods: [HttpMethod.GET, HttpMethod.POST], 
      integration 
    });

    // GET /issues/{id} - Get specific issue
    // PUT /issues/{id} - Update issue
    // DELETE /issues/{id} - Delete issue
    httpApi.addRoutes({ 
      path: "/issues/{id}", 
      methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE], 
      integration 
    });

    // Output the API endpoint URL for easy access
    new CfnOutput(this, "HttpApiUrl", { 
      value: httpApi.apiEndpoint, 
      exportName: "HttpApiUrl",
      description: "HTTP API Gateway endpoint URL"
    });
  }
}
