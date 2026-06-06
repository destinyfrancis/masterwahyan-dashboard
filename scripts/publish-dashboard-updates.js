import { execFileSync } from "node:child_process";

const DASHBOARD_PATH = "public/dashboards";
const COMMIT_MESSAGE = "chore: sync project dashboards";

run("git", ["pull", "--ff-only", "origin", "main"]);
run("node", ["scripts/sync-dashboards.js"]);

const changed = capture("git", ["status", "--porcelain", DASHBOARD_PATH]).trim();

if (!changed) {
  console.log("No dashboard changes to publish.");
  process.exit(0);
}

console.log("Dashboard changes detected:");
console.log(changed);

run("git", ["add", DASHBOARD_PATH]);
run("git", ["commit", "-m", COMMIT_MESSAGE]);
run("git", ["push", "origin", "main"]);

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

function capture(command, args) {
  return execFileSync(command, args, { encoding: "utf8" });
}
