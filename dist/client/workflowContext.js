import { BaseChannel } from "async-channel";
import { parse } from "convex-helpers/validators";
import { safeFunctionName } from "./safeFunctionName.js";
export function createWorkflowCtx(workflowId, sender) {
    return {
        workflowId,
        runQuery: async (query, args, opts) => {
            return runFunction(sender, "query", query, args, opts);
        },
        runMutation: async (mutation, args, opts) => {
            return runFunction(sender, "mutation", mutation, args, opts);
        },
        runAction: async (action, args, opts) => {
            return runFunction(sender, "action", action, args, opts);
        },
        runWorkflow: async (workflow, args, opts) => {
            const { name, ...schedulerOptions } = opts ?? {};
            return run(sender, {
                name: name ?? safeFunctionName(workflow),
                target: {
                    kind: "workflow",
                    function: workflow,
                    args,
                },
                retry: undefined,
                schedulerOptions,
            });
        },
        awaitEvent: async (event) => {
            const result = await run(sender, {
                name: event.name ?? event.id ?? "Event",
                target: {
                    kind: "event",
                    args: { eventId: event.id },
                },
                retry: undefined,
                schedulerOptions: {},
            });
            if (event.validator) {
                return parse(event.validator, result);
            }
            return result;
        },
        createHook: (hookOrOptions, options) => {
            // Determine the event name and token
            let eventName;
            let token;
            if ("create" in hookOrOptions && "resume" in hookOrOptions) {
                // It's a TypedHook from defineHook()
                eventName = options?.name ?? "hook";
                token = options?.token;
            }
            else {
                // It's HookOptions with name
                eventName = hookOrOptions.name;
                token = hookOrOptions.token ?? options?.token;
            }
            // Generate token if not provided (use event name + random suffix)
            const actualToken = token ?? `${eventName}_${Math.random().toString(36).slice(2, 14)}`;
            // Create a function to await the next event
            const awaitNext = async () => {
                const result = await run(sender, {
                    name: eventName,
                    target: {
                        kind: "event",
                        args: { eventId: undefined },
                    },
                    retry: undefined,
                    schedulerOptions: {},
                });
                return result;
            };
            // Create the Hook object that is both thenable and async iterable
            const hook = {
                token: actualToken,
                workflowId,
                // Make it thenable (can be awaited)
                then(onfulfilled, onrejected) {
                    return awaitNext().then(onfulfilled, onrejected);
                },
                // Make it async iterable (for await...of)
                async *[Symbol.asyncIterator]() {
                    while (true) {
                        yield await awaitNext();
                    }
                },
            };
            return hook;
        },
    };
}
async function runFunction(sender, functionType, f, args, opts) {
    const { name, retry, ...schedulerOptions } = opts ?? {};
    return run(sender, {
        name: name ?? safeFunctionName(f),
        target: {
            kind: "function",
            functionType,
            function: f,
            args,
        },
        retry,
        schedulerOptions,
    });
}
async function run(sender, request) {
    let send;
    const p = new Promise((resolve, reject) => {
        send = sender.push({
            ...request,
            resolve,
            reject,
        });
    });
    await send;
    return p;
}
//# sourceMappingURL=workflowContext.js.map