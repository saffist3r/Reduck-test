import { describe, it, expect } from "vitest";
import { checkExpect } from "../../lib/checkExpect.js";

describe("checkExpect", () => {
  it("passes when expect is empty", () => {
    expect(checkExpect({}, { ok: true })).toEqual([]);
  });

  it("requires result when ok:true", () => {
    expect(checkExpect({ ok: true }, null)).toContain(
      "expected a result object (ok:true)",
    );
  });

  it("checks loggedIn", () => {
    expect(checkExpect({ loggedIn: true }, { loggedIn: true })).toEqual([]);
    expect(checkExpect({ clicked: true }, { clicked: true })).toEqual([]);
    expect(checkExpect({ clicked: true }, { clicked: false })[0]).toMatch(/clicked/);
    expect(checkExpect({ delivered: true }, { delivered: false })[0]).toMatch(/delivered/);
    expect(checkExpect({ ok: true }, { ok: false, error: "boom" })[0]).toMatch(/result\.ok is false/);
    expect(checkExpect({ ok: true }, { count: 1 })).toEqual([]);
    expect(checkExpect({ loggedIn: true }, { loggedIn: false })[0]).toMatch(
      /loggedIn/,
    );
  });

  it("checks notFound / opened", () => {
    expect(
      checkExpect(
        { notFound: true, opened: false },
        { notFound: true, opened: false },
      ),
    ).toEqual([]);
    expect(checkExpect({ notFound: true }, { notFound: false })[0]).toMatch(
      /notFound/,
    );
  });

  it("checks count / minCount / maxCount", () => {
    expect(checkExpect({ count: 0 }, { count: 0 })).toEqual([]);
    expect(checkExpect({ minCount: 1 }, { count: 2 })).toEqual([]);
    expect(checkExpect({ maxCount: 5 }, { count: 6 })[0]).toMatch(/maxCount/);
  });

  it("ok:false requires error and optional errorIncludes", () => {
    expect(checkExpect({ ok: false }, null, null)[0]).toMatch(/no error/);
    expect(
      checkExpect({ ok: false, errorIncludes: "name" }, null, "name is required"),
    ).toEqual([]);
    expect(
      checkExpect({ ok: false, errorIncludes: "name" }, null, "boom")[0],
    ).toMatch(/errorIncludes/);
  });

  it("checks urlIncludes and hasKeys", () => {
    expect(
      checkExpect(
        { urlIncludes: "example.com", hasKeys: ["loggedIn", "url"] },
        { loggedIn: true, url: "https://example.com/app" },
      ),
    ).toEqual([]);
    expect(
      checkExpect({ hasKeys: ["title"] }, { loggedIn: true })[0],
    ).toMatch(/missing "title"/);
  });
});
