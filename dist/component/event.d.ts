import { type MutationCtx } from "./_generated/server.js";
import type { Doc, Id } from "./_generated/dataModel.js";
import { getWorkpool } from "./pool.js";
export declare function awaitEvent(ctx: MutationCtx, entry: Doc<"steps">, args: {
    eventId?: Id<"events">;
    name: string;
}): Promise<{
    _id: import("convex/values").GenericId<"steps">;
    _creationTime: number;
    workflowId: import("convex/values").GenericId<"workflows">;
    stepNumber: number;
    step: {
        kind?: "function" | undefined;
        runResult?: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        } | undefined;
        completedAt?: number | undefined;
        workId?: import("@convex-dev/workpool").WorkId | undefined;
        name: string;
        args: any;
        startedAt: number;
        functionType: "query" | "mutation" | "action";
        handle: string;
        inProgress: boolean;
        argsSize: number;
    } | {
        workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
        runResult?: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        } | undefined;
        completedAt?: number | undefined;
        kind: "workflow";
        name: string;
        args: any;
        startedAt: number;
        handle: string;
        inProgress: boolean;
        argsSize: number;
    } | {
        runResult?: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        } | undefined;
        completedAt?: number | undefined;
        eventId?: import("convex/values").GenericId<"events"> | undefined;
        kind: "event";
        name: string;
        args: {
            eventId?: import("convex/values").GenericId<"events"> | undefined;
        };
        startedAt: number;
        inProgress: boolean;
        argsSize: number;
    };
}>;
/**
 * Internal helper to send an event. Exported for use by webhook.ts
 */
export declare function sendEventInternal(ctx: MutationCtx, args: {
    workflowId?: Id<"workflows">;
    eventId?: Id<"events">;
    name?: string;
    result: {
        kind: "success";
        returnValue: unknown;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
    workpoolOptions?: Parameters<typeof getWorkpool>[1];
}): Promise<Id<"events">>;
export declare const send: import("convex/server").RegisteredMutation<"public", {
    workflowId?: import("convex/values").GenericId<"workflows"> | undefined;
    name?: string | undefined;
    eventId?: import("convex/values").GenericId<"events"> | undefined;
    workpoolOptions?: {
        logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined;
        maxParallelism?: number | undefined;
        defaultRetryBehavior?: {
            maxAttempts: number;
            initialBackoffMs: number;
            base: number;
        } | undefined;
        retryActionsByDefault?: boolean | undefined;
    } | undefined;
    result: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
}, Promise<Id<"events">>>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
    name: string;
}, Promise<import("convex/values").GenericId<"events">>>;
//# sourceMappingURL=event.d.ts.map