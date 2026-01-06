import { type WorkId } from "@convex-dev/workpool";
export declare const load: import("convex/server").RegisteredQuery<"public", {
    shortCircuit?: boolean | undefined;
    workflowId: import("convex/values").GenericId<"workflows">;
}, Promise<{
    journalEntries: {
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
            workId?: WorkId | undefined;
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
    blocked: boolean;
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
    logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
    ok: boolean;
} | {
    journalEntries: {
        workflowId: import("convex/values").GenericId<"workflows">;
        stepNumber: number;
        _id: string;
        _creationTime: number;
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
            workId?: WorkId | undefined;
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
    logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
    ok: boolean;
    blocked?: undefined;
}>>;
export declare const startSteps: import("convex/server").RegisteredMutation<"public", {
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
    workflowId: string;
    generationNumber: number;
    steps: {
        retry?: boolean | {
            maxAttempts: number;
            initialBackoffMs: number;
            base: number;
        } | undefined;
        schedulerOptions?: {
            runAt?: number | undefined;
        } | {
            runAfter?: number | undefined;
        } | undefined;
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
            workId?: WorkId | undefined;
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
}, Promise<{
    workflowId: import("convex/values").GenericId<"workflows">;
    stepNumber: number;
    _id: string;
    _creationTime: number;
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
        workId?: WorkId | undefined;
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
}[]>>;
//# sourceMappingURL=journal.d.ts.map