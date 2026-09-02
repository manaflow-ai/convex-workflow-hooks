/// <reference types="vite/client" />

import { describe, expect, test } from "vitest";
import { api } from "./_generated/api.js";
import { initConvexTest } from "./setup.test.js";

const secureToken = "wh_0123456789abcdefABCDEFghijklmnop";

async function createWorkflow() {
  const t = initConvexTest();
  const workflowId = await t.run((ctx) =>
    ctx.db.insert("workflows", {
      name: "webhook-storage-test",
      workflowHandle: "function://internal.example.exampleWorkflow",
      args: {},
      generationNumber: 0,
    }),
  );
  return { t, workflowId };
}

describe("webhook token storage", () => {
  test("stores new bearer tokens only as one-way digests", async () => {
    const { t, workflowId } = await createWorkflow();
    const webhook = await t.mutation(api.webhook.create, {
      workflowId,
      eventName: "approval",
      token: secureToken,
    });

    const stored = await t.run((ctx) =>
      ctx.db
        .query("webhooks")
        .filter((q) => q.eq(q.field("_id"), webhook.webhookId))
        .unique(),
    );
    expect(stored?.token).toBeUndefined();
    expect(stored?.tokenHash).toMatch(/^[0-9a-f]{64}$/u);
    expect(stored?.tokenHash).not.toContain(secureToken);

    await expect(
      t.query(api.webhook.getByToken, { token: secureToken }),
    ).resolves.toMatchObject({ workflowId, eventName: "approval" });
  });

  test("upgrades a legacy plaintext row after successful use", async () => {
    const { t, workflowId } = await createWorkflow();
    const legacyToken = "chat:legacy-123";
    await t.mutation(api.event.create, {
      workflowId,
      name: "approval",
    });
    const webhookId = await t.run((ctx) =>
      ctx.db.insert("webhooks", {
        token: legacyToken,
        workflowId,
        eventName: "approval",
        createdAt: Date.now(),
      }),
    );

    await expect(
      t.mutation(api.webhook.resume, {
        token: legacyToken,
        value: { approved: true },
      }),
    ).resolves.toMatchObject({ success: true });

    const upgraded = await t.run((ctx) =>
      ctx.db
        .query("webhooks")
        .filter((q) => q.eq(q.field("_id"), webhookId))
        .unique(),
    );
    expect(upgraded?.token).toBeUndefined();
    expect(upgraded?.tokenHash).toMatch(/^[0-9a-f]{64}$/u);
  });

  test("does not reuse an expired token reservation", async () => {
    const { t, workflowId } = await createWorkflow();
    const expiredId = await t.run((ctx) =>
      ctx.db.insert("webhooks", {
        token: secureToken,
        workflowId,
        eventName: "approval",
        createdAt: Date.now() - 2,
        expiresAt: 1,
      }),
    );

    const replacement = await t.mutation(api.webhook.create, {
      workflowId,
      eventName: "approval",
      token: secureToken,
    });
    expect(replacement.webhookId).not.toBe(expiredId);
    await expect(
      t.query(api.webhook.getByToken, { token: secureToken }),
    ).resolves.toMatchObject({ webhookId: replacement.webhookId });
  });
});
