import type { RetryBehavior, RunResult, WorkpoolOptions } from "@convex-dev/workpool";
import { BaseChannel } from "async-channel";
import { type FunctionReference, type FunctionType, type FunctionVisibility, type GenericDataModel, type GenericMutationCtx } from "convex/server";
import { type JournalEntry } from "../component/schema.js";
import type { WorkflowComponent } from "./types.js";
import type { EventId, SchedulerOptions } from "../types.js";
export type WorkerResult = {
    type: "handlerDone";
    runResult: RunResult;
} | {
    type: "executorBlocked";
};
export type StepRequest = {
    name: string;
    target: {
        kind: "function";
        functionType: FunctionType;
        function: FunctionReference<FunctionType, FunctionVisibility>;
        args: unknown;
    } | {
        kind: "event";
        args: {
            eventId?: EventId;
        };
    } | {
        kind: "workflow";
        function: FunctionReference<"mutation", "internal">;
        args: unknown;
    };
    retry: RetryBehavior | boolean | undefined;
    schedulerOptions: SchedulerOptions;
    resolve: (result: unknown) => void;
    reject: (error: unknown) => void;
};
export declare class StepExecutor {
    private workflowId;
    private generationNumber;
    private ctx;
    private component;
    private journalEntries;
    private receiver;
    private now;
    private workpoolOptions;
    private journalEntrySize;
    constructor(workflowId: string, generationNumber: number, ctx: GenericMutationCtx<GenericDataModel>, component: WorkflowComponent, journalEntries: Array<JournalEntry>, receiver: BaseChannel<StepRequest>, now: number, workpoolOptions: WorkpoolOptions | undefined);
    run(): Promise<WorkerResult>;
    getGenerationState(): {
        now: number;
        latest: boolean;
    };
    completeMessage(message: StepRequest, entry: JournalEntry): void;
    startSteps(messages: StepRequest[]): Promise<JournalEntry[]>;
}
//# sourceMappingURL=step.d.ts.map