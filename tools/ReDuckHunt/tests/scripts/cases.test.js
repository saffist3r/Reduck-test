import { describe, it, expect } from "vitest";
import {
  discoverCasesFiles,
  knownSlugsForHost,
  loadJson,
} from "../../lib/discover.js";

const files = discoverCasesFiles();
const byHost = files.reduce((m, f) => {
  if (!m.has(f.host)) m.set(f.host, []);
  m.get(f.host).push(f);
  return m;
}, new Map());

describe("cases", () => {
  it("discovers case suites when present", () => {
    // Hosts without tests/*.json cases are fine; just assert API works.
    expect(Array.isArray(files)).toBe(true);
  });

  for (const [host, hostFiles] of byHost) {
    describe(host, () => {
      for (const file of hostFiles) {
        const label = file.relative.split("/").pop();
        it(`${label} shape`, () => {
          const suite = loadJson(file.path);
          expect(suite.host).toBe(host);
          expect(Array.isArray(suite.cases)).toBe(true);
          expect(suite.cases.length).toBeGreaterThan(0);

          const slugs = knownSlugsForHost(host);
          const ids = new Set();

          for (const c of suite.cases) {
            expect(c.id).toBeTruthy();
            expect(ids.has(c.id)).toBe(false);
            ids.add(c.id);

            expect(c.script).toBeTruthy();
            expect(slugs.has(c.script)).toBe(true);
            expect(c.args).toBeTypeOf("object");
            expect(c.expect).toBeTypeOf("object");
            expect(c.expect).not.toBeNull();
          }
        });
      }
    });
  }
});
