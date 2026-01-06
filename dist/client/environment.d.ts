type GenerationState = {
    now: number;
    latest: boolean;
};
export declare function patchMath(math: typeof Math, seed: string): typeof Math;
export declare function createDeterministicDate(originalDate: typeof Date, getGenerationState: () => GenerationState): typeof Date;
export declare function setupEnvironment(getGenerationState: () => GenerationState, workflowId: string): void;
export declare function createConsole(console: Console, getGenerationState: () => GenerationState): Console;
export {};
//# sourceMappingURL=environment.d.ts.map