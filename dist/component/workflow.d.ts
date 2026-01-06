import { type PaginationResult } from "convex/server";
import { type Infer } from "convex/values";
import { type MutationCtx } from "./_generated/server.js";
import { type WorkflowId, type EventId, type SchedulerOptions } from "../types.js";
declare const createArgs: import("convex/values").VObject<{
    onComplete?: {
        context?: any;
        fnHandle: string;
    } | undefined;
    maxParallelism?: number | undefined;
    startAsync?: boolean | undefined;
    workflowHandle: string;
    workflowArgs: any;
    workflowName: string;
}, {
    workflowName: import("convex/values").VString<string, "required">;
    workflowHandle: import("convex/values").VString<string, "required">;
    workflowArgs: import("convex/values").VAny<any, "required", string>;
    maxParallelism: import("convex/values").VFloat64<number | undefined, "optional">;
    onComplete: import("convex/values").VObject<{
        context?: any;
        fnHandle: string;
    } | undefined, {
        fnHandle: import("convex/values").VString<string, "required">;
        context: import("convex/values").VAny<any, "optional", string>;
    }, "optional", "fnHandle" | "context" | `context.${string}`>;
    startAsync: import("convex/values").VBoolean<boolean | undefined, "optional">;
}, "required", "workflowHandle" | "onComplete" | "onComplete.fnHandle" | "onComplete.context" | `onComplete.context.${string}` | "maxParallelism" | "startAsync" | "workflowArgs" | "workflowName" | `workflowArgs.${string}`>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    onComplete?: {
        context?: any;
        fnHandle: string;
    } | undefined;
    maxParallelism?: number | undefined;
    startAsync?: boolean | undefined;
    workflowHandle: string;
    workflowArgs: any;
    workflowName: string;
}, Promise<import("convex/values").GenericId<"workflows">>>;
export declare function createHandler(ctx: MutationCtx, args: Infer<typeof createArgs>, schedulerOptions?: SchedulerOptions): Promise<import("convex/values").GenericId<"workflows">>;
export declare const getStatus: import("convex/server").RegisteredQuery<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
}, Promise<{
    workflow: {
        _id: import("convex/values").GenericId<"workflows">;
        _creationTime: number;
        name?: string | undefined;
        runResult?: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        } | undefined;
        startedAt?: null | undefined;
        onComplete?: {
            context?: any;
            fnHandle: string;
        } | undefined;
        logLevel?: null | undefined;
        state?: null | undefined;
        args: any;
        workflowHandle: string;
        generationNumber: number;
    };
    inProgress: {
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
    }[];
    logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
}>>;
export declare const listSteps: import("convex/server").RegisteredQuery<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
    order: "asc" | "desc";
    paginationOpts: {
        id?: number;
        endCursor?: string | null;
        maximumRowsRead?: number;
        maximumBytesRead?: number;
        numItems: number;
        cursor: string | null;
    };
}, Promise<PaginationResult<{
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
    nestedWorkflowId?: WorkflowId | undefined;
    eventId?: EventId<string> | undefined;
    kind: "function" | "workflow" | "event";
    workflowId: WorkflowId;
    name: string;
    stepId: string;
    stepNumber: number;
    args: any;
    startedAt: number;
}>>>;
export declare const cancel: import("convex/server").RegisteredMutation<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
}, Promise<void>>;
declare const completeArgs: import("convex/values").VObject<{
    workflowId: import("convex/values").GenericId<"workflows">;
    runResult: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
    generationNumber: number;
}, {
    workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
    generationNumber: import("convex/values").VFloat64<number, "required">;
    runResult: import("convex/values").VUnion<{
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    }, [import("convex/values").VObject<{
        kind: "success";
        returnValue: any;
    }, {
        kind: import("convex/values").VLiteral<"success", "required">;
        returnValue: import("convex/values").VAny<any, "required", string>;
    }, "required", "kind" | "returnValue" | `returnValue.${string}`>, import("convex/values").VObject<{
        kind: "failed";
        error: string;
    }, {
        kind: import("convex/values").VLiteral<"failed", "required">;
        error: import("convex/values").VString<string, "required">;
    }, "required", "kind" | "error">, import("convex/values").VObject<{
        kind: "canceled";
    }, {
        kind: import("convex/values").VLiteral<"canceled", "required">;
    }, "required", "kind">], "required", "kind" | "returnValue" | `returnValue.${string}` | "error">;
}, "required", "workflowId" | "runResult" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "generationNumber">;
export declare const complete: import("convex/server").RegisteredMutation<"public", {
    workflowId: import("convex/values").GenericId<"workflows">;
    runResult: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
    generationNumber: number;
}, Promise<void>>;
export declare function completeHandler(ctx: MutationCtx, args: Infer<typeof completeArgs>): Promise<void>;
export declare const cleanup: import("convex/server").RegisteredMutation<"public", {
    workflowId: string;
}, Promise<boolean>>;
export {};
//# sourceMappingURL=workflow.d.ts.map