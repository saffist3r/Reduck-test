import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Monorepo root (parent of ReDuckHunt/). */
export const REPO_ROOT = resolve(__dirname, "../..");

/** Host folders relative to repo root that contain Reduck scripts. */
export const HOSTS = [
  {
    id: "anybuddyapp.com",
    dir: "anybuddyapp.com",
    /** Scripts live at host/<slug>/{script.js,meta.json} */
    scriptLayout: "flat",
    casesFiles: ["tests/cases.json"],
  },
  {
    id: "web.snapchat.com",
    dir: "web.snapchat.com",
    /** Scripts live at host/scripts/<slug>/{script.js,meta.json} */
    scriptLayout: "scripts",
    casesFiles: ["tests/cases.json", "tests/critical-cases.json"],
  },
];
