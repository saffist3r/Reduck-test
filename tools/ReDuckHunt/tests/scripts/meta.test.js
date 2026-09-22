import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { discoverScripts } from "../../lib/discover.js";

const scripts = discoverScripts();

describe("script meta.json", () => {
  it("discovers at least one script per known host", () => {
    const hosts = new Set(scripts.map((s) => s.host));
    expect(hosts.has("anybuddyapp.com")).toBe(true);
    expect(hosts.has("web.snapchat.com")).toBe(true);
    expect(scripts.length).toBeGreaterThanOrEqual(8);
  });

  it.each(scripts.map((s) => [s.host, s.slug, s]))(
    "%s/%s has required meta fields + script.js",
    (_host, _slug, pack) => {
      const { meta, scriptPath, metaPath } = pack;
      expect(existsSync(metaPath)).toBe(true);
      expect(existsSync(scriptPath)).toBe(true);

      expect(meta.host).toBeTruthy();
      expect(meta.slug).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(typeof meta.description).toBe("string");
      expect(meta.description.length).toBeGreaterThan(0);

      expect(["public", "private"]).toContain(meta.visibility);
      expect(typeof meta.loggedIn).toBe("boolean");
      expect(meta.sideEffects).toBeTruthy();
      expect(typeof meta.humanRequired).toBe("boolean");

      expect(meta.input).toBeTruthy();
      expect(meta.input.type).toBe("object");
      expect(meta.output).toBeTruthy();
      expect(meta.output.type).toBe("object");
      expect(meta.output.properties).toBeTruthy();
    },
  );

  it("slug matches folder name", () => {
    for (const pack of scripts) {
      const folder = pack.dir.split("/").pop();
      expect(pack.meta.slug).toBe(folder);
      expect(pack.slug).toBe(folder);
    }
  });

  it("host field matches pack host", () => {
    for (const pack of scripts) {
      expect(pack.meta.host).toBe(pack.host);
    }
  });
});
