/**
 * Webhook support for external HTTP access to workflow events.
 * This allows workflows to wait for external webhooks and be resumed via HTTP.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import type { DataModel, Doc, Id } from "./_generated/dataModel.js";
import { sendEventInternal } from "./event.js";
import { workpoolOptions } from "./pool.js";
import {
  assertValidWebhookToken,
  generateWebhookToken,
  MAX_LEGACY_WEBHOOK_TOKEN_LENGTH,
  MAX_WEBHOOK_USES,
  hashWebhookToken,
} from "../client/webhookSecurity.js";
import type {
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";

const MAX_VALIDATOR_KEY_LENGTH = 128;
type WebhookRecord = Doc<"webhooks">;

function validateLifecycleOptions(args: {
  validatorKey?: string;
  expiresAt?: number;
  maxUses?: number;
}) {
  validateValidatorKey(args.validatorKey);
  validateExpiry(args.expiresAt);
  validateMaxUses(args.maxUses);
}

function validateValidatorKey(value: string | undefined): void {
  if (
    value === undefined ||
    (value.length > 0 && value.length <= MAX_VALIDATOR_KEY_LENGTH)
  ) {
    return;
  }
  throw new Error(
    `Webhook validatorKey must be between 1 and ${MAX_VALIDATOR_KEY_LENGTH} characters`,
  );
}

function validateExpiry(value: number | undefined): void {
  if (value === undefined || (Number.isFinite(value) && value > Date.now())) {
    return;
  }
  throw new Error("Webhook expiresAt must be a future timestamp");
}

function validateMaxUses(value: number | undefined): void {
  if (
    value === undefined ||
    (Number.isSafeInteger(value) && value >= 1 && value <= MAX_WEBHOOK_USES)
  ) {
    return;
  }
  throw new Error(
    `Webhook maxUses must be an integer between 1 and ${MAX_WEBHOOK_USES}`,
  );
}

type WebhookCreateArgs = {
  workflowId: Id<"workflows">;
  eventName: string;
  token?: string;
  validatorKey?: string;
  expiresAt?: number;
  maxUses?: number;
};

async function removeExpiredReservation(
  db: GenericDatabaseWriter<DataModel>,
  webhook: WebhookRecord | null,
): Promise<WebhookRecord | null> {
  if (!webhook) return null;
  if (isWebhookExpiryActive(webhook.expiresAt, Date.now())) {
    return webhook;
  }
  await db.delete(webhook._id);
  return null;
}

function isWebhookExpiryActive(
  expiresAt: number | undefined,
  now: number,
): boolean {
  return (
    expiresAt === undefined || (Number.isFinite(expiresAt) && expiresAt > now)
  );
}

async function reuseExistingWebhook(
  db: GenericDatabaseWriter<DataModel>,
  existing: WebhookRecord,
  args: WebhookCreateArgs,
  token: string,
  tokenHash: string,
  validatorKey: string,
): Promise<{ token: string; webhookId: Id<"webhooks"> }> {
  if (!isSameWebhook(existing, args, validatorKey)) {
    throw new Error("Webhook token already in use");
  }
  await upgradeTokenStorage(db, existing, tokenHash);
  return { token, webhookId: existing._id };
}

function isSameWebhook(
  existing: WebhookRecord,
  args: WebhookCreateArgs,
  validatorKey: string,
): boolean {
  return (
    existing.workflowId === args.workflowId &&
    existing.eventName === args.eventName &&
    (existing.validatorKey ?? existing.eventName) === validatorKey &&
    existing.expiresAt === args.expiresAt &&
    existing.maxUses === args.maxUses
  );
}

async function insertWebhook(
  db: GenericDatabaseWriter<DataModel>,
  args: WebhookCreateArgs,
  tokenHash: string,
  validatorKey: string,
): Promise<Id<"webhooks">> {
  return db.insert("webhooks", {
    tokenHash,
    workflowId: args.workflowId,
    eventName: args.eventName,
    createdAt: Date.now(),
    validatorKey,
    expiresAt: args.expiresAt,
    maxUses: args.maxUses,
    useCount: args.maxUses === undefined ? undefined : 0,
  });
}

/**
 * Look up a token by its digest. The plaintext index is checked only for
 * legacy rows created before token hashing was introduced.
 */
async function findWebhook(
  db: GenericDatabaseReader<DataModel>,
  token: string,
  knownHash?: string,
): Promise<{ webhook: WebhookRecord | null; tokenHash: string }> {
  if (token.length > MAX_LEGACY_WEBHOOK_TOKEN_LENGTH) {
    return { webhook: null, tokenHash: "" };
  }
  const tokenHash = knownHash ?? (await hashWebhookToken(token));
  const hashed = await db
    .query("webhooks")
    .withIndex("tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .first();
  if (hashed) return { webhook: hashed, tokenHash };

  const legacy = await db
    .query("webhooks")
    .withIndex("token", (q) => q.eq("token", token))
    .first();
  return { webhook: legacy, tokenHash };
}

/** Remove the legacy plaintext value after a successful lookup. */
async function upgradeTokenStorage(
  db: GenericDatabaseWriter<DataModel>,
  webhook: WebhookRecord,
  tokenHash: string,
): Promise<void> {
  if (webhook.token !== undefined) {
    await db.patch(webhook._id, { token: undefined, tokenHash });
  }
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
    validatorKey: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    maxUses: v.optional(v.number()),
  },
  returns: v.object({
    token: v.string(),
    webhookId: v.id("webhooks"),
  }),
  handler: async (ctx, args) => {
    const token = args.token ?? generateWebhookToken();
    assertValidWebhookToken(token);
    validateLifecycleOptions(args);
    const validatorKey = args.validatorKey ?? args.eventName;
    const tokenHash = await hashWebhookToken(token);

    // Check if token already exists
    let existing = (await findWebhook(ctx.db, token, tokenHash)).webhook;

    // Remove an expired reservation before deciding whether to reuse it.
    existing = await removeExpiredReservation(ctx.db, existing);

    if (existing) {
      return reuseExistingWebhook(
        ctx.db,
        existing,
        args,
        token,
        tokenHash,
        validatorKey,
      );
    }

    const webhookId = await insertWebhook(
      ctx.db,
      args,
      tokenHash,
      validatorKey,
    );
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
  returns: v.union(
    v.object({
      webhookId: v.id("webhooks"),
      workflowId: v.id("workflows"),
      eventName: v.string(),
      validatorKey: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      maxUses: v.optional(v.number()),
      useCount: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const { webhook } = await findWebhook(ctx.db, args.token);

    if (!webhook) {
      return null;
    }

    return {
      webhookId: webhook._id,
      workflowId: webhook.workflowId,
      eventName: webhook.eventName,
      validatorKey: webhook.validatorKey,
      expiresAt: webhook.expiresAt,
      maxUses: webhook.maxUses,
      useCount: webhook.useCount,
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
    const { webhook, tokenHash } = await findWebhook(ctx.db, args.token);

    if (!webhook) {
      return {
        success: false,
        error: "Webhook unavailable",
      };
    }

    await upgradeTokenStorage(ctx.db, webhook, tokenHash);

    const now = Date.now();
    if (!isWebhookExpiryActive(webhook.expiresAt, now)) {
      await ctx.db.delete(webhook._id);
      return { success: false, error: "Webhook expired" };
    }

    const useCount = webhook.useCount ?? 0;
    if (!isWebhookUseLimitActive(webhook.maxUses, useCount)) {
      return { success: false, error: "Webhook unavailable" };
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

      if (webhook.maxUses !== undefined) {
        await ctx.db.patch(webhook._id, { useCount: useCount + 1 });
      }

      return { success: true, eventId };
    } catch {
      return {
        success: false,
        // Do not return internal event/workflow details to a bearer-token
        // caller.
        error: "Webhook unavailable",
      };
    }
  },
});

function isWebhookUseLimitActive(
  maxUses: number | undefined,
  useCount: number,
): boolean {
  if (maxUses === undefined) return true;
  return (
    Number.isSafeInteger(maxUses) &&
    maxUses >= 1 &&
    maxUses <= MAX_WEBHOOK_USES &&
    Number.isSafeInteger(useCount) &&
    useCount >= 0 &&
    useCount < maxUses
  );
}

/**
 * Delete a webhook after it's been used or is no longer needed.
 */
export const remove = mutation({
  args: {
    token: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { webhook } = await findWebhook(ctx.db, args.token);

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
