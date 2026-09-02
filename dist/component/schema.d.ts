import { type RunResult } from "@convex-dev/workpool";
import { type Infer, type Value } from "convex/values";
export declare function valueSize(value: Value): number;
export declare function resultSize(result: RunResult): number;
export declare const vOnComplete: import("convex/values").VObject<{
    context?: any;
    fnHandle: string;
}, {
    fnHandle: import("convex/values").VString<string, "required">;
    context: import("convex/values").VAny<any, "optional", string>;
}, "required", "fnHandle" | "context" | `context.${string}`>;
export type OnComplete = Infer<typeof vOnComplete>;
export declare const workflowDocument: import("convex/values").VObject<{
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
    _id: string;
    _creationTime: number;
    workflowHandle: string;
    generationNumber: number;
}, {
    name: import("convex/values").VString<string | undefined, "optional">;
    workflowHandle: import("convex/values").VString<string, "required">;
    args: import("convex/values").VAny<any, "required", string>;
    onComplete: import("convex/values").VObject<{
        context?: any;
        fnHandle: string;
    } | undefined, {
        fnHandle: import("convex/values").VString<string, "required">;
        context: import("convex/values").VAny<any, "optional", string>;
    }, "optional", "fnHandle" | "context" | `context.${string}`>;
    logLevel: import("convex/values").Validator<null, "optional">;
    startedAt: import("convex/values").Validator<null, "optional">;
    state: import("convex/values").Validator<null, "optional">;
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
    generationNumber: import("convex/values").VFloat64<number, "required">;
    _id: import("convex/values").VString<string, "required">;
    _creationTime: import("convex/values").VFloat64<number, "required">;
}, "required", "name" | "args" | "runResult" | "startedAt" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "_id" | "_creationTime" | "workflowHandle" | "onComplete" | "logLevel" | "state" | "generationNumber" | `startedAt.${string}` | "onComplete.fnHandle" | "onComplete.context" | `onComplete.context.${string}` | `logLevel.${string}` | `state.${string}`>;
export type Workflow = Infer<typeof workflowDocument>;
export declare const step: import("convex/values").VUnion<{
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
}, [import("convex/values").VObject<{
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
}, {
    name: import("convex/values").VString<string, "required">;
    inProgress: import("convex/values").VBoolean<boolean, "required">;
    argsSize: import("convex/values").VFloat64<number, "required">;
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
    kind: import("convex/values").VLiteral<"function" | undefined, "optional">;
    functionType: import("convex/values").VUnion<"query" | "mutation" | "action", NoInfer<[import("convex/values").VLiteral<"query", "required">, import("convex/values").VLiteral<"mutation", "required">, import("convex/values").VLiteral<"action", "required">]>, "required", never>;
    handle: import("convex/values").VString<string, "required">;
    workId: import("convex/values").VString<import("@convex-dev/workpool").WorkId | undefined, "optional">;
}, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
}, {
    name: import("convex/values").VString<string, "required">;
    inProgress: import("convex/values").VBoolean<boolean, "required">;
    argsSize: import("convex/values").VFloat64<number, "required">;
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
    kind: import("convex/values").VLiteral<"workflow", "required">;
    handle: import("convex/values").VString<string, "required">;
    workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows"> | undefined, "optional">;
}, "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
}, {
    eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
    args: import("convex/values").VObject<{
        eventId?: import("convex/values").GenericId<"events"> | undefined;
    }, {
        eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
    }, "required", "eventId">;
    name: import("convex/values").VString<string, "required">;
    inProgress: import("convex/values").VBoolean<boolean, "required">;
    argsSize: import("convex/values").VFloat64<number, "required">;
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
    kind: import("convex/values").VLiteral<"event", "required">;
}, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "eventId" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "inProgress" | "argsSize" | "args.eventId">], "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | "eventId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">;
export type Step = Infer<typeof step>;
export declare function journalEntrySize(entry: JournalEntry): number;
export declare const journalDocument: import("convex/values").VObject<{
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
}, {
    workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
    stepNumber: import("convex/values").VFloat64<number, "required">;
    step: import("convex/values").VUnion<{
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
    }, [import("convex/values").VObject<{
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
    }, {
        name: import("convex/values").VString<string, "required">;
        inProgress: import("convex/values").VBoolean<boolean, "required">;
        argsSize: import("convex/values").VFloat64<number, "required">;
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
        kind: import("convex/values").VLiteral<"function" | undefined, "optional">;
        functionType: import("convex/values").VUnion<"query" | "mutation" | "action", NoInfer<[import("convex/values").VLiteral<"query", "required">, import("convex/values").VLiteral<"mutation", "required">, import("convex/values").VLiteral<"action", "required">]>, "required", never>;
        handle: import("convex/values").VString<string, "required">;
        workId: import("convex/values").VString<import("@convex-dev/workpool").WorkId | undefined, "optional">;
    }, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
    }, {
        name: import("convex/values").VString<string, "required">;
        inProgress: import("convex/values").VBoolean<boolean, "required">;
        argsSize: import("convex/values").VFloat64<number, "required">;
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
        kind: import("convex/values").VLiteral<"workflow", "required">;
        handle: import("convex/values").VString<string, "required">;
        workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows"> | undefined, "optional">;
    }, "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
    }, {
        eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
        args: import("convex/values").VObject<{
            eventId?: import("convex/values").GenericId<"events"> | undefined;
        }, {
            eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
        }, "required", "eventId">;
        name: import("convex/values").VString<string, "required">;
        inProgress: import("convex/values").VBoolean<boolean, "required">;
        argsSize: import("convex/values").VFloat64<number, "required">;
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
        kind: import("convex/values").VLiteral<"event", "required">;
    }, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "eventId" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "inProgress" | "argsSize" | "args.eventId">], "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | "eventId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">;
    _id: import("convex/values").VString<string, "required">;
    _creationTime: import("convex/values").VFloat64<number, "required">;
}, "required", "workflowId" | "stepNumber" | "_id" | "_creationTime" | "step" | "step.kind" | "step.workflowId" | "step.name" | "step.args" | "step.runResult" | "step.startedAt" | "step.completedAt" | "step.workId" | "step.eventId" | `step.args.${string}` | "step.runResult.kind" | "step.runResult.returnValue" | `step.runResult.returnValue.${string}` | "step.runResult.error" | "step.functionType" | "step.handle" | "step.inProgress" | "step.argsSize">;
export type JournalEntry = Infer<typeof journalDocument>;
export declare const event: {
    workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
    name: import("convex/values").VString<string, "required">;
    state: import("convex/values").VUnion<{
        kind: "created";
    } | {
        kind: "sent";
        result: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        };
        sentAt: number;
    } | {
        kind: "waiting";
        stepId: import("convex/values").GenericId<"steps">;
        waitingAt: number;
    } | {
        kind: "consumed";
        stepId: import("convex/values").GenericId<"steps">;
        sentAt: number;
        waitingAt: number;
        consumedAt: number;
    }, [import("convex/values").VObject<{
        kind: "created";
    }, {
        kind: import("convex/values").VLiteral<"created", "required">;
    }, "required", "kind">, import("convex/values").VObject<{
        kind: "sent";
        result: {
            kind: "success";
            returnValue: any;
        } | {
            kind: "failed";
            error: string;
        } | {
            kind: "canceled";
        };
        sentAt: number;
    }, {
        kind: import("convex/values").VLiteral<"sent", "required">;
        result: import("convex/values").VUnion<{
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
        sentAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "kind" | "result" | "sentAt" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error">, import("convex/values").VObject<{
        kind: "waiting";
        stepId: import("convex/values").GenericId<"steps">;
        waitingAt: number;
    }, {
        kind: import("convex/values").VLiteral<"waiting", "required">;
        waitingAt: import("convex/values").VFloat64<number, "required">;
        stepId: import("convex/values").VId<import("convex/values").GenericId<"steps">, "required">;
    }, "required", "kind" | "stepId" | "waitingAt">, import("convex/values").VObject<{
        kind: "consumed";
        stepId: import("convex/values").GenericId<"steps">;
        sentAt: number;
        waitingAt: number;
        consumedAt: number;
    }, {
        kind: import("convex/values").VLiteral<"consumed", "required">;
        waitingAt: import("convex/values").VFloat64<number, "required">;
        sentAt: import("convex/values").VFloat64<number, "required">;
        consumedAt: import("convex/values").VFloat64<number, "required">;
        stepId: import("convex/values").VId<import("convex/values").GenericId<"steps">, "required">;
    }, "required", "kind" | "stepId" | "sentAt" | "waitingAt" | "consumedAt">], "required", "kind" | "stepId" | "result" | "sentAt" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error" | "waitingAt" | "consumedAt">;
};
export declare const webhook: {
    token: import("convex/values").VString<string | undefined, "optional">;
    tokenHash: import("convex/values").VString<string | undefined, "optional">;
    workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
    eventName: import("convex/values").VString<string, "required">;
    createdAt: import("convex/values").VFloat64<number, "required">;
    validatorKey: import("convex/values").VString<string | undefined, "optional">;
    expiresAt: import("convex/values").VFloat64<number | undefined, "optional">;
    maxUses: import("convex/values").VFloat64<number | undefined, "optional">;
    useCount: import("convex/values").VFloat64<number | undefined, "optional">;
};
declare const _default: import("convex/server").SchemaDefinition<{
    config: import("convex/server").TableDefinition<import("convex/values").VObject<{
        logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined;
        maxParallelism?: number | undefined;
    }, {
        logLevel: import("convex/values").VUnion<"DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR" | undefined, [import("convex/values").VLiteral<"DEBUG", "required">, import("convex/values").VLiteral<"TRACE", "required">, import("convex/values").VLiteral<"INFO", "required">, import("convex/values").VLiteral<"REPORT", "required">, import("convex/values").VLiteral<"WARN", "required">, import("convex/values").VLiteral<"ERROR", "required">], "optional", never>;
        maxParallelism: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "logLevel" | "maxParallelism">, {}, {}, {}>;
    workflows: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        name: import("convex/values").VString<string | undefined, "optional">;
        workflowHandle: import("convex/values").VString<string, "required">;
        args: import("convex/values").VAny<any, "required", string>;
        onComplete: import("convex/values").VObject<{
            context?: any;
            fnHandle: string;
        } | undefined, {
            fnHandle: import("convex/values").VString<string, "required">;
            context: import("convex/values").VAny<any, "optional", string>;
        }, "optional", "fnHandle" | "context" | `context.${string}`>;
        logLevel: import("convex/values").Validator<null, "optional">;
        startedAt: import("convex/values").Validator<null, "optional">;
        state: import("convex/values").Validator<null, "optional">;
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
        generationNumber: import("convex/values").VFloat64<number, "required">;
    }, "required", "name" | "args" | "runResult" | "startedAt" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "workflowHandle" | "onComplete" | "logLevel" | "state" | "generationNumber" | `startedAt.${string}` | "onComplete.fnHandle" | "onComplete.context" | `onComplete.context.${string}` | `logLevel.${string}` | `state.${string}`>, {}, {}, {}>;
    steps: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
        stepNumber: import("convex/values").VFloat64<number, "required">;
        step: import("convex/values").VUnion<{
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
        }, [import("convex/values").VObject<{
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
        }, {
            name: import("convex/values").VString<string, "required">;
            inProgress: import("convex/values").VBoolean<boolean, "required">;
            argsSize: import("convex/values").VFloat64<number, "required">;
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
            kind: import("convex/values").VLiteral<"function" | undefined, "optional">;
            functionType: import("convex/values").VUnion<"query" | "mutation" | "action", NoInfer<[import("convex/values").VLiteral<"query", "required">, import("convex/values").VLiteral<"mutation", "required">, import("convex/values").VLiteral<"action", "required">]>, "required", never>;
            handle: import("convex/values").VString<string, "required">;
            workId: import("convex/values").VString<import("@convex-dev/workpool").WorkId | undefined, "optional">;
        }, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
        }, {
            name: import("convex/values").VString<string, "required">;
            inProgress: import("convex/values").VBoolean<boolean, "required">;
            argsSize: import("convex/values").VFloat64<number, "required">;
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
            kind: import("convex/values").VLiteral<"workflow", "required">;
            handle: import("convex/values").VString<string, "required">;
            workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows"> | undefined, "optional">;
        }, "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "handle" | "inProgress" | "argsSize">, import("convex/values").VObject<{
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
        }, {
            eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
            args: import("convex/values").VObject<{
                eventId?: import("convex/values").GenericId<"events"> | undefined;
            }, {
                eventId: import("convex/values").VId<import("convex/values").GenericId<"events"> | undefined, "optional">;
            }, "required", "eventId">;
            name: import("convex/values").VString<string, "required">;
            inProgress: import("convex/values").VBoolean<boolean, "required">;
            argsSize: import("convex/values").VFloat64<number, "required">;
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
            kind: import("convex/values").VLiteral<"event", "required">;
        }, "required", "kind" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "eventId" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "inProgress" | "argsSize" | "args.eventId">], "required", "kind" | "workflowId" | "name" | "args" | "runResult" | "startedAt" | "completedAt" | "workId" | "eventId" | `args.${string}` | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "functionType" | "handle" | "inProgress" | "argsSize">;
    }, "required", "workflowId" | "stepNumber" | "step" | "step.kind" | "step.workflowId" | "step.name" | "step.args" | "step.runResult" | "step.startedAt" | "step.completedAt" | "step.workId" | "step.eventId" | `step.args.${string}` | "step.runResult.kind" | "step.runResult.returnValue" | `step.runResult.returnValue.${string}` | "step.runResult.error" | "step.functionType" | "step.handle" | "step.inProgress" | "step.argsSize">, {
        workflow: ["workflowId", "stepNumber", "_creationTime"];
        inProgress: ["step.inProgress", "workflowId", "_creationTime"];
    }, {}, {}>;
    events: import("convex/server").TableDefinition<import("convex/values").VObject<{
        workflowId: import("convex/values").GenericId<"workflows">;
        name: string;
        state: {
            kind: "created";
        } | {
            kind: "sent";
            result: {
                kind: "success";
                returnValue: any;
            } | {
                kind: "failed";
                error: string;
            } | {
                kind: "canceled";
            };
            sentAt: number;
        } | {
            kind: "waiting";
            stepId: import("convex/values").GenericId<"steps">;
            waitingAt: number;
        } | {
            kind: "consumed";
            stepId: import("convex/values").GenericId<"steps">;
            sentAt: number;
            waitingAt: number;
            consumedAt: number;
        };
    }, {
        workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
        name: import("convex/values").VString<string, "required">;
        state: import("convex/values").VUnion<{
            kind: "created";
        } | {
            kind: "sent";
            result: {
                kind: "success";
                returnValue: any;
            } | {
                kind: "failed";
                error: string;
            } | {
                kind: "canceled";
            };
            sentAt: number;
        } | {
            kind: "waiting";
            stepId: import("convex/values").GenericId<"steps">;
            waitingAt: number;
        } | {
            kind: "consumed";
            stepId: import("convex/values").GenericId<"steps">;
            sentAt: number;
            waitingAt: number;
            consumedAt: number;
        }, [import("convex/values").VObject<{
            kind: "created";
        }, {
            kind: import("convex/values").VLiteral<"created", "required">;
        }, "required", "kind">, import("convex/values").VObject<{
            kind: "sent";
            result: {
                kind: "success";
                returnValue: any;
            } | {
                kind: "failed";
                error: string;
            } | {
                kind: "canceled";
            };
            sentAt: number;
        }, {
            kind: import("convex/values").VLiteral<"sent", "required">;
            result: import("convex/values").VUnion<{
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
            sentAt: import("convex/values").VFloat64<number, "required">;
        }, "required", "kind" | "result" | "sentAt" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error">, import("convex/values").VObject<{
            kind: "waiting";
            stepId: import("convex/values").GenericId<"steps">;
            waitingAt: number;
        }, {
            kind: import("convex/values").VLiteral<"waiting", "required">;
            waitingAt: import("convex/values").VFloat64<number, "required">;
            stepId: import("convex/values").VId<import("convex/values").GenericId<"steps">, "required">;
        }, "required", "kind" | "stepId" | "waitingAt">, import("convex/values").VObject<{
            kind: "consumed";
            stepId: import("convex/values").GenericId<"steps">;
            sentAt: number;
            waitingAt: number;
            consumedAt: number;
        }, {
            kind: import("convex/values").VLiteral<"consumed", "required">;
            waitingAt: import("convex/values").VFloat64<number, "required">;
            sentAt: import("convex/values").VFloat64<number, "required">;
            consumedAt: import("convex/values").VFloat64<number, "required">;
            stepId: import("convex/values").VId<import("convex/values").GenericId<"steps">, "required">;
        }, "required", "kind" | "stepId" | "sentAt" | "waitingAt" | "consumedAt">], "required", "kind" | "stepId" | "result" | "sentAt" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error" | "waitingAt" | "consumedAt">;
    }, "required", "workflowId" | "name" | "state" | "state.kind" | "state.stepId" | "state.result" | "state.sentAt" | "state.result.kind" | "state.result.returnValue" | `state.result.returnValue.${string}` | "state.result.error" | "state.waitingAt" | "state.consumedAt">, {
        workflowId_state: ["workflowId", "state.kind", "_creationTime"];
    }, {}, {}>;
    onCompleteFailures: import("convex/server").TableDefinition<import("convex/values").VUnion<{
        workflowId?: string | undefined;
        workId?: import("@convex-dev/workpool").WorkId | undefined;
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
    } | {
        error: string;
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
    }, [import("convex/values").VObject<{
        workflowId?: string | undefined;
        workId?: import("@convex-dev/workpool").WorkId | undefined;
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
    }, {
        workId: import("convex/values").VString<import("@convex-dev/workpool").WorkId | undefined, "optional">;
        workflowId: import("convex/values").VString<string | undefined, "optional">;
        result: import("convex/values").VUnion<{
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
        context: import("convex/values").VAny<any, "required", string>;
    }, "required", "workflowId" | "workId" | "context" | `context.${string}` | "result" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error">, import("convex/values").VObject<{
        error: string;
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
        error: import("convex/values").VString<string, "required">;
    }, "required", "error" | "workflowId" | "runResult" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "generationNumber">], "required", "error" | "workflowId" | "runResult" | "workId" | "runResult.kind" | "runResult.returnValue" | `runResult.returnValue.${string}` | "runResult.error" | "context" | `context.${string}` | "generationNumber" | "result" | "result.kind" | "result.returnValue" | `result.returnValue.${string}` | "result.error">, {}, {}, {}>;
    webhooks: import("convex/server").TableDefinition<import("convex/values").VObject<{
        token?: string | undefined;
        tokenHash?: string | undefined;
        validatorKey?: string | undefined;
        expiresAt?: number | undefined;
        maxUses?: number | undefined;
        useCount?: number | undefined;
        workflowId: import("convex/values").GenericId<"workflows">;
        eventName: string;
        createdAt: number;
    }, {
        token: import("convex/values").VString<string | undefined, "optional">;
        tokenHash: import("convex/values").VString<string | undefined, "optional">;
        workflowId: import("convex/values").VId<import("convex/values").GenericId<"workflows">, "required">;
        eventName: import("convex/values").VString<string, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        validatorKey: import("convex/values").VString<string | undefined, "optional">;
        expiresAt: import("convex/values").VFloat64<number | undefined, "optional">;
        maxUses: import("convex/values").VFloat64<number | undefined, "optional">;
        useCount: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "workflowId" | "token" | "tokenHash" | "eventName" | "createdAt" | "validatorKey" | "expiresAt" | "maxUses" | "useCount">, {
        token: ["token", "_creationTime"];
        tokenHash: ["tokenHash", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
//# sourceMappingURL=schema.d.ts.map