import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: OpenAPI spec
 *     tags:
 *       - Meta
 */
export function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Spark-Hire AROE API",
      version: "1.0.0",
      description:
        "Automated Recruitment Orchestration Engine — submit candidates, trigger evaluations, and manage the priority queue.",
    },
    tags: [
      { name: "Candidates", description: "Candidate ingestion and listing" },
      { name: "Recruiter", description: "Protected recruiter dashboard endpoints" },
      { name: "Meta", description: "API meta endpoints" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authjs.session-token",
        },
      },
    },
    paths: {
      "/api/candidates": {
        post: {
          summary: "Submit a new candidate application",
          description:
            "Accepts a multipart form with name, email, and resume PDF. Creates a candidate record and triggers the evaluation pipeline asynchronously.",
          tags: ["Candidates"],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "email", "resume"],
                  properties: {
                    name: { type: "string", example: "Jane Doe" },
                    email: {
                      type: "string",
                      format: "email",
                      example: "jane@example.com",
                    },
                    resume: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Candidate created — pipeline started",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                      status: { type: "string", enum: ["APPLIED"] },
                    },
                  },
                },
              },
            },
            "400": { description: "Validation error or missing PDF" },
            "409": { description: "Email already registered" },
            "500": { description: "Internal server error" },
          },
        },
        get: {
          summary: "List all candidates (debug)",
          tags: ["Candidates"],
          responses: {
            "200": {
              description: "Array of all candidates",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        status: {
                          type: "string",
                          enum: [
                            "APPLIED",
                            "PENDING_Q1",
                            "PENDING_Q2",
                            "SCORED",
                            "PRIORITY_QUEUE",
                            "REJECTED",
                            "HUMAN_REVIEWED",
                          ],
                        },
                        scoreQ1: { type: "number", nullable: true },
                        scoreQ2: { type: "number", nullable: true },
                        scoreTotal: { type: "number", nullable: true },
                        appliedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/recruiter/queue": {
        get: {
          summary: "Get the priority candidate queue",
          description:
            "Returns candidates with PRIORITY_QUEUE status. Sorted by score (desc) then by application date (asc). Requires authentication.",
          tags: ["Recruiter"],
          security: [{ cookieAuth: [] }],
          responses: {
            "200": {
              description: "Priority queue candidates",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        scoreQ1: { type: "number" },
                        scoreQ2: { type: "number" },
                        scoreTotal: { type: "number" },
                        resumePath: { type: "string" },
                        appliedAt: { type: "string", format: "date-time" },
                        status: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/recruiter/review/{id}": {
        patch: {
          summary: "Finalise a hire or reject decision",
          description:
            "Records a recruiter's final decision on a priority-queue candidate. Requires authentication.",
          tags: ["Recruiter"],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
              description: "Candidate ID",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["decision"],
                  properties: {
                    decision: { type: "string", enum: ["HIRE", "REJECT"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Decision recorded",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      status: { type: "string" },
                      decision: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Candidate not found" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
