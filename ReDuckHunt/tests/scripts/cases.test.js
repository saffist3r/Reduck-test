import { describe, it, expect } from "vitest";
import {
  discoverCasesFiles,
  knownSlugsForHost,
  loadJson,
} from "../../lib/discover.js";

const files = discoverCasesFiles();

describe("cases.json shape", () => {
  it("finds smoke + critical case files", () => {
    const rels = files.map((f) => f.relative);
    expect(rels).toContain("anybuddyapp.com/tests/cases.json");
    expect(rels).toContain("web.snapchat.com/tests/cases.json");
    expect(rels).toContain("web.snapchat.com/tests/critical-cases.json");
  });

  it.each(files.map((f) => [f.relative, f]))(
    "%s is well-formed",
    (_rel, file) => {
      const suite = loadJson(file.path);
      expect(suite.host).toBe(file.host);
      expect(Array.isArray(suite.cases)).toBe(true);
      expect(suite.cases.length).toBeGreaterThan(0);

      const slugs = knownSlugsForHost(file.host);
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
    },
  );
});
