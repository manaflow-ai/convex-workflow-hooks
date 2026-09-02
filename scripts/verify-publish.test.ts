import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const script = fileURLToPath(new URL("./verify-publish.mjs", import.meta.url));
const ownerEnvironment = {
  CI: "true",
  GITHUB_ACTIONS: "true",
  GITHUB_REPOSITORY: "get-convex/workflow",
  CONVEX_WORKFLOW_ALLOW_PUBLISH: "1",
};

function runGuard(overrides: Record<string, string> = {}) {
  return spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: { ...ownerEnvironment, ...overrides },
  });
}

describe("publish guard", () => {
  test("uses package provenance when npm has no environment override", () => {
    expect(runGuard().status).toBe(0);
  });

  test("uses npm's lowercase override when both environment cases exist", () => {
    const result = runGuard({
      NPM_CONFIG_PROVENANCE: "true",
      npm_config_provenance: "false",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("npm provenance must be enabled");
  });

  test("accepts npm's lowercase true override", () => {
    expect(
      runGuard({
        NPM_CONFIG_PROVENANCE: "false",
        npm_config_provenance: "true",
      }).status,
    ).toBe(0);
  });
});
