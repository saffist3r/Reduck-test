import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { HOSTS, REPO_ROOT } from "./paths.js";

export function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Discover all local script packs for a host.
 * @returns {{ host: string, slug: string, dir: string, scriptPath: string, metaPath: string, meta: object }[]}
 */
export function discoverScripts(hostConfig = null) {
  const hosts = hostConfig ? [hostConfig] : HOSTS;
  const out = [];

  for (const host of hosts) {
    const hostRoot = join(REPO_ROOT, host.dir);
    const scriptRoot =
      host.scriptLayout === "scripts" ? join(hostRoot, "scripts") : hostRoot;

    if (!existsSync(scriptRoot)) continue;

    for (const name of readdirSync(scriptRoot)) {
      const dir = join(scriptRoot, name);
      if (!statSync(dir).isDirectory()) continue;
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

  return out;
}

/** Load all cases files declared for hosts. */
export function discoverCasesFiles() {
  const out = [];
  for (const host of HOSTS) {
    for (const rel of host.casesFiles) {
      const path = join(REPO_ROOT, host.dir, rel);
      if (!existsSync(path)) continue;
      out.push({ host: host.id, path, relative: `${host.dir}/${rel}` });
    }
  }
  return out;
}

export function knownSlugsForHost(hostId) {
  return new Set(
    discoverScripts(HOSTS.find((h) => h.id === hostId)).map((s) => s.slug),
  );
}
