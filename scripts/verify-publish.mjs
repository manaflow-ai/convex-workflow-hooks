import { readFile } from "node:fs/promises";
import process from "node:process";

const packageUrl = new globalThis.URL("../package.json", import.meta.url);
const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));

const failures = [];
if (packageJson.name !== "@convex-dev/workflow") {
  failures.push("package identity is not @convex-dev/workflow");
}
if (process.env.CI !== "true" || process.env.GITHUB_ACTIONS !== "true") {
  failures.push("publishing is allowed only from GitHub Actions CI");
}
if (process.env.GITHUB_REPOSITORY !== "get-convex/workflow") {
  failures.push("the checkout is not the package owner's release repository");
}
if (process.env.CONVEX_WORKFLOW_ALLOW_PUBLISH !== "1") {
  failures.push("explicit CONVEX_WORKFLOW_ALLOW_PUBLISH=1 opt-in is missing");
}

const provenanceOverride =
  process.env.npm_config_provenance ?? process.env.NPM_CONFIG_PROVENANCE;
const provenance =
  provenanceOverride ?? String(packageJson.publishConfig?.provenance);
if (provenance !== "true") {
  failures.push("npm provenance must be enabled");
}

if (failures.length > 0) {
  globalThis.console.error(
    [
      "Refusing to publish @convex-dev/workflow.",
      "This fork does not publish package artifacts from developer machines or forked CI.",
      ...failures.map((failure) => `- ${failure}`),
    ].join("\n"),
  );
  process.exitCode = 1;
}
