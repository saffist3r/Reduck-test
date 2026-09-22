import { describe, it, expect } from "vitest";
import { checkExpect } from "../../../tools/ReDuckHunt/lib/checkExpect.js";

describe("anybuddyapp.com", () => {
  describe("checkExpect", () => {
    it("minCandidates / firstSlugIncludes", () => {
      expect(
        checkExpect(
          { minCandidates: 1, firstSlugIncludes: "lyon" },
          { candidates: [{ slug: "lyon-69000-fr", name: "Lyon" }] },
        ),
      ).toEqual([]);
      expect(
        checkExpect({ minCandidates: 2 }, { candidates: [{ slug: "x" }] })[0],
      ).toMatch(/minCandidates/);
    });

    it("minClubs / clubNameIncludes", () => {
      expect(
        checkExpect(
          { minClubs: 1, clubNameIncludes: "Racing" },
          { clubs: [{}], club: { name: "Racing Club" } },
        ),
      ).toEqual([]);
    });
  });
});
