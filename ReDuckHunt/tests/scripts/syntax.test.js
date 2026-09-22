import { describe, it, expect } from "vitest";
import { discoverScripts } from "../../lib/discover.js";
import { checkScriptSyntax } from "../../lib/checkSyntax.js";

const scripts = discoverScripts();

describe("script.js syntax", () => {
  it.each(scripts.map((s) => [s.host, s.slug, s.scriptPath]))(
    "%s/%s parses (Reduck body wrap)",
    (_host, _slug, scriptPath) => {
      expect(() => checkScriptSyntax(scriptPath)).not.toThrow();
    },
  );
});
