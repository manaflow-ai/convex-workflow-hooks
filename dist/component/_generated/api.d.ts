/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */
import type * as event from "../event.js";
import type * as journal from "../journal.js";
import type * as logging from "../logging.js";
import type * as model from "../model.js";
import type * as pool from "../pool.js";
import type * as utils from "../utils.js";
import type * as webhook from "../webhook.js";
import type * as workflow from "../workflow.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
declare const fullApi: ApiFromModules<{
    event: typeof event;
    journal: typeof journal;
    logging: typeof logging;
    model: typeof model;
    pool: typeof pool;
    utils: typeof utils;
    webhook: typeof webhook;
    workflow: typeof workflow;
}>;
/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
export declare const components: {
    workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"workpool">;
};
export {};
//# sourceMappingURL=api.d.ts.map