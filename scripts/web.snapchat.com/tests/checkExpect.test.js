import { describe, it, expect } from "vitest";
import { checkExpect } from "../../../tools/ReDuckHunt/lib/checkExpect.js";

describe("web.snapchat.com", () => {
  describe("checkExpect", () => {
    it("urlIncludes for web url", () => {
      expect(
        checkExpect(
          { urlIncludes: "snapchat.com/web", hasKeys: ["loggedIn", "url"] },
          { loggedIn: true, url: "https://www.snapchat.com/web/" },
        ),
      ).toEqual([]);
    });

    it("chatNameIncludes / chatRowHasKeys", () => {
      expect(
        checkExpect(
          { chatNameIncludes: "My AI", chatRowHasKeys: ["name"] },
          { chats: [{ name: "My AI", preview: null }] },
        ),
      ).toEqual([]);
    });

    it("messageTextIncludes / hasAvailable", () => {
      expect(
        checkExpect(
          { messageTextIncludes: "hello", hasAvailable: true },
          {
            messages: [{ text: "Say hello" }],
            available: ["My AI"],
          },
        ),
      ).toEqual([]);
    });

    it("clicked / delivered for send_message", () => {
      expect(
        checkExpect(
          { ok: true, clicked: true, delivered: true },
          { ok: true, clicked: true, delivered: true },
        ),
      ).toEqual([]);
      expect(checkExpect({ clicked: true }, { clicked: false })[0]).toMatch(/clicked/);
      expect(
        checkExpect({ ok: true, delivered: true }, { ok: false, clicked: true, delivered: false }),
      ).toHaveLength(2);
    });

    it("ambiguous / candidatesInclude for name matching", () => {
      expect(
        checkExpect(
          { ambiguous: true, candidatesInclude: "Team Snapchat" },
          { ambiguous: true, candidates: ["saffist3r", "Team Snapchat"] },
        ),
      ).toEqual([]);
      expect(
        checkExpect({ candidatesInclude: "TEST REDUCK" }, { candidates: [] })[0],
      ).toMatch(/candidatesInclude/);
    });

    it("sinceFound for replies after an announcement", () => {
      expect(checkExpect({ sinceFound: true }, { sinceFound: true, count: 0 })).toEqual([]);
      expect(checkExpect({ sinceFound: true }, { sinceFound: false })[0]).toMatch(/sinceFound/);
    });
  });
});
