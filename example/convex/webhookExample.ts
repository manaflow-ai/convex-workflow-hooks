/**
 * Example workflow demonstrating hooks and webhooks.
 *
 * Architecture (matching Vercel workflow):
 * - defineHook<T>() - Type-safe hook definition with optional schema validation
 * - ctx.createHook() - Creates a Hook inside a workflow
 * - Hook<T> - Thenable + AsyncIterable object
 * - Webhook extends Hook with URL for HTTP access
 */

import {
  WorkflowManager,
  vWorkflowId,
  defineHook,
  type WorkflowId,
} from "@convex-dev/workflow";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";

export const workflow = new WorkflowManager(components.workflow);

// =============================================================================
// Define typed hooks with validation
// =============================================================================

/**
 * Type-safe approval hook.
 * The schema ensures type safety and can include validation/transformation.
 */
export const approvalValidator = v.object({
  decision: v.union(v.literal("approved"), v.literal("rejected")),
  notes: v.optional(v.string()),
});
export const approvalHook = defineHook<{
  decision: "approved" | "rejected";
  notes?: string;
}>({
  validator: approvalValidator,
});

/**
 * Type-safe message hook for iterating over multiple messages.
 */
export const messageValidator = v.object({
  type: v.union(v.literal("message"), v.literal("done")),
  content: v.optional(v.string()),
});
export const messageHook = defineHook<{
  type: "message" | "done";
  content?: string;
}>({
  validator: messageValidator,
});

// =============================================================================
// Workflows
// =============================================================================

/**
 * Simple approval workflow using defineHook pattern.
 */
export const approvalWorkflow = workflow.define({
  args: { topic: v.string() },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    console.log("Starting approval workflow for topic:", args.topic);

    // Step 1: Generate a draft
    const draft = await ctx.runAction(internal.webhookExample.generateDraft, {
      topic: args.topic,
    });
    console.log("Draft generated:", draft);

    // Step 2: Create a hook and wait for approval
    // Using createHook with defineHook for type safety
    const hook = ctx.createHook(approvalHook, { name: "approval" });
    console.log("Waiting for approval webhook");

    // Wait for the approval event
    const approval = await hook;
    console.log("Received approval decision:", approval);

    // Step 3: Process based on approval
    if (approval.decision === "approved") {
      await ctx.runMutation(internal.webhookExample.publishDraft, {
        draft,
        topic: args.topic,
      });
      return `Published: ${draft}`;
    } else {
      return `Rejected: ${approval.notes ?? "No reason given"}`;
    }
  },
});

/**
 * Multi-message workflow demonstrating async iteration over hooks.
 */
export const chatWorkflow = workflow.define({
  args: { channelId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args): Promise<string[]> => {
    console.log("Starting chat workflow for channel:", args.channelId);

    const messages: string[] = [];

    // Create a hook for receiving messages
    const hook = ctx.createHook(messageHook, { name: "messages" });

    console.log("Listening for message webhooks");

    // Iterate over incoming messages using async iterator
    for await (const msg of hook) {
      console.log("Received message:", msg);

      if (msg.type === "done") {
        console.log("Chat ended");
        break;
      }

      if (msg.content) {
        messages.push(msg.content);
      }
    }

    return messages;
  },
});

// =============================================================================
// Public API
// =============================================================================

/**
 * Start an approval workflow and create a webhook for it.
 */
export const startApprovalWorkflow = mutation({
  args: { topic: v.string() },
  returns: v.object({
    workflowId: vWorkflowId,
    webhookUrl: v.string(),
    token: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    workflowId: WorkflowId;
    webhookUrl: string;
    token: string;
  }> => {
    // Start the workflow
    const workflowId = await workflow.start(
      ctx,
      internal.webhookExample.approvalWorkflow,
      { topic: args.topic },
    );

    // Create a webhook for external approval
    const { token, url } = await workflow.createWebhook(ctx, {
      workflowId,
      eventName: "approval",
      baseUrl: process.env.CONVEX_SITE_URL,
    });

    console.log("Workflow started:", workflowId);

    return {
      workflowId,
      webhookUrl: url,
      token,
    };
  },
});

/**
 * Start a chat workflow with a custom token.
 */
export const startChatWorkflow = mutation({
  args: { channelId: v.string() },
  returns: v.object({
    workflowId: vWorkflowId,
    webhookUrl: v.string(),
    token: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    workflowId: WorkflowId;
    webhookUrl: string;
    token: string;
  }> => {
    const workflowId = await workflow.start(
      ctx,
      internal.webhookExample.chatWorkflow,
      { channelId: args.channelId },
    );

    const { token, url } = await workflow.createWebhook(ctx, {
      workflowId,
      eventName: "messages",
      baseUrl: process.env.CONVEX_SITE_URL,
    });

    return {
      workflowId,
      webhookUrl: url,
      token,
    };
  },
});

/**
 * Get workflow status.
 */
export const getWorkflowStatus = query({
  args: { workflowId: vWorkflowId },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await workflow.status(ctx, args.workflowId);
  },
});

/**
 * Resume a hook using the typed approvalHook.
 * This demonstrates type-safe resumption.
 */
export const approveWithHook = mutation({
  args: {
    token: v.string(),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use the typed hook's resume method for validation
    const { token, payload } = approvalHook.resume(args.token, {
      decision: args.decision,
      notes: args.notes,
    });

    // Resume the hook with validated payload
    return await workflow.resumeHook(ctx, token, payload);
  },
});

/**
 * Send a message to a chat workflow.
 */
export const sendMessage = mutation({
  args: {
    token: v.string(),
    type: v.union(v.literal("message"), v.literal("done")),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, payload } = messageHook.resume(args.token, {
      type: args.type,
      content: args.content,
    });

    return await workflow.resumeHook(ctx, token, payload);
  },
});

/**
 * Legacy: Manual approve using workflow.sendEvent (still works).
 */
export const manualApprove = mutation({
  args: {
    workflowId: vWorkflowId,
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await workflow.sendEvent(ctx, {
      workflowId: args.workflowId,
      name: "approval",
      value: {
        decision: args.decision,
        notes: args.notes,
      },
    });
  },
});

// =============================================================================
// Helper functions
// =============================================================================

export const generateDraft = internalAction({
  args: { topic: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return `Draft about "${args.topic}": This is an AI-generated draft that needs human approval.`;
  },
});

export const publishDraft = internalMutation({
  args: { draft: v.string(), topic: v.string() },
  handler: async (ctx, args) => {
    console.log("Publishing draft:", args.draft);
  },
});
