import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

/**
 * Reduck script bodies use top-level await + return (host wraps them).
 * Wrap in async function so Node can syntax-check locally.
 */
export function checkScriptSyntax(scriptPath) {
  const body = readFileSync(scriptPath, "utf8");
  const wrapped = `"use strict";\nasync function __reduckhunt__() {\n${body}\n}\n`;
  const dir = mkdtempSync(join(tmpdir(), "reduckhunt-"));
  const tmp = join(dir, "check.js");
  try {
    writeFileSync(tmp, wrapped);
    execFileSync(process.execPath, ["--check", tmp], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
