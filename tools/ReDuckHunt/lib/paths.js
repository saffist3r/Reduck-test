import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Monorepo root (tools/ReDuckHunt/lib → ../../..) */
export const REPO_ROOT = resolve(__dirname, "../../..");

/** Reduck host folders under scripts/ relative to repo root. */
export const HOSTS = [
  {
    id: "anybuddyapp.com",
    dir: "scripts/anybuddyapp.com",
    /** Scripts live at host/<slug>/{script.js,meta.json} */
    scriptLayout: "flat",
    casesFiles: ["tests/cases.json"],
  },
  {
    id: "web.snapchat.com",
    dir: "scripts/web.snapchat.com",
    /** Scripts live at host/scripts/<slug>/{script.js,meta.json} */
    scriptLayout: "scripts",
    casesFiles: ["tests/cases.json", "tests/critical-cases.json"],
  },
];
