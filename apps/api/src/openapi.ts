export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Stack and Scale API",
    version: "0.0.0",
  },
  paths: {
    "/health": {
      get: {
        summary: "Liveness check",
        responses: {
          "200": {
            description: "API process is alive",
          },
        },
      },
    },
    "/ready": {
      get: {
        summary: "Runtime readiness check",
        responses: {
          "200": {
            description: "Application and database are ready",
          },
          "503": {
            description: "A required runtime dependency is not ready",
          },
        },
      },
    },
    "/version": {
      get: {
        summary: "API version",
        responses: {
          "200": {
            description: "API service and version",
          },
        },
      },
    },
    "/privacy-requests": {
      post: {
        summary: "Create a verified privacy request",
        responses: {
          "201": {
            description: "Privacy request accepted",
          },
          "400": {
            description: "Privacy request failed validation",
          },
        },
      },
    },
    "/leads": {
      post: {
        summary: "Create or replay a consented public lead",
        responses: {
          "201": { description: "Lead receipt returned" },
          "400": { description: "Lead validation failed" },
          "429": { description: "Lead rate limit exceeded" },
        },
      },
    },
    "/leads/demo-slots": {
      get: {
        summary: "List configured, currently available demo slots",
        responses: { "200": { description: "Available demo slots" } },
      },
    },
    "/leads/{leadId}/bookings": {
      post: {
        summary: "Confirm a demo slot or request an alternate time",
        responses: {
          "201": { description: "Booking recorded" },
          "400": { description: "Booking validation failed" },
          "409": { description: "Slot already booked" },
        },
      },
    },
    "/leads/{leadId}/whatsapp-handoffs": {
      post: {
        summary: "Record an attributed WhatsApp handoff",
        responses: { "204": { description: "Handoff recorded" } },
      },
    },
    "/api/v1/crm/leads": {
      get: {
        summary: "List CRM leads for authorized staff",
        responses: {
          "200": { description: "Lead inbox" },
          "401": { description: "Authentication required" },
          "403": { description: "CRM permission denied" },
        },
      },
    },
    "/api/v1/operations/release": {
      get: {
        summary:
          "Read-only release and environment visibility for authorized staff",
        responses: {
          "200": {
            description: "Sanitized release, health and rollback status",
          },
          "401": { description: "Authentication required" },
          "403": { description: "Audit visibility permission denied" },
        },
      },
    },
    "/api/v1/operations/capacity": {
      get: {
        summary: "Bounded runtime capacity snapshot for authorized staff",
        responses: {
          "200": {
            description: "CPU, memory, disk, connection and retention snapshot",
          },
          "401": { description: "Authentication required" },
          "403": { description: "Audit visibility permission denied" },
        },
      },
    },
    "/api/v1/crm/leads/{leadId}": {
      get: {
        summary: "Read a CRM lead timeline",
        responses: { "200": { description: "Lead detail" } },
      },
      patch: {
        summary: "Update CRM ownership or pipeline fields",
        responses: { "200": { description: "Lead updated" } },
      },
    },
    "/api/v1/crm/leads/{leadId}/notes": {
      post: {
        summary: "Add a staff note to a CRM lead",
        responses: { "201": { description: "Note created" } },
      },
    },
    "/api/v1/crm/leads/{leadId}/tasks": {
      post: {
        summary: "Create a CRM follow-up task",
        responses: { "201": { description: "Task created" } },
      },
    },
    "/api/v1/crm/leads/{leadId}/tasks/{taskId}/complete": {
      patch: {
        summary: "Complete a CRM follow-up task",
        responses: { "200": { description: "Task completed" } },
      },
    },
    "/api/v1/operations/knowledge": {
      get: { summary: "List authorized internal knowledge articles" },
      post: { summary: "Create an internal knowledge article" },
    },
    "/api/v1/operations/knowledge/{articleId}": {
      get: { summary: "Read an authorized knowledge article" },
      patch: { summary: "Update an internal knowledge article" },
      delete: { summary: "Delete an internal knowledge article" },
    },
    "/api/v1/operations/knowledge/suggestions": {
      get: {
        summary: "Return permission-filtered contextual knowledge suggestions",
      },
    },
    "/api/v1/operations/reports": {
      get: { summary: "Return a bounded synchronous JSON operational report" },
    },
    "/api/v1/operations/reports/exports": {
      post: { summary: "Queue an access-controlled CSV report export" },
    },
    "/api/v1/operations/reports/exports/{exportId}": {
      get: { summary: "Read or download an authorized report export" },
    },
  },
} as const;
