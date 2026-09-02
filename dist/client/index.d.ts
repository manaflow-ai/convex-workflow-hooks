import type { WorkpoolOptions, WorkpoolRetryOptions } from "@convex-dev/workpool";
import { type FunctionArgs, type FunctionReference, type FunctionVisibility, type GenericDataModel, type GenericMutationCtx, type GenericQueryCtx, type HttpRouter, type PaginationOptions, type PaginationResult, type RegisteredMutation, type ReturnValueForOptionalValidator } from "convex/server";
import type { Infer, ObjectType, PropertyValidators, Validator } from "convex/values";
import type { Step } from "../component/schema.js";
import type { EventId, OnCompleteArgs, WorkflowId, WorkflowStep } from "../types.js";
import type { IdsToStrings, WorkflowComponent } from "./types.js";
import type { WorkflowCtx } from "./workflowContext.js";
import { type WebhookPayloadValidator } from "./webhookSecurity.js";
export { vEventId, vWorkflowId, vWorkflowStep, type EventId, type WorkflowId, type WorkflowStep, } from "../types.js";
export type { RunOptions, WorkflowCtx } from "./workflowContext.js";
export { defineHook, type Hook, type Webhook, type HookOptions, type WebhookOptions, type TypedHook, type TypedHookInput, type TypedHookOutput, type StandardSchemaV1, } from "./hooks.js";
export { DEFAULT_MAX_WEBHOOK_BODY_BYTES, MAX_WEBHOOK_BODY_BYTES, MAX_WEBHOOK_TOKEN_LENGTH, MAX_WEBHOOK_USES, MIN_WEBHOOK_TOKEN_LENGTH, assertValidWebhookToken, generateWebhookToken, type WebhookPayloadValidator, } from "./webhookSecurity.js";
export type CallbackOptions = {
    /**
     * A mutation to run after the function succeeds, fails, or is canceled.
     * The context type is for your use, feel free to provide a validator for it.
     * e.g.
     * ```ts
     * export const completion = internalMutation({
     *  args: {
     *    workId: workIdValidator,
     *    context: v.any(),
     *    result: resultValidator,
     *  },
     *  handler: async (ctx, args) => {
     *    console.log(args.result, "Got Context back -> ", args.context, Date.now() - args.context);
     *  },
     * });
     * ```
     */
    onComplete?: FunctionReference<"mutation", FunctionVisibility, OnCompleteArgs> | null;
    /**
     * A context object to pass to the `onComplete` mutation.
     * Useful for passing data from the enqueue site to the onComplete site.
     */
    context?: unknown;
};
export type WorkflowDefinition<ArgsValidator extends PropertyValidators, ReturnsValidator extends Validator<any, "required", any> | void = any> = {
    args?: ArgsValidator;
    handler: (step: WorkflowCtx, args: ObjectType<ArgsValidator>) => Promise<ReturnValueForOptionalValidator<ReturnsValidator>>;
    returns?: ReturnsValidator;
    workpoolOptions?: WorkpoolRetryOptions;
};
export type WorkflowStatus = {
    type: "inProgress";
    running: IdsToStrings<Step>[];
} | {
    type: "completed";
    result: unknown;
} | {
    type: "canceled";
} | {
    type: "failed";
    error: string;
};
export type WebhookRouteOptions = {
    /** URL prefix for webhook routes. */
    prefix?: string;
    /**
     * Server-side payload validators keyed by `validatorKey` (or event name for
     * records created by older versions). Every webhook request must resolve to
     * one of these bindings.
     */
    validators: Readonly<Record<string, WebhookPayloadValidator>>;
    /** Maximum request body size in bytes. Defaults to 256 KiB, capped at 1 MiB. */
    maxBodyBytes?: number;
};
export declare class WorkflowManager {
    component: WorkflowComponent;
    options?: {
        workpoolOptions: WorkpoolOptions;
    } | undefined;
    constructor(component: WorkflowComponent, options?: {
        workpoolOptions: WorkpoolOptions;
    } | undefined);
    /**
     * Define a new workflow.
     *
     * @param workflow - The workflow definition.
     * @returns The workflow mutation.
     */
    define<ArgsValidator extends PropertyValidators, ReturnsValidator extends Validator<unknown, "required", string> | void>(workflow: WorkflowDefinition<ArgsValidator, ReturnsValidator>): RegisteredMutation<"internal", {
        fn: "You should not call this directly, call workflow.start instead";
        args: ObjectType<ArgsValidator>;
    }, ReturnsValidator extends Validator<unknown, "required", string> ? Infer<ReturnsValidator> : void>;
    /**
     * Kick off a defined workflow.
     *
     * @param ctx - The Convex context.
     * @param workflow - The workflow to start (e.g. `internal.index.exampleWorkflow`).
     * @param args - The workflow arguments.
     * @returns The workflow ID.
     */
    start<F extends FunctionReference<"mutation", "internal">>(ctx: RunMutationCtx, workflow: F, args: FunctionArgs<F>["args"], options?: CallbackOptions & {
        /**
         * By default, during creation the workflow will be initiated immediately.
         * The benefit is that you catch errors earlier (e.g. passing a bad
         * workflow reference or catch arg validation).
         *
         * With `startAsync` set to true, the workflow will be created but will
         * start asynchronously via the internal workpool.
         * You can use this to queue up a lot of work,
         * or make `start` return faster (you still get a workflowId back).
         * @default false
         */
        startAsync?: boolean;
        /** @deprecated Use `startAsync` instead. */
        validateAsync?: boolean;
    }): Promise<WorkflowId>;
    /**
     * Get a workflow's status.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     * @returns The workflow status.
     */
    status(ctx: RunQueryCtx, workflowId: WorkflowId): Promise<WorkflowStatus>;
    /**
     * Cancel a running workflow.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     */
    cancel(ctx: RunMutationCtx, workflowId: WorkflowId): Promise<void>;
    /**
     * List the steps in a workflow, including their name, args, return value etc.
     *
     * @param ctx - The Convex context from a query, mutation, or action.
     * @param workflowId - The workflow ID.
     * @param opts - How many steps to fetch and in what order.
     *   e.g. `{ order: "desc", paginationOpts: { cursor: null, numItems: 10 } }`
     *   will get the last 10 steps in descending order.
     *   Defaults to 100 steps in ascending order.
     * @returns The pagination result with per-step data.
     */
    listSteps(ctx: RunQueryCtx, workflowId: WorkflowId, opts?: {
        order?: "asc" | "desc";
        paginationOpts?: PaginationOptions;
    }): Promise<PaginationResult<WorkflowStep>>;
    /**
     * Clean up a completed workflow's storage.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     * @returns - Whether the workflow's state was cleaned up.
     */
    cleanup(ctx: RunMutationCtx, workflowId: WorkflowId): Promise<boolean>;
    /**
     * Send an event to a workflow.
     *
     * @param ctx - From a mutation, action or workflow step.
     * @param args - Either send an event by its ID, or by name and workflow ID.
     *   If you have a validator, you must provide a value.
     *   If you provide an error string, awaiting the event will throw an error.
     */
    sendEvent<T = null, Name extends string = string>(ctx: RunMutationCtx, args: ({
        workflowId: WorkflowId;
        name: Name;
        id?: EventId<Name>;
    } | {
        workflowId?: undefined;
        name?: Name;
        id: EventId<Name>;
    }) & ({
        validator?: undefined;
        value?: T;
    } | {
        validator: Validator<T, any, any>;
        value: T;
    } | {
        error: string;
        value?: undefined;
    })): Promise<EventId<Name>>;
    /**
     * Create an event ahead of time, enabling awaiting a specific event by ID.
     * @param ctx - From an action, mutation or workflow step.
     * @param args - The name of the event and what workflow it belongs to.
     * @returns The event ID, which can be used to send the event or await it.
     */
    createEvent<Name extends string>(ctx: RunMutationCtx, args: {
        name: Name;
        workflowId: WorkflowId;
    }): Promise<EventId<Name>>;
    /**
     * Register HTTP routes for webhook-based workflow resumption.
     *
     * This allows external systems to resume workflows via HTTP POST requests.
     * The webhook URL pattern is: `{prefix}/webhook/{token}`
     *
     * Example usage in convex/http.ts:
     * ```ts
     * import { httpRouter } from "convex/server";
     * import { workflow } from "./example";
     *
     * const http = httpRouter();
     * workflow.registerWebhookRoutes(http, {
     *   validators: {
     *     approval: v.object({ approved: v.boolean() }),
     *   },
     * });
     * export default http;
     * ```
     *
     * @param http - The HTTP router to register routes on.
     * @param options - Route configuration. A validator binding is required for
     * every event exposed over HTTP. This prevents the route from becoming an
     * unvalidated `v.any()` ingress by accident.
     * @param options.prefix - URL prefix for webhook routes (default: "/.well-known/workflow")
     * @param options.validators - Validators keyed by `validatorKey` or event name.
     * @param options.maxBodyBytes - Maximum request body size (default: 256 KiB,
     * hard cap: 1 MiB).
     */
    registerWebhookRoutes(http: HttpRouter, options: WebhookRouteOptions): void;
    /**
     * Resume a workflow via a webhook token.
     * This is an alternative to using HTTP - you can call this directly from a mutation/action.
     *
     * @param ctx - The Convex context.
     * @param token - The webhook token.
     * @param value - The value to send to the workflow.
     */
    resumeWebhook(ctx: RunMutationCtx, token: string, value: unknown): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Resume a hook by its token.
     *
     * This is the core hook resumption API. Webhooks are built on top of this.
     *
     * @example Direct usage:
     * ```ts
     * await workflow.resumeHook(
     *   ctx,
     *   "wh_0123456789abcdefABCDEFghijklmnop",
     *   { approved: true },
     * );
     * ```
     *
     * @example With defineHook:
     * ```ts
     * const approvalHook = defineHook<{ approved: boolean }>();
     *
     * // In API route:
     * const { token, payload } = approvalHook.resume(tokenFromRequest, data);
     * await workflow.resumeHook(ctx, token, payload);
     * ```
     *
     * @param ctx - The Convex context.
     * @param token - The hook token.
     * @param value - The value to send to the hook.
     */
    resumeHook(ctx: RunMutationCtx, token: string, value: unknown): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Create a webhook token for a workflow.
     * The webhook URL can be shared with external systems to resume the workflow.
     *
     * Example usage:
     * ```ts
     * // Create webhook before or after starting workflow
     * const workflowId = await workflow.start(ctx, internal.myWorkflow, {});
     * const { token, url } = await workflow.createWebhook(ctx, {
     *   workflowId,
     *   eventName: "approval",
     * });
     * console.log("Send POST to:", url);
     *
     * // In the workflow, await the event:
     * const result = await ctx.awaitEvent({ name: "approval" });
     * ```
     *
     * @param ctx - The Convex context.
     * @param args - The webhook configuration.
     * @param args.workflowId - The workflow to create a webhook for.
     * @param args.eventName - The event name to trigger when the webhook is called.
     * @param args.token - Optional custom token (auto-generated if not provided).
     * @param args.validatorKey - Key used by registerWebhookRoutes to bind the
     * payload validator. Defaults to eventName.
     * @param args.expiresAt - Optional absolute expiry timestamp in milliseconds.
     * @param args.ttlMs - Optional lifetime in milliseconds. Cannot be combined
     * with expiresAt.
     * @param args.maxUses - Optional maximum number of accepted requests.
     * @param args.baseUrl - Optional base URL (defaults to CONVEX_SITE_URL env var).
     * @param args.prefix - Optional URL prefix (defaults to "/.well-known/workflow").
     */
    createWebhook(ctx: RunMutationCtx, args: {
        workflowId: WorkflowId;
        eventName: string;
        token?: string;
        validatorKey?: string;
        expiresAt?: number;
        ttlMs?: number;
        maxUses?: number;
        baseUrl?: string;
        prefix?: string;
    }): Promise<{
        token: string;
        url: string;
    }>;
}
/**
 * Define an event specification: a name and a validator.
 * This helps share definitions between workflow.sendEvent and ctx.awaitEvent.
 * e.g.
 * ```ts
 * const approvalEvent = defineEvent({
 *   name: "approval",
 *   validator: v.object({ approved: v.boolean() }),
 * });
 * ```
 * Then you can await it in a workflow:
 * ```ts
 * const result = await ctx.awaitEvent(approvalEvent);
 * ```
 * And send from somewhere else:
 * ```ts
 * await workflow.sendEvent(ctx, {
 *   ...approvalEvent,
 *   workflowId,
 *   value: { approved: true },
 * });
 * ```
 */
export declare function defineEvent<Name extends string, V extends Validator<unknown, "required", string>>(spec: {
    name: Name;
    validator: V;
}): {
    name: Name;
    validator: V;
};
type RunQueryCtx = {
    runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
    runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};
//# sourceMappingURL=index.d.ts.map