/**
 * HTTP router for the Convex app.
 * This exposes webhook endpoints for workflow resumption.
 */

import { httpRouter } from "convex/server";
import { workflow } from "./webhookExample";

const http = httpRouter();

// Register webhook routes for workflow resumption
// This creates endpoints at /.well-known/workflow/webhook/{token}
workflow.registerWebhookRoutes(http);

export default http;
