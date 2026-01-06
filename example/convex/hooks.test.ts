/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, components } from "./_generated/api";
import { initConvexTest } from "./setup.test";

describe("hooks", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("webhook token creation", async () => {
    const t = initConvexTest();

    // Create a workflow first (async start, no actual execution)
    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    // Create a webhook for this workflow
    const webhook = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
    });

    expect(webhook.token).toBeDefined();
    expect(webhook.token.length).toBeGreaterThan(10);
    expect(webhook.webhookId).toBeDefined();
  });

  test("webhook token lookup", async () => {
    const t = initConvexTest();

    // Create workflow
    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    // Create webhook
    const webhook = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
    });

    // Look up by token
    const found = await t.query(components.workflow.webhook.getByToken, {
      token: webhook.token,
    });

    expect(found).not.toBeNull();
    expect(found?.workflowId).toBe(workflowId);
    expect(found?.eventName).toBe("approval");
  });

  test("webhook with custom token", async () => {
    const t = initConvexTest();

    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.chatWorkflow",
      workflowArgs: { channelId: "test-123" },
      startAsync: true,
    });

    // Create webhook with custom token
    const customToken = "chat:test-123";
    const webhook = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "messages",
      token: customToken,
    });

    expect(webhook.token).toBe(customToken);
  });

  test("webhook token reuse for same workflow/event", async () => {
    const t = initConvexTest();

    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    const customToken = "my-token-123";

    // Create first webhook
    const webhook1 = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
      token: customToken,
    });

    // Create second webhook with same token for same workflow/event
    const webhook2 = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
      token: customToken,
    });

    // Should reuse the same webhook
    expect(webhook1.webhookId).toBe(webhook2.webhookId);
    expect(webhook1.token).toBe(webhook2.token);
  });

  test("webhook token conflict for different workflow", async () => {
    const t = initConvexTest();

    const workflowId1 = await t.mutation(components.workflow.workflow.create, {
      workflowName: "workflow-1",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test1" },
      startAsync: true,
    });

    const workflowId2 = await t.mutation(components.workflow.workflow.create, {
      workflowName: "workflow-2",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test2" },
      startAsync: true,
    });

    const customToken = "shared-token";

    // Create webhook for first workflow
    await t.mutation(components.workflow.webhook.create, {
      workflowId: workflowId1,
      eventName: "approval",
      token: customToken,
    });

    // Try to create webhook with same token for different workflow - should fail
    await expect(
      t.mutation(components.workflow.webhook.create, {
        workflowId: workflowId2,
        eventName: "approval",
        token: customToken,
      })
    ).rejects.toThrow("Webhook token already in use");
  });

  test("webhook removal", async () => {
    const t = initConvexTest();

    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    const webhook = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
    });

    // Remove webhook
    const removed = await t.mutation(components.workflow.webhook.remove, {
      token: webhook.token,
    });
    expect(removed).toBe(true);

    // Lookup should return null
    const found = await t.query(components.workflow.webhook.getByToken, {
      token: webhook.token,
    });
    expect(found).toBeNull();
  });

  test("webhook resume sends event to workflow", async () => {
    const t = initConvexTest();

    // Create workflow that will wait for an event
    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    // Create an event for the workflow to wait on
    const eventId = await t.mutation(components.workflow.event.create, {
      name: "approval",
      workflowId,
    });

    // Create webhook
    const webhook = await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "approval",
    });

    // Resume the webhook with a value
    const result = await t.mutation(components.workflow.webhook.resume, {
      token: webhook.token,
      value: { decision: "approved", notes: "Looks good!" },
    });

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });

  test("webhook resume with invalid token fails gracefully", async () => {
    const t = initConvexTest();

    const result = await t.mutation(components.workflow.webhook.resume, {
      token: "nonexistent-token",
      value: { decision: "approved" },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Webhook not found");
  });

  test("cleanup webhooks for workflow", async () => {
    const t = initConvexTest();

    const workflowId = await t.mutation(components.workflow.workflow.create, {
      workflowName: "test-workflow",
      workflowHandle: "function://internal.webhookExample.approvalWorkflow",
      workflowArgs: { topic: "test" },
      startAsync: true,
    });

    // Create multiple webhooks
    await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "event1",
    });
    await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "event2",
    });
    await t.mutation(components.workflow.webhook.create, {
      workflowId,
      eventName: "event3",
    });

    // Cleanup all webhooks
    const cleanedCount = await t.mutation(
      components.workflow.webhook.cleanupForWorkflow,
      { workflowId }
    );

    expect(cleanedCount).toBe(3);
  });
});

describe("defineHook", () => {
  test("resume validates and passes through payload", async () => {
    // This is a pure TypeScript test - no Convex needed
    const { defineHook } = await import("@convex-dev/workflow");

    const approvalHook = defineHook<{
      decision: "approved" | "rejected";
      notes?: string;
    }>();

    const { token, payload, validated } = approvalHook.resume("test-token", {
      decision: "approved",
      notes: "Looks good!",
    });

    expect(token).toBe("test-token");
    expect(payload).toEqual({ decision: "approved", notes: "Looks good!" });
    // Without schema, validated is false
    expect(validated).toBe(false);
  });

  test("resume with standard schema validation", async () => {
    const { defineHook } = await import("@convex-dev/workflow");
    const { z } = await import("zod");

    const approvalHook = defineHook({
      schema: z.object({
        decision: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      }),
    });

    const { token, payload, validated } = approvalHook.resume("test-token", {
      decision: "approved",
    });

    expect(token).toBe("test-token");
    expect(payload).toEqual({ decision: "approved" });
    expect(validated).toBe(true);
  });

  test("resume with invalid payload throws", async () => {
    const { defineHook } = await import("@convex-dev/workflow");
    const { z } = await import("zod");

    const approvalHook = defineHook({
      schema: z.object({
        decision: z.enum(["approved", "rejected"]),
      }),
    });

    expect(() =>
      approvalHook.resume("test-token", {
        decision: "invalid" as any,
      })
    ).toThrow("validation failed");
  });
});
