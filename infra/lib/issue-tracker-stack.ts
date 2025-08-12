import { Duration, RemovalPolicy, Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, CorsHttpMethod, CorsPreflightOptions, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

export class IssueTrackerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, "IssuesTable", {
      tableName: "Issues",
      partitionKey: { name: "issueId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const apiEntry = path.resolve(process.cwd(), "..", "services", "api", "src", "handler.ts");

    const apiHandler = new NodejsFunction(this, "ApiHandler", {
      runtime: Runtime.NODEJS_20_X,
      entry: apiEntry,
      handler: "handler",
      memorySize: 256,
      timeout: Duration.seconds(10),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"]
      },
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    table.grantReadWriteData(apiHandler);

    const cors: CorsPreflightOptions = {
      allowHeaders: ["*"],
      allowMethods: [
        CorsHttpMethod.GET,
        CorsHttpMethod.POST,
        CorsHttpMethod.PUT,
        CorsHttpMethod.DELETE,
        CorsHttpMethod.OPTIONS
      ],
      allowOrigins: ["*"]
    };

    const httpApi = new HttpApi(this, "HttpApi", { corsPreflight: cors });

    const integration = new HttpLambdaIntegration("ApiIntegration", apiHandler);

    httpApi.addRoutes({ path: "/issues", methods: [HttpMethod.GET, HttpMethod.POST], integration });
    httpApi.addRoutes({ path: "/issues/{id}", methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE], integration });

    new CfnOutput(this, "HttpApiUrl", { value: httpApi.apiEndpoint, exportName: "HttpApiUrl" });
  }
}
