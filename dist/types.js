import { vResultValidator, vWorkIdValidator, } from "@convex-dev/workpool";
import { v, } from "convex/values";
export const vWorkflowId = v.string();
export const vEventId = (_name) => v.string();
export const vWorkflowStep = v.object({
    workflowId: vWorkflowId,
    name: v.string(),
    stepId: v.string(),
    stepNumber: v.number(),
    args: v.any(),
    runResult: v.optional(vResultValidator),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    kind: v.union(v.literal("function"), v.literal("workflow"), v.literal("event")),
    workId: v.optional(vWorkIdValidator),
    nestedWorkflowId: v.optional(vWorkflowId),
    eventId: v.optional(vEventId()),
});
// type assertion to keep us in check
const _ = {};
export function vPaginationResult(itemValidator) {
    return v.object({
        page: v.array(itemValidator),
        continueCursor: v.string(),
        isDone: v.boolean(),
        splitCursor: v.optional(v.union(v.string(), v.null())),
        pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    });
}
//# sourceMappingURL=types.js.map