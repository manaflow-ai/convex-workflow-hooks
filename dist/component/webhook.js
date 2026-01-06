/**
 * Webhook support for external HTTP access to workflow events.
 * This allows workflows to wait for external webhooks and be resumed via HTTP.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { sendEventInternal } from "./event.js";
import { workpoolOptions } from "./pool.js";
/**
 * Generate a random token for webhook URLs.
 * Uses a simple random string generator (not cryptographically secure,
 * but sufficient for URL tokens).
 */
function generateToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Create a webhook token that maps to a workflow event.
 * This is called when a workflow creates a webhook to wait for external input.
 */
export const create = mutation({
    args: {
        workflowId: v.id("workflows"),
        eventName: v.string(),
        token: v.optional(v.string()),
    },
    returns: v.object({
        token: v.string(),
        webhookId: v.id("webhooks"),
    }),
    handler: async (ctx, args) => {
        // Use provided token or generate a new one
        const token = args.token ?? generateToken();
        // Check if token already exists
        const existing = await ctx.db
            .query("webhooks")
            .withIndex("token", (q) => q.eq("token", token))
            .first();
        if (existing) {
            // If the token exists and maps to the same workflow/event, reuse it
            if (existing.workflowId === args.workflowId &&
                existing.eventName === args.eventName) {
                return { token, webhookId: existing._id };
            }
            throw new Error(`Webhook token already in use: ${token}`);
        }
        const webhookId = await ctx.db.insert("webhooks", {
            token,
            workflowId: args.workflowId,
            eventName: args.eventName,
            createdAt: Date.now(),
        });
        return { token, webhookId };
    },
});
/**
 * Look up a webhook by its token.
 */
export const getByToken = query({
    args: {
        token: v.string(),
    },
    returns: v.union(v.object({
        webhookId: v.id("webhooks"),
        workflowId: v.id("workflows"),
        eventName: v.string(),
    }), v.null()),
    handler: async (ctx, args) => {
        const webhook = await ctx.db
            .query("webhooks")
            .withIndex("token", (q) => q.eq("token", args.token))
            .first();
        if (!webhook) {
            return null;
        }
        return {
            webhookId: webhook._id,
            workflowId: webhook.workflowId,
            eventName: webhook.eventName,
        };
    },
});
/**
 * Resume a workflow via webhook token.
 * This is called from HTTP actions when an external webhook is received.
 */
export const resume = mutation({
    args: {
        token: v.string(),
        value: v.any(),
        workpoolOptions: v.optional(workpoolOptions),
    },
    returns: v.object({
        success: v.boolean(),
        eventId: v.optional(v.id("events")),
        error: v.optional(v.string()),
    }),
    handler: async (ctx, args) => {
        const webhook = await ctx.db
            .query("webhooks")
            .withIndex("token", (q) => q.eq("token", args.token))
            .first();
        if (!webhook) {
            return {
                success: false,
                error: `Webhook not found for token: ${args.token}`,
            };
        }
        try {
            // Send the event to resume the workflow
            const eventId = await sendEventInternal(ctx, {
                workflowId: webhook.workflowId,
                name: webhook.eventName,
                result: {
                    kind: "success",
                    returnValue: args.value,
                },
                workpoolOptions: args.workpoolOptions,
            });
            return { success: true, eventId };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
});
/**
 * Delete a webhook after it's been used or is no longer needed.
 */
export const remove = mutation({
    args: {
        token: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const webhook = await ctx.db
            .query("webhooks")
            .withIndex("token", (q) => q.eq("token", args.token))
            .first();
        if (!webhook) {
            return false;
        }
        await ctx.db.delete(webhook._id);
        return true;
    },
});
/**
 * Clean up old webhooks for a workflow (e.g., when workflow completes).
 */
export const cleanupForWorkflow = mutation({
    args: {
        workflowId: v.id("workflows"),
    },
    returns: v.number(),
    handler: async (ctx, args) => {
        const webhooks = await ctx.db
            .query("webhooks")
            .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
            .collect();
        for (const webhook of webhooks) {
            await ctx.db.delete(webhook._id);
        }
        return webhooks.length;
    },
});
//# sourceMappingURL=webhook.js.map