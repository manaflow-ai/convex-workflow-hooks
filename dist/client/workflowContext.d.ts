import type { RetryOption } from "@convex-dev/workpool";
import { BaseChannel } from "async-channel";
import type { FunctionArgs, FunctionReference, FunctionReturnType, FunctionType, FunctionVisibility } from "convex/server";
import type { Validator } from "convex/values";
import type { EventId, SchedulerOptions, WorkflowId } from "../types.js";
import type { StepRequest } from "./step.js";
import type { Hook, HookOptions, TypedHook } from "./hooks.js";
export type RunOptions = {
    /**
     * The name of the function. By default, if you pass in api.foo.bar.baz,
     * it will use "foo/bar:baz" as the name. If you pass in a function handle,
     * it will use the function handle directly.
     */
    name?: string;
} & SchedulerOptions;
export type WorkflowCtx = {
    /**
     * The ID of the workflow currently running.
     */
    workflowId: WorkflowId;
    /**
     * Run a query with the given name and arguments.
     *
     * @param query - The query to run, like `internal.index.exampleQuery`.
     * @param args - The arguments to the query function.
     * @param opts - Options for scheduling and naming the query.
     */
    runQuery<Query extends FunctionReference<"query", FunctionVisibility>>(query: Query, ...args: OptionalRestArgs<RunOptions, Query>): Promise<FunctionReturnType<Query>>;
    /**
     * Run a mutation with the given name and arguments.
     *
     * @param mutation - The mutation to run, like `internal.index.exampleMutation`.
     * @param args - The arguments to the mutation function.
     * @param opts - Options for scheduling and naming the mutation.
     */
    runMutation<Mutation extends FunctionReference<"mutation", FunctionVisibility>>(mutation: Mutation, ...args: OptionalRestArgs<RunOptions, Mutation>): Promise<FunctionReturnType<Mutation>>;
    /**
     * Run an action with the given name and arguments.
     *
     * @param action - The action to run, like `internal.index.exampleAction`.
     * @param args - The arguments to the action function.
     * @param opts - Options for retrying, scheduling and naming the action.
     */
    runAction<Action extends FunctionReference<"action", FunctionVisibility>>(action: Action, ...args: OptionalRestArgs<RunOptions & RetryOption, Action>): Promise<FunctionReturnType<Action>>;
    /**
     * Run a workflow with the given name and arguments.
     *
     * @param workflow - The workflow to run, like `internal.index.exampleWorkflow`.
     * @param args - The arguments to the workflow function.
     * @param opts - Options for retrying, scheduling and naming the workflow.
     */
    runWorkflow<Workflow extends FunctionReference<"mutation", "internal">>(workflow: Workflow, args: FunctionArgs<Workflow>["args"], opts?: RunOptions): Promise<FunctionReturnType<Workflow>>;
    /**
     * Blocks until a matching event is sent to this workflow.
     *
     * If an ID is specified, an event with that ID must already exist and must
     * not already be "awaited" or "consumed".
     *
     * If a name is specified, the first available event is consumed that matches
     * the name. If there is no available event, it will create one with that name
     * with status "awaited".
     * @param event
     */
    awaitEvent<T = unknown, Name extends string = string>(event: ({
        name: Name;
        id?: EventId<Name>;
    } | {
        name?: Name;
        id: EventId<Name>;
    }) & {
        validator?: Validator<T, any, any>;
    }): Promise<T>;
    /**
     * Creates a hook that can be awaited or iterated over.
     *
     * This is the low-level API for creating hooks. For type-safe hooks,
     * use `defineHook()` and pass the result to this method.
     *
     * @example Simple hook:
     * ```ts
     * const hook = ctx.createHook<{ approved: boolean }>({ name: "approval" });
     * const result = await hook;
     * ```
     *
     * @example With defineHook for type safety:
     * ```ts
     * const approvalHook = defineHook<{ approved: boolean }>();
     * const hook = ctx.createHook(approvalHook, { name: "approval" });
     * const result = await hook; // Fully typed
     * ```
     *
     * @example Iterating over multiple events:
     * ```ts
     * const hook = ctx.createHook<Message>({ name: "messages" });
     * for await (const message of hook) {
     *   console.log("Received:", message);
     *   if (message.type === "done") break;
     * }
     * ```
     */
    createHook<T = unknown>(hookOrOptions: TypedHook<unknown, T> | (HookOptions & {
        name: string;
    }), options?: HookOptions): Hook<T>;
};
export type OptionalRestArgs<Opts, FuncRef extends FunctionReference<FunctionType, FunctionVisibility>> = FuncRef["_args"] extends Record<string, never> ? [args?: Record<string, never>, opts?: Opts] : [args: FuncRef["_args"], opts?: Opts];
export declare function createWorkflowCtx(workflowId: WorkflowId, sender: BaseChannel<StepRequest>): {
    workflowId: WorkflowId;
    runQuery: <Query extends FunctionReference<"query", FunctionVisibility>>(query: Query, args: OptionalRestArgs<RunOptions, Query>[0], opts?: OptionalRestArgs<RunOptions, Query>[1] | undefined) => Promise<unknown>;
    runMutation: <Mutation extends FunctionReference<"mutation", FunctionVisibility>>(mutation: Mutation, args: OptionalRestArgs<RunOptions, Mutation>[0], opts?: OptionalRestArgs<RunOptions, Mutation>[1] | undefined) => Promise<unknown>;
    runAction: <Action extends FunctionReference<"action", FunctionVisibility>>(action: Action, args: OptionalRestArgs<RunOptions & RetryOption, Action>[0], opts?: OptionalRestArgs<RunOptions & RetryOption, Action>[1] | undefined) => Promise<unknown>;
    runWorkflow: <Workflow extends FunctionReference<"mutation", "internal">>(workflow: Workflow, args: FunctionArgs<Workflow>["args"], opts?: RunOptions | undefined) => Promise<unknown>;
    awaitEvent: <T = unknown, Name extends string = string>(event: ({
        name: Name;
        id?: EventId<Name>;
    } | {
        name?: Name;
        id: EventId<Name>;
    }) & {
        validator?: Validator<T, any, any>;
    }) => Promise<any>;
    createHook: <T>(hookOrOptions: TypedHook<unknown, T> | (HookOptions & {
        name: string;
    }), options?: HookOptions) => Hook<T>;
};
//# sourceMappingURL=workflowContext.d.ts.map