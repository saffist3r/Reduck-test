import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { discoverHosts, discoverScripts } from "../../lib/discover.js";
import { checkScriptSyntax } from "../../lib/checkSyntax.js";

const hosts = discoverHosts();
const scripts = discoverScripts();
const byHost = scripts.reduce((m, s) => {
  if (!m.has(s.host)) m.set(s.host, []);
  m.get(s.host).push(s);
  return m;
}, new Map());

describe("scripts", () => {
  it("discovers at least one host under scripts/", () => {
    expect(hosts.length).toBeGreaterThan(0);
  });

  it("discovers at least one script pack", () => {
    expect(scripts.length).toBeGreaterThan(0);
  });

  for (const [host, packs] of byHost) {
    describe(host, () => {
      for (const pack of packs) {
        describe(pack.slug, () => {
          it("meta.json", () => {
            const { meta, scriptPath, metaPath } = pack;
            expect(existsSync(metaPath)).toBe(true);
            expect(existsSync(scriptPath)).toBe(true);

            expect(meta.host).toBe(host);
            expect(meta.slug).toBe(pack.slug);
            expect(meta.name).toBeTruthy();
            expect(typeof meta.description).toBe("string");
            expect(meta.description.length).toBeGreaterThan(0);

            expect(["public", "private"]).toContain(meta.visibility);
            expect(typeof meta.loggedIn).toBe("boolean");
            expect(meta.sideEffects).toBeTruthy();
            expect(typeof meta.humanRequired).toBe("boolean");

            expect(meta.input?.type).toBe("object");
            expect(meta.output?.type).toBe("object");
            expect(meta.output?.properties).toBeTruthy();

            const folder = pack.dir.split("/").pop();
            expect(pack.slug).toBe(folder);
          });

          it("script.js syntax", () => {
            expect(() => checkScriptSyntax(pack.scriptPath)).not.toThrow();
          });
        });
      }
    });
  }
});
