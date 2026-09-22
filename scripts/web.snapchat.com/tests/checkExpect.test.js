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
  });
});
