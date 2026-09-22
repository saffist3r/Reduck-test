# QA — Snapchat Web

Issues found while automating `www.snapchat.com/web/` via Reduck (`scripts/web.snapchat.com/`).

Template: `.cursor/rules/qa-report.mdc`  
Safety: test account, low rate, read-first.

## Notes

- Chat list: `[role="listitem"]` (e.g. My AI, Team Snapchat)
- Canonical URL: `https://www.snapchat.com/web/` (not `web.snapchat.com`)
- Prefer `run_script` + `loggedIn: true` over raw `start_session` for production

## Findings

### QA-001 — Single-tab lock (“Oops! Too many tabs…”)
- **Area:** Snapchat
- **Severity:** P0
- **Steps:** 1. Have Snapchat Web open in a normal tab. 2. Open another tab via Reduck to `web.snapchat.com`.
- **Expected:** Automation session works cleanly.
- **Actual:** Modal: “Snapchat can only be open in one tab at a time.” Dismiss is temporary; actions often re-trigger it.
- **Workaround:** Close other Snapchat Web tabs; scripts dismiss then wait.
- **Date:** 2026-09-21

### QA-002 — URL host vs Reduck host id
- **Area:** Both
- **Severity:** P2
- **Steps:** Navigate to `https://web.snapchat.com`.
- **Expected:** Stay on `web.snapchat.com`.
- **Actual:** Redirects to `https://www.snapchat.com/web/`.
- **Workaround:** Scripts `goto` the canonical URL; Reduck host id stays `web.snapchat.com`.
- **Date:** 2026-09-21

### QA-003 — `start_session` has no prior cookies
- **Area:** Reduck
- **Severity:** P1
- **Steps:** `start_session` then open Snapchat.
- **Expected:** Same login as the user’s Chrome.
- **Actual:** Clean browser; cookies only via `run_script` + `loggedIn: true`.
- **Workaround:** Use `loggedIn: true` on saved scripts; one Web session only.
- **Date:** 2026-09-21

### QA-004 — Desktop App install banner
- **Area:** Snapchat
- **Severity:** P3
- **Steps:** Load logged-in chat list.
- **Expected:** Clean list.
- **Actual:** Blue “install Desktop App” banner above Search.
- **Workaround:** Ignore banner text when parsing rows.
- **Date:** 2026-09-21

### QA-005 — Chat open may not show a transcript
- **Area:** Snapchat
- **Severity:** P1
- **Steps:** Open `My AI` from the list.
- **Expected:** Message history + composer.
- **Actual:** Center pane often camera / Bitmoji; message DOM sparse / virtualized.
- **Workaround:** Return `messages: []` with `opened`/`note` instead of timing out.
- **Date:** 2026-09-21

### QA-007 — Private script quota (3)
- **Area:** Reduck
- **Severity:** P2
- **Steps:** Create private `web.snapchat.com/check_session` with 3 private scripts already owned.
- **Expected:** Create succeeds.
- **Actual:** “You've reached your plan's limit of 3 private scripts.”
- **Workaround:** Ship Snapchat scripts as public.
- **Date:** 2026-09-21

### QA-008 — Loose chat name match
- **Area:** Both
- **Severity:** P1
- **Steps:** `open_chat` with `name=zzz-nonexistent-chat-xyz` using `target.includes(rowName)`.
- **Expected:** `notFound: true`.
- **Actual:** False open on empty/short row names.
- **Workaround:** Require meaningful `rowName`; match `===` or `rowName.includes(target)`.
- **Date:** 2026-09-21

### QA-010 — Empty `open_chat.name` fails at schema
- **Area:** Reduck
- **Severity:** P3
- **Steps:** `run_script` `open_chat` with `name: ""`.
- **Expected:** Clear error.
- **Actual:** MCP: `data/name must NOT have fewer than 1 characters`.
- **Workaround:** Assert `ok:false` + `errorIncludes: "name"` in the critical suite.
- **Date:** 2026-09-21

### QA-011 — Lenses only on camera Snap path
- **Area:** Snapchat
- **Severity:** P2
- **Steps:** Chat gallery upload vs composer camera → Lens carousel.
- **Expected:** Filters on uploaded images or documented as camera-only.
- **Actual:** Upload = Send only. Lenses only on camera overlay.
- **Workaround:** Camera → Lens → shutter → Send To. Face Lenses need a face in the feed.
- **Date:** 2026-09-22

### QA-012 — No gallery image → My Story on Web
- **Area:** Snapchat
- **Severity:** P2
- **Steps:** Camera → My Story vs chat `uploadImages` → Story.
- **Expected:** Both can post to My Story.
- **Actual:** Only camera → Send To → My Story. Upload is chat-only; camera `…` is device picker.
- **Workaround:** Story via camera path; files via chat send.
- **Date:** 2026-09-22

### QA-013 — `send_chat_image` waitFor uploadImages after wrong open
- **Area:** Both
- **Severity:** P1
- **Steps:** Click chat `listitem` by index (camera icon side) or open My AI while disclaimer modal is up.
- **Expected:** Composer + `input[name=uploadImages]`.
- **Actual:** Camera landing (“Click the Camera…”) or My AI modal → no file input → timeout.
- **Workaround:** Open like `open_chat` (`filter({ hasText })`); dismiss My AI modal; prefer self-chat for write smoke.
- **Date:** 2026-09-22

### QA-014 — Sidebar “Send this text to MyAI” steals Send click
- **Area:** Both
- **Severity:** P1
- **Steps:** After staging an image, click first `button[aria-label*=Send]`.
- **Expected:** Image sends in the open chat.
- **Actual:** Hits “Send this text to MyAI” → jumps to My AI / disclaimer; preview stays.
- **Workaround:** Focus composer textbox + `Enter` (blue send arrow has no useful aria-label).
- **Date:** 2026-09-22
