import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Monorepo root (tools/ReDuckHunt/lib → ../../..) */
export const REPO_ROOT = resolve(__dirname, "../../..");

/** Every host lives under this directory as scripts/<host-id>/ */
export const SCRIPTS_DIR = "scripts";
export const SCRIPTS_ROOT = resolve(REPO_ROOT, SCRIPTS_DIR);

/** Non-script folders under a host root (flat layout). */
export const HOST_SKIP_DIRS = new Set([
  "tests",
  "benchmarks",
  "docs",
  "scripts",
  "node_modules",
  ".git",
]);
