/**
 * Hook abstraction for Convex workflows.
 *
 * Hooks allow workflows to pause and wait for external events.
 * This is the foundation layer - webhooks are built on top of hooks.
 *
 * Architecture (matching Vercel workflow):
 * - defineHook<T>() - Type-safe hook definition with optional schema validation
 * - Hook<T> - Thenable + AsyncIterable object returned from hook.create()
 * - Webhook<T> - Hook with HTTP URL support (built on top of hooks)
 */

import type { Validator } from "convex/values";
import type { EventId, WorkflowId } from "../types.js";

/**
 * Standard Schema v1 interface for validation.
 * Compatible with Zod, Valibot, ArkType, etc.
 * @see https://github.com/standard-schema/standard-schema
 */
export interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) =>
      | { value: TOutput; issues?: undefined }
      | { issues: readonly { message: string }[] }
      | Promise<
          | { value: TOutput; issues?: undefined }
          | { issues: readonly { message: string }[] }
        >;
  };
}

/**
 * Options for creating a hook.
 */
export interface HookOptions {
  /**
   * Unique token used to identify and resume the hook.
   * If not provided, the hook will use the event name for matching.
   *
   * For HTTP access, use `workflow.createWebhook()`, which generates and
   * stores a secure bearer token. Do not derive a token from user or document
   * identifiers.
   */
  token?: string;

  /**
   * The name of the event to wait for.
   * Used when matching events by name rather than explicit ID.
   */
  name?: string;
}

/**
 * A hook that can be awaited and/or iterated over to receive
 * values within a workflow from an external system.
 *
 * Implements both Thenable (for `await hook`) and AsyncIterable
 * (for `for await (const value of hook)`).
 */
export interface Hook<T = unknown> {
  /**
   * The token used to identify this hook.
   */
  readonly token: string;

  /**
   * The event ID associated with this hook.
   */
  readonly eventId?: EventId;

  /**
   * The workflow ID this hook belongs to.
   */
  readonly workflowId: WorkflowId;

  /**
   * Makes the hook thenable (can be awaited).
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;

  /**
   * Makes the hook async iterable (for await...of).
   */
  [Symbol.asyncIterator](): AsyncIterator<T>;
}

/**
 * A webhook extends a hook with an HTTP URL for external access.
 */
export interface Webhook<T = unknown> extends Hook<T> {
  /**
   * The URL that external systems can call to send data to the workflow.
   */
  readonly url: string;
}

/**
 * Options for creating a webhook.
 */
export interface WebhookOptions extends HookOptions {
  /**
   * Base URL for the webhook endpoint.
   * Defaults to CONVEX_SITE_URL environment variable.
   */
  baseUrl?: string;

  /**
   * URL prefix for the webhook endpoint.
   * Defaults to "/.well-known/workflow".
   */
  prefix?: string;
}

/**
 * A typed hook interface returned by defineHook().
 * Provides type-safe hook creation and resumption.
 */
export interface TypedHook<TInput, TOutput = TInput> {
  /**
   * Creates a new hook within a workflow.
   *
   * @param options - Optional hook configuration
   * @returns A Hook that resolves to the defined output type
   */
  create(options?: HookOptions): Hook<TOutput>;

  /**
   * Resumes a hook by sending a payload.
   * This is a type-safe wrapper that validates the payload if a schema is configured.
   *
   * Note: This function returns a resumption helper. The actual resumption
   * happens when you call workflow.resumeHook() or via HTTP webhook.
   *
   * @param token - The unique token identifying the hook
   * @param payload - The payload to send; validated/transformed if schema is configured
   */
  resume(
    token: string,
    payload: TInput,
  ): { token: string; payload: TOutput; validated: boolean };
}

/**
 * Extracts the input type from a TypedHook.
 */
export type TypedHookInput<T extends TypedHook<unknown, unknown>> =
  T extends TypedHook<infer I, unknown> ? I : never;

/**
 * Extracts the output type from a TypedHook.
 */
export type TypedHookOutput<T extends TypedHook<unknown, unknown>> =
  T extends TypedHook<unknown, infer O> ? O : never;

/**
 * Defines a typed hook for type-safe hook creation and resumption.
 *
 * This helper provides type safety by allowing you to define the input and output
 * types for the hook's payload, with optional validation via Standard Schema v1
 * (compatible with Zod, Valibot, ArkType, etc.) or Convex validators.
 *
 * @example Using with Zod:
 * ```ts
 * import { z } from "zod";
 *
 * const approvalHook = defineHook({
 *   schema: z.object({
 *     decision: z.enum(["approved", "rejected"]),
 *     notes: z.string().optional(),
 *   }),
 * });
 *
 * // In workflow:
 * const hook = approvalHook.create();
 * const result = await hook; // Typed as { decision: "approved" | "rejected"; notes?: string }
 *
 * // In API route:
 * const { token, payload } = approvalHook.resume(token, data);
 * await workflow.resumeHook(ctx, token, payload);
 * ```
 *
 * @example Using with Convex validator:
 * ```ts
 * import { v } from "convex/values";
 *
 * const approvalHook = defineHook({
 *   validator: v.object({
 *     decision: v.union(v.literal("approved"), v.literal("rejected")),
 *     notes: v.optional(v.string()),
 *   }),
 * });
 * ```
 *
 * @example Simple type-only hook:
 * ```ts
 * const approvalHook = defineHook<{
 *   decision: "approved" | "rejected";
 *   notes?: string;
 * }>();
 * ```
 */
export function defineHook<TInput, TOutput = TInput>(options?: {
  /**
   * Standard Schema v1 validator (Zod, Valibot, ArkType, etc.)
   */
  schema?: StandardSchemaV1<TInput, TOutput>;

  /**
   * Convex validator for the payload.
   */
  validator?: Validator<TOutput, "required", string>;

  /**
   * Default event name for this hook type.
   */
  name?: string;
}): TypedHook<TInput, TOutput> {
  const { schema } = options ?? {};

  return {
    create(_hookOptions?: HookOptions): Hook<TOutput> {
      // This is a placeholder - the actual implementation is injected
      // by the workflow context when running inside a workflow
      throw new Error(
        "`defineHook().create()` can only be called inside a workflow. " +
          "Use `ctx.createHook()` or pass the hook definition to the workflow context.",
      );
    },

    resume(
      token: string,
      payload: TInput,
    ): { token: string; payload: TOutput; validated: boolean } {
      // Validate with Standard Schema if provided
      if (schema?.["~standard"]) {
        const result = schema["~standard"].validate(payload);

        // Handle sync result
        if ("issues" in result && result.issues) {
          throw new Error(
            `Hook payload validation failed:\n${JSON.stringify(result.issues, null, 2)}`,
          );
        }

        if ("value" in result) {
          return { token, payload: result.value as TOutput, validated: true };
        }

        // Handle async result - not ideal but we need sync for this pattern
        throw new Error(
          "Async schema validation is not supported in defineHook().resume(). " +
            "Use workflow.resumeHook() directly with pre-validated data.",
        );
      }

      // For Convex validators, we rely on runtime validation at the mutation level
      // The validator is used for typing, not runtime validation here
      return {
        token,
        payload: payload as unknown as TOutput,
        validated: false,
      };
    },
  };
}

/**
 * Re-export for convenience.
 */
export { defineEvent } from "./index.js";
