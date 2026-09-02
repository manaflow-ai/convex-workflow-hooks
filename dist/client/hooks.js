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
export function defineHook(options) {
    const { schema } = options ?? {};
    return {
        create(_hookOptions) {
            // This is a placeholder - the actual implementation is injected
            // by the workflow context when running inside a workflow
            throw new Error("`defineHook().create()` can only be called inside a workflow. " +
                "Use `ctx.createHook()` or pass the hook definition to the workflow context.");
        },
        resume(token, payload) {
            // Validate with Standard Schema if provided
            if (schema?.["~standard"]) {
                const result = schema["~standard"].validate(payload);
                // Handle sync result
                if ("issues" in result && result.issues) {
                    throw new Error(`Hook payload validation failed:\n${JSON.stringify(result.issues, null, 2)}`);
                }
                if ("value" in result) {
                    return { token, payload: result.value, validated: true };
                }
                // Handle async result - not ideal but we need sync for this pattern
                throw new Error("Async schema validation is not supported in defineHook().resume(). " +
                    "Use workflow.resumeHook() directly with pre-validated data.");
            }
            // For Convex validators, we rely on runtime validation at the mutation level
            // The validator is used for typing, not runtime validation here
            return {
                token,
                payload: payload,
                validated: false,
            };
        },
    };
}
/**
 * Re-export for convenience.
 */
export { defineEvent } from "./index.js";
//# sourceMappingURL=hooks.js.map