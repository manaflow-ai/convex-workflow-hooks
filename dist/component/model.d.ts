import type { QueryCtx } from "./_generated/server.js";
export declare function getWorkflow(ctx: QueryCtx, workflowIdStr: string, expectedGenerationNumber: number | null): Promise<{
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
}>;
export declare function getJournalEntry(ctx: QueryCtx, journalIdStr: string): Promise<{
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
//# sourceMappingURL=model.d.ts.map