/**
 * Debug queries to inspect internal workflow state.
 * Used to prove workflows truly suspend without busy-waiting.
 */

import { query } from "./_generated/server";
import { vWorkflowId } from "@convex-dev/workflow";
import { components } from "./_generated/api";

/**
 * List all scheduled functions to prove nothing is polling.
 * If the workflow was busy-waiting, we'd see scheduled functions here.
 */
export const listScheduledFunctions = query({
  args: {},
  handler: async (ctx) => {
    const scheduled = await ctx.db.system.query("_scheduled_functions").collect();
    return {
      count: scheduled.length,
      functions: scheduled.map(fn => ({
        name: fn.name,
        scheduledTime: new Date(fn.scheduledTime).toISOString(),
        state: fn.state,
      })),
    };
  },
});

/**
 * Get the journal (steps) for a workflow.
 * This shows how inputs/outputs are cached for replay.
 */
export const getWorkflowJournal = query({
  args: { workflowId: vWorkflowId },
  handler: async (ctx, args) => {
    // Use the workflow component's listSteps API
    const result = await ctx.runQuery(components.workflow.workflow.listSteps, {
      workflowId: args.workflowId,
      order: "asc",
      paginationOpts: { cursor: null, numItems: 100 },
    });
    // Return raw structure to see what we're working with
    return result.page;
  },
});
