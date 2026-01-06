/**
 * Webhook support for external HTTP access to workflow events.
 * This allows workflows to wait for external webhooks and be resumed via HTTP.
 */
import type { Id } from "./_generated/dataModel.js";
/**
 * Create a webhook token that maps to a workflow event.
 * This is called when a workflow creates a webhook to wait for external input.
 */
export declare const create: import("convex/server").RegisteredMutation<"public", {
    token?: string | undefined;
    workflowId: import("convex/values").GenericId<"workflows">;
    eventName: string;
}, Promise<{
    token: string;
    webhookId: import("convex/values").GenericId<"webhooks">;
}>>;
/**
 * Look up a webhook by its token.
 */
export declare const getByToken: import("convex/server").RegisteredQuery<"public", {
    token: string;
}, Promise<{
    webhookId: import("convex/values").GenericId<"webhooks">;
    workflowId: import("convex/values").GenericId<"workflows">;
    eventName: string;
} | null>>;
/**
 * Resume a workflow via webhook token.
 * This is called from HTTP actions when an external webhook is received.
 */
export declare const resume: import("convex/server").RegisteredMutation<"public", {
    workpoolOptions?: {
        logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined;
        maxParallelism?: number | undefined;
        defaultRetryBehavior?: {
            maxAttempts: number;
            initialBackoffMs: number;
            base: number;
        } | undefined;
        retryActionsByDefault?: boolean | undefined;
    } | undefined;
    token: string;
    value: any;
}, Promise<{
    success: boolean;
    error: string;
    eventId?: undefined;
} | {
    success: boolean;
    eventId: Id<"events">;
    error?: undefined;
}>>;
/**
 * Delete a webhook after it's been used or is no longer needed.
 */
export declare const remove: import("convex/server").RegisteredMutation<"public", {
    token: string;
}, Promise<boolean>>;
/**
 * Clean up old webhooks for a workflow (e.g., when workflow completes).
 */
export declare const cleanupForWorkflow: import("convex/server").RegisteredMutation<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
}, Promise<number>>;
//# sourceMappingURL=webhook.d.ts.map