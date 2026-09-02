import type {
  RunResult,
  WorkpoolOptions,
  WorkpoolRetryOptions,
} from "@convex-dev/workpool";
import { parse } from "convex-helpers/validators";
import {
  createFunctionHandle,
  httpActionGeneric,
  type FunctionArgs,
  type FunctionReference,
  type FunctionVisibility,
  type GenericActionCtx,
  type GenericDataModel,
  type GenericMutationCtx,
  type GenericQueryCtx,
  type HttpRouter,
  type PaginationOptions,
  type PaginationResult,
  type RegisteredMutation,
  type ReturnValueForOptionalValidator,
} from "convex/server";
import type {
  Infer,
  ObjectType,
  PropertyValidators,
  Validator,
} from "convex/values";
import type { Step } from "../component/schema.js";
import type {
  EventId,
  OnCompleteArgs,
  WorkflowId,
  WorkflowStep,
} from "../types.js";
import { safeFunctionName } from "./safeFunctionName.js";
import type { IdsToStrings, WorkflowComponent } from "./types.js";
import type { WorkflowCtx } from "./workflowContext.js";
import { workflowMutation } from "./workflowMutation.js";
import {
  assertValidWebhookToken,
  assertWebhookValidator,
  isWebhookTokenPathSegment,
  MAX_WEBHOOK_USES,
  normalizeMaxBodyBytes,
  readWebhookBody,
  validateWebhookPayload,
  WebhookRequestError,
  type WebhookPayloadValidator,
} from "./webhookSecurity.js";

export {
  vEventId,
  vWorkflowId,
  vWorkflowStep,
  type EventId,
  type WorkflowId,
  type WorkflowStep,
} from "../types.js";
export type { RunOptions, WorkflowCtx } from "./workflowContext.js";
export {
  defineHook,
  type Hook,
  type Webhook,
  type HookOptions,
  type WebhookOptions,
  type TypedHook,
  type TypedHookInput,
  type TypedHookOutput,
  type StandardSchemaV1,
} from "./hooks.js";
export {
  DEFAULT_MAX_WEBHOOK_BODY_BYTES,
  MAX_WEBHOOK_BODY_BYTES,
  MAX_WEBHOOK_TOKEN_LENGTH,
  MAX_WEBHOOK_USES,
  MIN_WEBHOOK_TOKEN_LENGTH,
  assertValidWebhookToken,
  generateWebhookToken,
  type WebhookPayloadValidator,
} from "./webhookSecurity.js";

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
  onComplete?: FunctionReference<
    "mutation",
    FunctionVisibility,
    OnCompleteArgs
  > | null;

  /**
   * A context object to pass to the `onComplete` mutation.
   * Useful for passing data from the enqueue site to the onComplete site.
   */
  context?: unknown;
};

export type WorkflowDefinition<
  ArgsValidator extends PropertyValidators,
  ReturnsValidator extends Validator<any, "required", any> | void = any,
> = {
  args?: ArgsValidator;
  handler: (
    step: WorkflowCtx,
    args: ObjectType<ArgsValidator>,
  ) => Promise<ReturnValueForOptionalValidator<ReturnsValidator>>;
  returns?: ReturnsValidator;
  workpoolOptions?: WorkpoolRetryOptions;
};

export type WorkflowStatus =
  | { type: "inProgress"; running: IdsToStrings<Step>[] }
  | { type: "completed"; result: unknown }
  | { type: "canceled" }
  | { type: "failed"; error: string };

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

export class WorkflowManager {
  constructor(
    public component: WorkflowComponent,
    public options?: {
      workpoolOptions: WorkpoolOptions;
    },
  ) {}

  /**
   * Define a new workflow.
   *
   * @param workflow - The workflow definition.
   * @returns The workflow mutation.
   */
  define<
    ArgsValidator extends PropertyValidators,
    ReturnsValidator extends Validator<unknown, "required", string> | void,
  >(
    workflow: WorkflowDefinition<ArgsValidator, ReturnsValidator>,
  ): RegisteredMutation<
    "internal",
    {
      fn: "You should not call this directly, call workflow.start instead";
      args: ObjectType<ArgsValidator>;
    },
    ReturnsValidator extends Validator<unknown, "required", string>
      ? Infer<ReturnsValidator>
      : void
  > {
    return workflowMutation(
      this.component,
      workflow,
      this.options?.workpoolOptions,
    );
  }

  /**
   * Kick off a defined workflow.
   *
   * @param ctx - The Convex context.
   * @param workflow - The workflow to start (e.g. `internal.index.exampleWorkflow`).
   * @param args - The workflow arguments.
   * @returns The workflow ID.
   */
  async start<F extends FunctionReference<"mutation", "internal">>(
    ctx: RunMutationCtx,
    workflow: F,
    args: FunctionArgs<F>["args"],
    options?: CallbackOptions & {
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
    },
  ): Promise<WorkflowId> {
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
    return workflowId as unknown as WorkflowId;
  }

  /**
   * Get a workflow's status.
   *
   * @param ctx - The Convex context.
   * @param workflowId - The workflow ID.
   * @returns The workflow status.
   */
  async status(
    ctx: RunQueryCtx,
    workflowId: WorkflowId,
  ): Promise<WorkflowStatus> {
    const { workflow, inProgress } = await ctx.runQuery(
      this.component.workflow.getStatus,
      { workflowId },
    );
    const running = inProgress.map((entry) => entry.step as IdsToStrings<Step>);
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
  async cancel(ctx: RunMutationCtx, workflowId: WorkflowId) {
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
  async listSteps(
    ctx: RunQueryCtx,
    workflowId: WorkflowId,
    opts?: {
      order?: "asc" | "desc";
      paginationOpts?: PaginationOptions;
    },
  ): Promise<PaginationResult<WorkflowStep>> {
    const steps = await ctx.runQuery(this.component.workflow.listSteps, {
      workflowId,
      order: opts?.order ?? "asc",
      paginationOpts: opts?.paginationOpts ?? {
        cursor: null,
        numItems: 100,
      },
    });
    return steps as PaginationResult<WorkflowStep>;
  }

  /**
   * Clean up a completed workflow's storage.
   *
   * @param ctx - The Convex context.
   * @param workflowId - The workflow ID.
   * @returns - Whether the workflow's state was cleaned up.
   */
  async cleanup(ctx: RunMutationCtx, workflowId: WorkflowId): Promise<boolean> {
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
  async sendEvent<T = null, Name extends string = string>(
    ctx: RunMutationCtx,
    args: (
      | { workflowId: WorkflowId; name: Name; id?: EventId<Name> }
      | { workflowId?: undefined; name?: Name; id: EventId<Name> }
    ) &
      (
        | { validator?: undefined; value?: T }
        | { validator: Validator<T, any, any>; value: T }
        | { error: string; value?: undefined }
      ),
  ): Promise<EventId<Name>> {
    const result: RunResult =
      "error" in args
        ? {
            kind: "failed",
            error: args.error,
          }
        : {
            kind: "success" as const,
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
    })) as EventId<Name>;
  }

  /**
   * Create an event ahead of time, enabling awaiting a specific event by ID.
   * @param ctx - From an action, mutation or workflow step.
   * @param args - The name of the event and what workflow it belongs to.
   * @returns The event ID, which can be used to send the event or await it.
   */
  async createEvent<Name extends string>(
    ctx: RunMutationCtx,
    args: { name: Name; workflowId: WorkflowId },
  ): Promise<EventId<Name>> {
    return (await ctx.runMutation(this.component.event.create, {
      name: args.name,
      workflowId: args.workflowId,
    })) as EventId<Name>;
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
  registerWebhookRoutes(http: HttpRouter, options: WebhookRouteOptions) {
    if (!options?.validators || Object.keys(options.validators).length === 0) {
      throw new Error(
        "registerWebhookRoutes requires at least one server-side validator binding",
      );
    }
    for (const [key, validator] of Object.entries(options.validators)) {
      if (!key || key.length > 128) {
        throw new Error(
          "Webhook validator keys must be between 1 and 128 characters",
        );
      }
      assertWebhookValidator(validator);
    }

    const prefix = normalizeWebhookPrefix(options.prefix);
    const maxBodyBytes = normalizeMaxBodyBytes(options.maxBodyBytes);

    // POST /{prefix}/webhook/{token} - Resume a workflow via webhook
    http.route({
      pathPrefix: `${prefix}/webhook/`,
      method: "POST",
      handler: httpActionGeneric((ctx, request) =>
        handleWebhookRequest(ctx, request, {
          component: this.component,
          validators: options.validators,
          prefix,
          maxBodyBytes,
          workpoolOptions: this.options?.workpoolOptions,
        }),
      ),
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
  async resumeWebhook(
    ctx: RunMutationCtx,
    token: string,
    value: unknown,
  ): Promise<{ success: boolean; error?: string }> {
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
  async resumeHook(
    ctx: RunMutationCtx,
    token: string,
    value: unknown,
  ): Promise<{ success: boolean; error?: string }> {
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
   * @param args.validatorKey - Key used by registerWebhookRoutes to bind the
   * payload validator. Defaults to eventName.
   * @param args.expiresAt - Optional absolute expiry timestamp in milliseconds.
   * @param args.ttlMs - Optional lifetime in milliseconds. Cannot be combined
   * with expiresAt.
   * @param args.maxUses - Optional maximum number of accepted requests.
   * @param args.baseUrl - Optional base URL (defaults to CONVEX_SITE_URL env var).
   * @param args.prefix - Optional URL prefix (defaults to "/.well-known/workflow").
   */
  async createWebhook(
    ctx: RunMutationCtx,
    args: {
      workflowId: WorkflowId;
      eventName: string;
      token?: string;
      validatorKey?: string;
      expiresAt?: number;
      ttlMs?: number;
      maxUses?: number;
      baseUrl?: string;
      prefix?: string;
    },
  ): Promise<{ token: string; url: string }> {
    const token = args.token;
    if (token !== undefined) assertValidWebhookToken(token);
    const prefix = normalizeWebhookPrefix(args.prefix);
    const baseUrl = normalizeWebhookBaseUrl(args.baseUrl ?? "");
    const expiresAt = resolveWebhookExpiry(args.expiresAt, args.ttlMs);
    const result = await ctx.runMutation(this.component.webhook.create, {
      workflowId: args.workflowId,
      eventName: args.eventName,
      token,
      validatorKey: args.validatorKey,
      expiresAt,
      maxUses: args.maxUses,
    });

    const url = buildWebhookUrl(baseUrl, prefix, result.token);

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
export function defineEvent<
  Name extends string,
  V extends Validator<unknown, "required", string>,
>(spec: { name: Name; validator: V }) {
  return spec;
}

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

type WebhookActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation"
>;

type WebhookBinding = {
  eventName: string;
  validatorKey?: string;
  expiresAt?: number;
  maxUses?: number;
  useCount?: number;
};

type WebhookRouteConfig = {
  component: WorkflowComponent;
  validators: Readonly<Record<string, WebhookPayloadValidator>>;
  prefix: string;
  maxBodyBytes: number;
  workpoolOptions?: WorkpoolOptions;
};

type WebhookLookup = {
  binding: WebhookBinding | null;
  serviceError: boolean;
};

type WebhookResume = {
  success: boolean;
  eventId?: string;
};

async function handleWebhookRequest(
  ctx: WebhookActionCtx,
  request: Request,
  config: WebhookRouteConfig,
): Promise<Response> {
  const token = extractWebhookToken(request.url, config.prefix);
  if (!token) return webhookResponse("Webhook unavailable", 404);

  const lookup = await lookupWebhook(ctx, config.component, token);
  if (lookup.serviceError) {
    return webhookResponse("Webhook service unavailable", 500);
  }
  const binding = lookup.binding;
  if (!binding || !isWebhookBindingActive(binding)) {
    return webhookResponse("Webhook unavailable", 404);
  }

  const validator = resolveWebhookValidator(config.validators, binding);
  if (!validator) return webhookResponse("Webhook configuration error", 500);

  const payload = await readAndValidateWebhookBody(
    request,
    validator,
    config.maxBodyBytes,
  );
  if (!payload.ok) return payload.response;

  const resumed = await resumeWebhookRequest(
    ctx,
    config.component,
    token,
    payload.value,
    config.workpoolOptions,
  );
  if (resumed.serviceError) {
    return webhookResponse("Webhook service unavailable", 500);
  }
  if (!resumed.result.success)
    return webhookResponse("Webhook unavailable", 404);
  return webhookResponse(
    JSON.stringify({ success: true, eventId: resumed.result.eventId }),
    202,
    true,
  );
}

async function lookupWebhook(
  ctx: WebhookActionCtx,
  component: WorkflowComponent,
  token: string,
): Promise<WebhookLookup> {
  try {
    const binding = await ctx.runQuery(component.webhook.getByToken, { token });
    return { binding, serviceError: false };
  } catch {
    return { binding: null, serviceError: true };
  }
}

function isWebhookBindingActive(binding: WebhookBinding): boolean {
  const now = Date.now();
  if (!isWebhookExpiryActive(binding.expiresAt, now)) return false;
  return isWebhookUseLimitActive(binding.maxUses, binding.useCount ?? 0);
}

function isWebhookExpiryActive(
  expiresAt: number | undefined,
  now: number,
): boolean {
  return (
    expiresAt === undefined || (Number.isFinite(expiresAt) && expiresAt > now)
  );
}

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

function resolveWebhookValidator(
  validators: Readonly<Record<string, WebhookPayloadValidator>>,
  binding: WebhookBinding,
): WebhookPayloadValidator | undefined {
  const key = binding.validatorKey ?? binding.eventName;
  return Object.prototype.hasOwnProperty.call(validators, key)
    ? validators[key]
    : undefined;
}

async function readAndValidateWebhookBody(
  request: Request,
  validator: WebhookPayloadValidator,
  maxBodyBytes: number,
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  try {
    const body = await readWebhookBody(request, maxBodyBytes);
    return { ok: true, value: await validateWebhookPayload(body, validator) };
  } catch (error) {
    if (error instanceof WebhookRequestError) {
      return {
        ok: false,
        response: webhookResponse(error.message, error.status),
      };
    }
    return {
      ok: false,
      response: webhookResponse("Invalid webhook payload", 400),
    };
  }
}

async function resumeWebhookRequest(
  ctx: WebhookActionCtx,
  component: WorkflowComponent,
  token: string,
  value: unknown,
  workpoolOptions: WorkpoolOptions | undefined,
): Promise<
  | { result: WebhookResume; serviceError: false }
  | { result: null; serviceError: true }
> {
  try {
    const result = await ctx.runMutation(component.webhook.resume, {
      token,
      value,
      workpoolOptions,
    });
    return { result, serviceError: false };
  } catch {
    return { result: null, serviceError: true };
  }
}

function normalizeWebhookPrefix(prefix: string | undefined): string {
  const normalized = prefix ?? "/.well-known/workflow";
  if (
    !normalized.startsWith("/") ||
    normalized.includes("?") ||
    normalized.includes("#") ||
    normalized.includes("\\") ||
    containsControlCharacters(normalized)
  ) {
    throw new Error("Webhook prefix must be an absolute URL path");
  }
  const withoutTrailingSlash = normalized.replace(/\/+$/u, "");
  if (!withoutTrailingSlash || withoutTrailingSlash.includes("//")) {
    throw new Error("Webhook prefix contains an unsafe path");
  }
  return withoutTrailingSlash;
}

function buildWebhookUrl(
  baseUrl: string,
  prefix: string,
  token: string,
): string {
  if (baseUrl === "") return `${prefix}/webhook/${token}`;
  return `${baseUrl}${prefix}/webhook/${token}`;
}

function normalizeWebhookBaseUrl(baseUrl: string): string {
  if (baseUrl === "") return "";
  assertSafeWebhookBaseUrl(baseUrl);
  const parsed = parseWebhookBaseUrl(baseUrl);
  assertAllowedWebhookBaseUrl(parsed);
  return baseUrl.replace(/\/+$/u, "");
}

function assertSafeWebhookBaseUrl(baseUrl: string): void {
  if (
    baseUrl.trim() !== baseUrl ||
    baseUrl.includes("?") ||
    baseUrl.includes("#") ||
    baseUrl.includes("\\") ||
    containsControlCharacters(baseUrl)
  ) {
    throw new Error("Webhook baseUrl contains unsafe characters");
  }
}

function parseWebhookBaseUrl(baseUrl: string): URL {
  try {
    return new URL(baseUrl);
  } catch {
    throw new Error("Webhook baseUrl must be an absolute HTTP(S) URL");
  }
}

function assertAllowedWebhookBaseUrl(parsed: URL): void {
  const hasUnsafeProtocol =
    parsed.protocol !== "https:" && parsed.protocol !== "http:";
  const hasCredentials = Boolean(parsed.username || parsed.password);
  const hasSuffix = Boolean(parsed.search || parsed.hash);
  if (hasUnsafeProtocol || hasCredentials || hasSuffix) {
    throw new Error(
      "Webhook baseUrl must be an HTTP(S) URL without credentials, query, or fragment",
    );
  }
}

function containsControlCharacters(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function extractWebhookToken(
  requestUrl: string,
  prefix: string,
): string | undefined {
  let pathname: string;
  try {
    pathname = new URL(requestUrl).pathname;
  } catch {
    return undefined;
  }
  const routePrefix = `${prefix}/webhook/`;
  if (!pathname.startsWith(routePrefix)) return undefined;
  const token = pathname.slice(routePrefix.length);
  if (!token || token.includes("/")) return undefined;
  try {
    const decodedToken = decodeURIComponent(token);
    return isWebhookTokenPathSegment(decodedToken) ? decodedToken : undefined;
  } catch {
    return undefined;
  }
}

function webhookResponse(
  body: string,
  status: number,
  bodyIsJson = false,
): Response {
  return new Response(bodyIsJson ? body : JSON.stringify({ error: body }), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}

function resolveWebhookExpiry(
  expiresAt: number | undefined,
  ttlMs: number | undefined,
): number | undefined {
  if (expiresAt !== undefined && ttlMs !== undefined) {
    throw new Error("Specify expiresAt or ttlMs, not both");
  }
  if (ttlMs === undefined) return expiresAt;
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
    throw new Error("Webhook ttlMs must be a positive integer");
  }
  const expiry = Date.now() + ttlMs;
  if (!Number.isSafeInteger(expiry)) {
    throw new Error("Webhook ttlMs is too large");
  }
  return expiry;
}
