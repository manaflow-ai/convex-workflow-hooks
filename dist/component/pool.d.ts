import { Workpool, type WorkId, type WorkpoolOptions } from "@convex-dev/workpool";
import { type FunctionReference, type RegisteredAction } from "convex/server";
import { type Infer } from "convex/values";
import { type MutationCtx } from "./_generated/server.js";
import type { Doc } from "./_generated/dataModel.js";
import { type WorkflowId } from "../types.js";
export declare const workpoolOptions: import("convex/values").VObject<{
    logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined;
    maxParallelism?: number | undefined;
    defaultRetryBehavior?: {
        maxAttempts: number;
        initialBackoffMs: number;
        base: number;
    } | undefined;
    retryActionsByDefault?: boolean | undefined;
}, {
    logLevel: import("convex/values").VUnion<"DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined, [import("convex/values").VLiteral<"DEBUG", "required">, import("convex/values").VLiteral<"TRACE", "required">, import("convex/values").VLiteral<"INFO", "required">, import("convex/values").VLiteral<"REPORT", "required">, import("convex/values").VLiteral<"WARN", "required">, import("convex/values").VLiteral<"ERROR", "required">], "optional", never>;
    maxParallelism: import("convex/values").VFloat64<number | undefined, "optional">;
    defaultRetryBehavior: import("convex/values").VObject<{
        maxAttempts: number;
        initialBackoffMs: number;
        base: number;
    } | undefined, {
        maxAttempts: import("convex/values").VFloat64<number, "required">;
        initialBackoffMs: import("convex/values").VFloat64<number, "required">;
        base: import("convex/values").VFloat64<number, "required">;
    }, "optional", "maxAttempts" | "initialBackoffMs" | "base">;
    retryActionsByDefault: import("convex/values").VBoolean<boolean | undefined, "optional">;
}, "required", "logLevel" | "maxParallelism" | "defaultRetryBehavior" | "retryActionsByDefault" | "defaultRetryBehavior.maxAttempts" | "defaultRetryBehavior.initialBackoffMs" | "defaultRetryBehavior.base">;
export declare const DEFAULT_MAX_PARALLELISM = 25;
export declare const DEFAULT_RETRY_BEHAVIOR: {
    maxAttempts: number;
    initialBackoffMs: number;
    base: number;
};
export declare function getWorkpool(ctx: MutationCtx, opts: WorkpoolOptions | undefined): Promise<Workpool>;
declare const onCompleteContext: import("convex/values").VObject<{
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
    stepId: import("convex/values").GenericId<"steps">;
    generationNumber: number;
}, {
    generationNumber: import("convex/values").VFloat64<number, "required">;
    stepId: import("convex/values").VId<import("convex/values").GenericId<"steps">, "required">;
    workpoolOptions: import("convex/values").VObject<{
        logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined;
        maxParallelism?: number | undefined;
        defaultRetryBehavior?: {
            maxAttempts: number;
            initialBackoffMs: number;
            base: number;
        } | undefined;
        retryActionsByDefault?: boolean | undefined;
    } | undefined, {
        logLevel: import("convex/values").VUnion<"DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined, [import("convex/values").VLiteral<"DEBUG", "required">, import("convex/values").VLiteral<"TRACE", "required">, import("convex/values").VLiteral<"INFO", "required">, import("convex/values").VLiteral<"REPORT", "required">, import("convex/values").VLiteral<"WARN", "required">, import("convex/values").VLiteral<"ERROR", "required">], "optional", never>;
        maxParallelism: import("convex/values").VFloat64<number | undefined, "optional">;
        defaultRetryBehavior: import("convex/values").VObject<{
            maxAttempts: number;
            initialBackoffMs: number;
            base: number;
        } | undefined, {
            maxAttempts: import("convex/values").VFloat64<number, "required">;
            initialBackoffMs: import("convex/values").VFloat64<number, "required">;
            base: import("convex/values").VFloat64<number, "required">;
        }, "optional", "maxAttempts" | "initialBackoffMs" | "base">;
        retryActionsByDefault: import("convex/values").VBoolean<boolean | undefined, "optional">;
    }, "optional", "logLevel" | "maxParallelism" | "defaultRetryBehavior" | "retryActionsByDefault" | "defaultRetryBehavior.maxAttempts" | "defaultRetryBehavior.initialBackoffMs" | "defaultRetryBehavior.base">;
}, "required", "stepId" | "generationNumber" | "workpoolOptions" | "workpoolOptions.logLevel" | "workpoolOptions.maxParallelism" | "workpoolOptions.defaultRetryBehavior" | "workpoolOptions.retryActionsByDefault" | "workpoolOptions.defaultRetryBehavior.maxAttempts" | "workpoolOptions.defaultRetryBehavior.initialBackoffMs" | "workpoolOptions.defaultRetryBehavior.base">;
export type OnCompleteContext = Infer<typeof onCompleteContext>;
export declare const onComplete: import("convex/server").RegisteredMutation<"internal", {
    workId: WorkId;
    context: any;
    result: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
}, Promise<void>>;
export declare const nestedWorkflowOnComplete: import("convex/server").RegisteredMutation<"internal", {
    workflowId: WorkflowId;
    context: any;
    result: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
}, Promise<void>>;
export declare function enqueueWorkflow(ctx: MutationCtx, workflow: Doc<"workflows">, workpool: Workpool): Promise<void>;
export type OnComplete = typeof onComplete extends RegisteredAction<"public", infer Args, infer ReturnValue> ? FunctionReference<"action", "internal", Args, ReturnValue> : never;
export declare const handlerOnComplete: import("convex/server").RegisteredMutation<"internal", {
    workId: WorkId;
    context: any;
    result: {
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    };
}, Promise<void>>;
export {};
//# sourceMappingURL=pool.d.ts.map