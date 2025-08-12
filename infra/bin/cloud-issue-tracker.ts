import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { IssueTrackerStack } from "../lib/issue-tracker-stack";

const app = new App();
new IssueTrackerStack(app, "IssueTrackerStack", {
  /* env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION } */
});
