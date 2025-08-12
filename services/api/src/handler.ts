import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;
  const rawPath = event.rawPath;

  if (rawPath === "/issues" && method === "GET") {
    return { statusCode: 200, body: JSON.stringify({ items: [], nextToken: null }) };
  }

  if (rawPath === "/issues" && method === "POST") {
    return { statusCode: 201, body: JSON.stringify({ issueId: "demo", status: "OPEN" }) };
  }

  if (rawPath?.startsWith("/issues/") && method === "GET") {
    const id = rawPath.split("/").pop();
    return { statusCode: 200, body: JSON.stringify({ issueId: id, status: "OPEN" }) };
  }

  if (rawPath?.startsWith("/issues/") && method === "PUT") {
    const id = rawPath.split("/").pop();
    return { statusCode: 200, body: JSON.stringify({ issueId: id, status: "UPDATED" }) };
  }

  if (rawPath?.startsWith("/issues/") && method === "DELETE") {
    return { statusCode: 204, body: "" };
  }

  return { statusCode: 404, body: JSON.stringify({ message: "Not Found" }) };
}
