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
    "/leads/{leadId}/bookings": {
      post: { summary: "Confirm a demo slot or request an alternate time", responses: { "201": { description: "Booking recorded" }, "400": { description: "Booking validation failed" }, "409": { description: "Slot already booked" } } },
    },
    "/leads/{leadId}/whatsapp-handoffs": {
      post: { summary: "Record an attributed WhatsApp handoff", responses: { "204": { description: "Handoff recorded" } } },
    },
  },
} as const;
