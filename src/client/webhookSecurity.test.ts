import { describe, expect, test, vi } from "vitest";
import { v } from "convex/values";
import { httpRouter } from "convex/server";
import { WorkflowManager } from "./index.js";
import {
  assertValidWebhookToken,
  DEFAULT_MAX_WEBHOOK_BODY_BYTES,
  generateWebhookToken,
  hashWebhookToken,
  deriveHookToken,
  MAX_WEBHOOK_BODY_BYTES,
  normalizeMaxBodyBytes,
  readWebhookBody,
  validateWebhookPayload,
} from "./webhookSecurity.js";

const secureToken = "wh_0123456789abcdefABCDEFghijklmnop";

describe("webhook security", () => {
  test("generates distinct URL-safe tokens with 256 bits of entropy", () => {
    const first = generateWebhookToken();
    const second = generateWebhookToken();
    expect(first).toMatch(/^wh_[0-9a-f]{64}$/u);
    expect(second).toMatch(/^wh_[0-9a-f]{64}$/u);
    expect(first).not.toBe(second);
    expect(() => assertValidWebhookToken(first)).not.toThrow();
  });

  test("creates a stable SHA-256 digest for storage", async () => {
    await expect(hashWebhookToken("abc")).resolves.toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  test("derives stable, distinct identifiers for repeated workflow hooks", () => {
    const first = deriveHookToken("workflows:test", "approval", 0);
    const replayed = deriveHookToken("workflows:test", "approval", 0);
    const second = deriveHookToken("workflows:test", "approval", 1);
    expect(first).toBe(replayed);
    expect(second).not.toBe(first);
  });

  test("rejects weak or path-unsafe custom tokens", () => {
    expect(() => assertValidWebhookToken("short-token")).toThrow(
      "between 32 and 256",
    );
    expect(() => assertValidWebhookToken(`${secureToken}/extra`)).toThrow(
      "unsafe URL characters",
    );
    expect(() => assertValidWebhookToken("a".repeat(64))).toThrow(
      "character diversity",
    );
    expect(() => assertValidWebhookToken(secureToken)).not.toThrow();
  });

  test("rejects oversized bodies before JSON parsing", async () => {
    const body = "x".repeat(DEFAULT_MAX_WEBHOOK_BODY_BYTES + 1);
    await expect(
      readWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body,
          headers: { "content-type": "text/plain" },
        }),
        DEFAULT_MAX_WEBHOOK_BODY_BYTES,
      ),
    ).rejects.toMatchObject({ status: 413 });
  });

  test("keeps route limits below the Convex value ceiling", () => {
    expect(normalizeMaxBodyBytes()).toBe(DEFAULT_MAX_WEBHOOK_BODY_BYTES);
    expect(normalizeMaxBodyBytes(MAX_WEBHOOK_BODY_BYTES)).toBe(
      MAX_WEBHOOK_BODY_BYTES,
    );
    expect(() => normalizeMaxBodyBytes(MAX_WEBHOOK_BODY_BYTES + 1)).toThrow(
      "no larger than",
    );
  });

  test("supports strict JSON and form parsing", async () => {
    await expect(
      readWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body: JSON.stringify({ ok: true }),
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
      ),
    ).resolves.toEqual({ ok: true });

    await expect(
      readWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body: "ok=true",
          headers: { "content-type": "application/x-www-form-urlencoded" },
        }),
      ),
    ).resolves.toEqual({ ok: "true" });
  });

  test("rejects unsupported media types and duplicate form keys", async () => {
    await expect(
      readWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body: "{}",
          headers: { "content-type": "application/xml" },
        }),
      ),
    ).rejects.toMatchObject({ status: 415 });

    await expect(
      readWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body: "ok=true&ok=false",
          headers: { "content-type": "application/x-www-form-urlencoded" },
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });

  test("validates Convex payloads without unknown fields", async () => {
    const validator = v.object({ ok: v.boolean() });
    await expect(
      validateWebhookPayload({ ok: true }, validator),
    ).resolves.toEqual({ ok: true });
    await expect(
      validateWebhookPayload({ ok: true, extra: "rejected" }, validator),
    ).rejects.toThrow();
    await expect(validateWebhookPayload({}, v.any())).rejects.toThrow("v.any");
    await expect(
      validateWebhookPayload(
        { nested: { accepted: true } },
        v.object({ nested: v.object({ accepted: v.any() }) }),
      ),
    ).rejects.toThrow("v.any");
  });

  test("supports Standard Schema transformations", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: async (value: unknown) =>
          typeof value === "string"
            ? { value: value.trim() }
            : { issues: [{ message: "expected string" }] },
      },
    };
    await expect(validateWebhookPayload("  ok  ", schema)).resolves.toBe("ok");
    await expect(validateWebhookPayload(42, schema)).rejects.toThrow(
      "expected string",
    );
  });

  test("requires bindings when registering HTTP routes", () => {
    const component = {} as ConstructorParameters<typeof WorkflowManager>[0];
    const manager = new WorkflowManager(component);
    expect(() =>
      manager.registerWebhookRoutes(httpRouter(), undefined as never),
    ).toThrow("validator binding");
    expect(() =>
      manager.registerWebhookRoutes(httpRouter(), {
        validators: { all: v.any() },
      }),
    ).toThrow("v.any");
    expect(() =>
      manager.registerWebhookRoutes(httpRouter(), {
        validators: {
          nested: v.object({ payload: v.optional(v.any()) }),
        },
      }),
    ).toThrow("v.any");
    const router = httpRouter();
    expect(() =>
      manager.registerWebhookRoutes(router, {
        validators: { approval: v.object({ ok: v.boolean() }) },
      }),
    ).not.toThrow();
    expect(router.getRoutes()).toHaveLength(1);
  });

  test("builds webhook URLs only from safe HTTP origins", async () => {
    const component = {
      webhook: { create: Symbol("create") },
    } as unknown as ConstructorParameters<typeof WorkflowManager>[0];
    const manager = new WorkflowManager(component);
    const ctx = {
      runMutation: vi.fn().mockResolvedValue({ token: secureToken }),
    };
    const args = {
      workflowId: "workflows:test" as never,
      eventName: "approval",
      token: secureToken,
    };

    await expect(
      manager.createWebhook(ctx as never, {
        ...args,
        baseUrl: "https://user:password@example.test",
      }),
    ).rejects.toThrow("without credentials");
    expect(ctx.runMutation).not.toHaveBeenCalled();
    await expect(
      manager.createWebhook(ctx as never, {
        ...args,
        baseUrl: "https://example.test?leak=",
      }),
    ).rejects.toThrow("unsafe characters");
    await expect(
      manager.createWebhook(ctx as never, {
        ...args,
        baseUrl: "https://example.test?",
      }),
    ).rejects.toThrow("unsafe characters");
    await expect(
      manager.createWebhook(ctx as never, {
        ...args,
        baseUrl: "https://example.test/",
      }),
    ).resolves.toMatchObject({
      url: `https://example.test/.well-known/workflow/webhook/${secureToken}`,
    });
  });

  test("keeps legacy path-safe webhook tokens reachable", async () => {
    const component = {
      webhook: {
        getByToken: Symbol("getByToken"),
        resume: Symbol("resume"),
      },
    } as unknown as ConstructorParameters<typeof WorkflowManager>[0];
    const manager = new WorkflowManager(component);
    const router = httpRouter();
    manager.registerWebhookRoutes(router, {
      validators: { approval: v.object({ approved: v.boolean() }) },
    });
    const action = router.getRoutes()[0]?.[2] as unknown as {
      _handler: (ctx: unknown, request: Request) => Promise<Response>;
    };
    const runMutation = vi.fn().mockResolvedValue({ success: true });
    const legacyToken = "chat:legacy-123";
    const response = await action._handler(
      {
        runQuery: vi.fn().mockResolvedValue({ eventName: "approval" }),
        runMutation,
      },
      new Request(
        `https://example.test/.well-known/workflow/webhook/${legacyToken}`,
        {
          method: "POST",
          body: JSON.stringify({ approved: true }),
          headers: { "content-type": "application/json" },
        },
      ),
    );
    expect(response.status).toBe(202);
    expect(runMutation.mock.calls[0]?.[1]).toMatchObject({
      token: legacyToken,
      value: { approved: true },
    });
  });

  test("does not forward an invalid HTTP payload", async () => {
    const component = {
      webhook: {
        getByToken: Symbol("getByToken"),
        resume: Symbol("resume"),
      },
    } as unknown as ConstructorParameters<typeof WorkflowManager>[0];
    const manager = new WorkflowManager(component);
    const router = httpRouter();
    manager.registerWebhookRoutes(router, {
      validators: { approval: v.object({ approved: v.boolean() }) },
    });
    const action = router.getRoutes()[0]?.[2] as unknown as {
      _handler: (ctx: unknown, request: Request) => Promise<Response>;
    };
    const runMutation = vi.fn();
    const response = await action._handler(
      {
        runQuery: vi.fn().mockResolvedValue({ eventName: "approval" }),
        runMutation,
      },
      new Request(
        `https://example.test/.well-known/workflow/webhook/${secureToken}`,
        {
          method: "POST",
          body: JSON.stringify({ approved: "yes" }),
          headers: { "content-type": "application/json" },
        },
      ),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid webhook payload" });
    expect(runMutation).not.toHaveBeenCalled();
  });

  test("forwards only the validated payload", async () => {
    const component = {
      webhook: {
        getByToken: Symbol("getByToken"),
        resume: Symbol("resume"),
      },
    } as unknown as ConstructorParameters<typeof WorkflowManager>[0];
    const manager = new WorkflowManager(component);
    const router = httpRouter();
    manager.registerWebhookRoutes(router, {
      validators: { approval: v.object({ approved: v.boolean() }) },
    });
    const action = router.getRoutes()[0]?.[2] as unknown as {
      _handler: (ctx: unknown, request: Request) => Promise<Response>;
    };
    const runMutation = vi.fn().mockResolvedValue({
      success: true,
      eventId: "events:ok",
    });
    const response = await action._handler(
      {
        runQuery: vi.fn().mockResolvedValue({ eventName: "approval" }),
        runMutation,
      },
      new Request(
        `https://example.test/.well-known/workflow/webhook/${secureToken}`,
        {
          method: "POST",
          body: JSON.stringify({ approved: true }),
          headers: { "content-type": "application/json" },
        },
      ),
    );
    expect(response.status).toBe(202);
    expect(runMutation).toHaveBeenCalledTimes(1);
    expect(runMutation.mock.calls[0]?.[1]).toMatchObject({
      token: secureToken,
      value: { approved: true },
    });
  });
});
