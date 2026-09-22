import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  HOST_SKIP_DIRS,
  REPO_ROOT,
  SCRIPTS_DIR,
  SCRIPTS_ROOT,
} from "./paths.js";

export function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isDir(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

/** List host ids = immediate children of scripts/. */
export function discoverHosts() {
  if (!isDir(SCRIPTS_ROOT)) return [];
  return readdirSync(SCRIPTS_ROOT)
    .filter((name) => isDir(join(SCRIPTS_ROOT, name)))
    .map((id) => ({
      id,
      dir: join(SCRIPTS_DIR, id),
      root: join(SCRIPTS_ROOT, id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Collect packs that have script.js + meta.json under `root`.
 * @param {string} hostId
 * @param {string} root absolute path to scan
 */
function packsUnder(hostId, root) {
  if (!isDir(root)) return [];
  const out = [];
  for (const name of readdirSync(root)) {
    const dir = join(root, name);
    if (!isDir(dir)) continue;
    const scriptPath = join(dir, "script.js");
    const metaPath = join(dir, "meta.json");
    if (!existsSync(scriptPath) || !existsSync(metaPath)) continue;
    const meta = loadJson(metaPath);
    out.push({
      host: hostId,
      slug: meta.slug || name,
      dir,
      scriptPath,
      metaPath,
      meta,
    });
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Discover all script packs under scripts/.
 * Layout auto-detect per host:
 * - scripts/<host>/scripts/<slug>/  (nested)
 * - scripts/<host>/<slug>/          (flat; skips tests/docs/benchmarks/…)
 *
 * @param {string|null} hostId optional filter
 */
export function discoverScripts(hostId = null) {
  const hosts = discoverHosts().filter((h) => !hostId || h.id === hostId);
  const out = [];

  for (const host of hosts) {
    const nested = join(host.root, "scripts");
    if (isDir(nested)) {
      out.push(...packsUnder(host.id, nested));
      continue;
    }

    for (const name of readdirSync(host.root)) {
      if (HOST_SKIP_DIRS.has(name)) continue;
      const dir = join(host.root, name);
      if (!isDir(dir)) continue;
      const scriptPath = join(dir, "script.js");
      const metaPath = join(dir, "meta.json");
      if (!existsSync(scriptPath) || !existsSync(metaPath)) continue;
      const meta = loadJson(metaPath);
      out.push({
        host: host.id,
        slug: meta.slug || name,
        dir,
        scriptPath,
        metaPath,
        meta,
      });
    }
  }

  return out.sort(
    (a, b) => a.host.localeCompare(b.host) || a.slug.localeCompare(b.slug),
  );
}

/**
 * Discover case suite JSON files under scripts/<host>/tests/
 * that contain a top-level `cases` array.
 */
export function discoverCasesFiles() {
  const out = [];

  for (const host of discoverHosts()) {
    const testsDir = join(host.root, "tests");
    if (!isDir(testsDir)) continue;

    for (const name of readdirSync(testsDir)) {
      if (!name.endsWith(".json")) continue;
      const path = join(testsDir, name);
      if (!existsSync(path) || statSync(path).isDirectory()) continue;
      let data;
      try {
        data = loadJson(path);
      } catch {
        continue;
      }
      if (!data || !Array.isArray(data.cases)) continue;

      out.push({
        host: host.id,
        path,
        relative: relative(REPO_ROOT, path).split("\\").join("/"),
      });
    }
  }

  return out.sort(
    (a, b) => a.host.localeCompare(b.host) || a.relative.localeCompare(b.relative),
  );
}

export function knownSlugsForHost(hostId) {
  return new Set(discoverScripts(hostId).map((s) => s.slug));
}
