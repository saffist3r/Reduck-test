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

    it("clicked / delivered for send_chat_image", () => {
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
  });
});
