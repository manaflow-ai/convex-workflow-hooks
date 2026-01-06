import { type RunResult, type WorkId } from "@convex-dev/workpool";
import { type Validator, type Value, type VString } from "convex/values";
export type WorkflowId = string & {
    __isWorkflowId: true;
};
export declare const vWorkflowId: VString<WorkflowId>;
export type EventId<Name extends string = string> = string & {
    __isEventId: true;
    __name: Name;
};
export type VEventId<Name extends string> = VString<EventId<Name>>;
export declare const vEventId: <Name extends string = string>(_name?: Name) => VString<EventId<Name>>;
export type WorkflowStep = {
    workflowId: WorkflowId;
    name: string;
    stepId: string;
    stepNumber: number;
    args: unknown;
    runResult?: RunResult;
    startedAt: number;
    completedAt?: number;
} & ({
    kind: "function";
    workId: WorkId;
} | {
    kind: "workflow";
    nestedWorkflowId: WorkflowId;
} | {
    kind: "event";
    eventId: EventId;
});
export declare const vWorkflowStep: import("convex/values").VObject<{
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
    workId?: WorkId | undefined;
    nestedWorkflowId?: WorkflowId | undefined;
    eventId?: EventId<string> | undefined;
    kind: "function" | "workflow" | "event";
    workflowId: WorkflowId;
    name: string;
    stepId: string;
    stepNumber: number;
    args: any;
    startedAt: number;
}, {
    workflowId: VString<WorkflowId, "required">;
    name: VString<string, "required">;
    stepId: VString<string, "required">;
    stepNumber: import("convex/values").VFloat64<number, "required">;
    args: import("convex/values").VAny<any, "required", string>;
    runResult: import("convex/values").VUnion<{
        kind: "success";
        returnValue: any;
    } | {
        kind: "failed";
        error: string;
    } | {
        kind: "canceled";
    } | undefined, [import("convex/values").VObject<{
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
    }, "required", "kind">], "optional", "kind" | "returnValue" | `returnValue.${string}` | "error">;
    startedAt: import("convex/values").VFloat64<number, "required">;
    completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    kind: import("convex/values").VUnion<"function" | "workflow" | "event", [import("convex/values").VLiteral<"function", "required">, import("convex/values").VLiteral<"workflow", "required">, import("convex/values").VLiteral<"event", "required">], "required", never>;
    workId: VString<WorkId | undefined, "optional">;
    nestedWorkflowId: VString<WorkflowId | undefined, "optional">;
    eventId: VString<EventId<string> | undefined, "optional">;
}, "required", "kind" | "workflowId" | "name" | "stepId" | "stepNumber" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | "nestedWorkflowId" | "eventId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error">;
export type SchedulerOptions = {
    /**
     * The time (ms since epoch) to run the action at.
     * If not provided, the action will be run as soon as possible.
     * Note: this is advisory only. It may run later.
     */
    runAt?: number;
} | {
    /**
     * The number of milliseconds to run the action after.
     * If not provided, the action will be run as soon as possible.
     * Note: this is advisory only. It may run later.
     */
    runAfter?: number;
};
export type OnCompleteArgs = {
    /**
     * The ID of the work that completed.
     */
    workflowId: string;
    /**
     * The context object passed when enqueuing the work.
     * Useful for passing data from the enqueue site to the onComplete site.
     */
    context: unknown;
    /**
     * The result of the run that completed.
     */
    result: RunResult;
};
export declare function vPaginationResult<T extends Validator<Value, "required", string>>(itemValidator: T): import("convex/values").VObject<{
    splitCursor?: string | null | undefined;
    pageStatus?: "SplitRecommended" | "SplitRequired" | null | undefined;
    page: T["type"][];
    continueCursor: string;
    isDone: boolean;
}, {
    page: import("convex/values").VArray<T["type"][], T, "required">;
    continueCursor: VString<string, "required">;
    isDone: import("convex/values").VBoolean<boolean, "required">;
    splitCursor: import("convex/values").VUnion<string | null | undefined, [VString<string, "required">, import("convex/values").VNull<null, "required">], "optional", never>;
    pageStatus: import("convex/values").VUnion<"SplitRecommended" | "SplitRequired" | null | undefined, [import("convex/values").VLiteral<"SplitRecommended", "required">, import("convex/values").VLiteral<"SplitRequired", "required">, import("convex/values").VNull<null, "required">], "optional", never>;
}, "required", "page" | "continueCursor" | "isDone" | "splitCursor" | "pageStatus">;
//# sourceMappingURL=types.d.ts.map