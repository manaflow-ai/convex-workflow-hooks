import { parse } from "convex-helpers/validators";
import { createFunctionHandle, httpActionGeneric, } from "convex/server";
import { safeFunctionName } from "./safeFunctionName.js";
import { workflowMutation } from "./workflowMutation.js";
export { vEventId, vWorkflowId, vWorkflowStep, } from "../types.js";
export { defineHook, } from "./hooks.js";
export class WorkflowManager {
    component;
    options;
    constructor(component, options) {
        this.component = component;
        this.options = options;
    }
    /**
     * Define a new workflow.
     *
     * @param workflow - The workflow definition.
     * @returns The workflow mutation.
     */
    define(workflow) {
        return workflowMutation(this.component, workflow, this.options?.workpoolOptions);
    }
    /**
     * Kick off a defined workflow.
     *
     * @param ctx - The Convex context.
     * @param workflow - The workflow to start (e.g. `internal.index.exampleWorkflow`).
     * @param args - The workflow arguments.
     * @returns The workflow ID.
     */
    async start(ctx, workflow, args, options) {
        const handle = await createFunctionHandle(workflow);
        const onComplete = options?.onComplete
            ? {
                fnHandle: await createFunctionHandle(options.onComplete),
                context: options.context,
            }
            : undefined;
        const workflowId = await ctx.runMutation(this.component.workflow.create, {
            workflowName: safeFunctionName(workflow),
            workflowHandle: handle,
            workflowArgs: args,
            maxParallelism: this.options?.workpoolOptions?.maxParallelism,
            onComplete,
            startAsync: options?.startAsync ?? options?.validateAsync,
        });
        return workflowId;
    }
    /**
     * Get a workflow's status.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     * @returns The workflow status.
     */
    async status(ctx, workflowId) {
        const { workflow, inProgress } = await ctx.runQuery(this.component.workflow.getStatus, { workflowId });
        const running = inProgress.map((entry) => entry.step);
        switch (workflow.runResult?.kind) {
            case undefined:
                return { type: "inProgress", running };
            case "canceled":
                return { type: "canceled" };
            case "failed":
                return { type: "failed", error: workflow.runResult.error };
            case "success":
                return { type: "completed", result: workflow.runResult.returnValue };
        }
    }
    /**
     * Cancel a running workflow.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     */
    async cancel(ctx, workflowId) {
        await ctx.runMutation(this.component.workflow.cancel, {
            workflowId,
        });
    }
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
    async listSteps(ctx, workflowId, opts) {
        const steps = await ctx.runQuery(this.component.workflow.listSteps, {
            workflowId,
            order: opts?.order ?? "asc",
            paginationOpts: opts?.paginationOpts ?? {
                cursor: null,
                numItems: 100,
            },
        });
        return steps;
    }
    /**
     * Clean up a completed workflow's storage.
     *
     * @param ctx - The Convex context.
     * @param workflowId - The workflow ID.
     * @returns - Whether the workflow's state was cleaned up.
     */
    async cleanup(ctx, workflowId) {
        return await ctx.runMutation(this.component.workflow.cleanup, {
            workflowId,
        });
    }
    /**
     * Send an event to a workflow.
     *
     * @param ctx - From a mutation, action or workflow step.
     * @param args - Either send an event by its ID, or by name and workflow ID.
     *   If you have a validator, you must provide a value.
     *   If you provide an error string, awaiting the event will throw an error.
     */
    async sendEvent(ctx, args) {
        const result = "error" in args
            ? {
                kind: "failed",
                error: args.error,
            }
            : {
                kind: "success",
                returnValue: args.validator
                    ? parse(args.validator, args.value)
                    : "value" in args
                        ? args.value
                        : null,
            };
        return (await ctx.runMutation(this.component.event.send, {
            eventId: args.id,
            result,
            name: args.name,
            workflowId: args.workflowId,
            workpoolOptions: this.options?.workpoolOptions,
        }));
    }
    /**
     * Create an event ahead of time, enabling awaiting a specific event by ID.
     * @param ctx - From an action, mutation or workflow step.
     * @param args - The name of the event and what workflow it belongs to.
     * @returns The event ID, which can be used to send the event or await it.
     */
    async createEvent(ctx, args) {
        return (await ctx.runMutation(this.component.event.create, {
            name: args.name,
            workflowId: args.workflowId,
        }));
    }
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
     * workflow.registerWebhookRoutes(http);
     * export default http;
     * ```
     *
     * @param http - The HTTP router to register routes on.
     * @param options - Optional configuration.
     * @param options.prefix - URL prefix for webhook routes (default: "/.well-known/workflow")
     */
    registerWebhookRoutes(http, options) {
        const prefix = options?.prefix ?? "/.well-known/workflow";
        // POST /{prefix}/webhook/{token} - Resume a workflow via webhook
        http.route({
            pathPrefix: `${prefix}/webhook/`,
            method: "POST",
            handler: httpActionGeneric(async (ctx, request) => {
                const url = new URL(request.url);
                const pathParts = url.pathname.split("/");
                const token = pathParts[pathParts.length - 1];
                if (!token) {
                    return new Response(JSON.stringify({ error: "Missing webhook token" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                let body = null;
                const contentType = request.headers.get("Content-Type") ?? "";
                try {
                    if (contentType.includes("application/json")) {
                        body = await request.json();
                    }
                    else if (contentType.includes("application/x-www-form-urlencoded")) {
                        const formData = await request.formData();
                        body = Object.fromEntries(formData.entries());
                    }
                    else if (contentType.includes("text/")) {
                        body = await request.text();
                    }
                    else {
                        // Try JSON first, fall back to text
                        const text = await request.text();
                        try {
                            body = JSON.parse(text);
                        }
                        catch {
                            body = text;
                        }
                    }
                }
                catch (error) {
                    return new Response(JSON.stringify({ error: "Failed to parse request body" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                try {
                    const result = await ctx.runMutation(this.component.webhook.resume, {
                        token,
                        value: body,
                        workpoolOptions: this.options?.workpoolOptions,
                    });
                    if (!result.success) {
                        return new Response(JSON.stringify({ error: result.error }), {
                            status: 404,
                            headers: { "Content-Type": "application/json" },
                        });
                    }
                    return new Response(JSON.stringify({ success: true, eventId: result.eventId }), {
                        status: 202,
                        headers: { "Content-Type": "application/json" },
                    });
                }
                catch (error) {
                    return new Response(JSON.stringify({
                        error: error instanceof Error ? error.message : "Unknown error",
                    }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    });
                }
            }),
        });
    }
    /**
     * Resume a workflow via a webhook token.
     * This is an alternative to using HTTP - you can call this directly from a mutation/action.
     *
     * @param ctx - The Convex context.
     * @param token - The webhook token.
     * @param value - The value to send to the workflow.
     */
    async resumeWebhook(ctx, token, value) {
        return await ctx.runMutation(this.component.webhook.resume, {
            token,
            value,
            workpoolOptions: this.options?.workpoolOptions,
        });
    }
    /**
     * Resume a hook by its token.
     *
     * This is the core hook resumption API. Webhooks are built on top of this.
     *
     * @example Direct usage:
     * ```ts
     * await workflow.resumeHook(ctx, "approval_abc123", { approved: true });
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
    async resumeHook(ctx, token, value) {
        // Hooks use the same underlying mechanism as webhooks
        return await ctx.runMutation(this.component.webhook.resume, {
            token,
            value,
            workpoolOptions: this.options?.workpoolOptions,
        });
    }
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
     * @param args.baseUrl - Optional base URL (defaults to CONVEX_SITE_URL env var).
     * @param args.prefix - Optional URL prefix (defaults to "/.well-known/workflow").
     */
    async createWebhook(ctx, args) {
        const result = await ctx.runMutation(this.component.webhook.create, {
            workflowId: args.workflowId,
            eventName: args.eventName,
            token: args.token,
        });
        const prefix = args.prefix ?? "/.well-known/workflow";
        // Note: baseUrl should be set by the user or from environment
        const baseUrl = args.baseUrl ?? "";
        const url = `${baseUrl}${prefix}/webhook/${result.token}`;
        return { token: result.token, url };
    }
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
export function defineEvent(spec) {
    return spec;
}
//# sourceMappingURL=index.js.map