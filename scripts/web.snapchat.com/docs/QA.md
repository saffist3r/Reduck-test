# QA — Snapchat Web

Issues found while automating `www.snapchat.com/web/` via Reduck (`scripts/web.snapchat.com/`), plus what worked well and the account-risk acknowledgment at the end.

Areas: **Reduck** QA-003, 007, 010, 016, 018–022 · **Snapchat** QA-001, 004, 005, 011, 012, 023 · **Both** the rest.

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
- **Follow-up (2026-09-22):** `includes` is still wrong for writes: `name: "TEST"` would send to the group `TEST REDUCK`. Now exact name wins everywhere; read scripts accept one partial match, several → `ambiguous` + `candidates`; the write script `send_message` never acts on a partial match and return the suggestions instead.
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

### QA-013 — `send_chat_image` (now `send_message`) waitFor uploadImages after wrong open
- **Area:** Both
- **Severity:** P1
- **Steps:** Click chat `listitem` by index (camera icon side) or open My AI while disclaimer modal is up.
- **Expected:** Composer + `input[name=uploadImages]`.
- **Actual:** Camera landing (“Click the Camera…”) or My AI modal → no file input → timeout.
- **Workaround:** Open like `open_chat` (`filter({ hasText })`); on the My AI disclaimer return `ok: false` (never auto-accept terms); prefer self-chat for write smoke.
- **Date:** 2026-09-22

### QA-014 — Sidebar “Send this text to MyAI” steals Send click
- **Area:** Both
- **Severity:** P1
- **Steps:** After staging an image, click first `button[aria-label*=Send]`.
- **Expected:** Image sends in the open chat.
- **Actual:** Hits “Send this text to MyAI” → jumps to My AI / disclaimer; preview stays.
- **Workaround:** Focus composer textbox + `Enter` (blue send arrow has no useful aria-label).
- **Date:** 2026-09-22

### QA-015 — `send_message`: “Too many tabs” returns after the chat opens
- **Area:** Both
- **Severity:** P1
- **Steps:** Another Snapchat Web tab is open; run `send_message` with `name`.
- **Expected:** Chat opens, composer appears.
- **Actual:** Chat URL loads, then the “Too many tabs” overlay comes back → no `uploadImages` input → `composer not found`.
- **Workaround:** Keep dismissing the overlay in a loop (up to 20s) while waiting for the composer. Still best to close other Web tabs.
- **Date:** 2026-09-22

### QA-016 — `builtins.paste` rejects a Playwright Locator
- **Area:** Reduck
- **Severity:** P2
- **Steps:** `builtins.paste(page.getByRole('textbox').last(), text)`.
- **Expected:** Text pasted into the composer.
- **Actual:** `Unknown ReduckStep kind: undefined` — builtins take a Reduck `Sel` (CSS string or `{kind,…}` array), not a Locator.
- **Workaround:** `builtins.paste([{ kind: 'role', body: 'textbox' }, { kind: 'last' }], text)`. The old `caption` arg of `send_chat_image` had this bug untested.
- **Date:** 2026-09-22

### QA-017 — Text + image: first “Delivered” is only the text
- **Area:** Both
- **Severity:** P2
- **Steps:** Send text + image; accept the first `Delivered · just now` on the chat row.
- **Expected:** Both parts delivered.
- **Actual:** Snapchat sends text first; the row briefly shows `Delivered`, then `Sending…` while the image uploads.
- **Workaround:** Ignore rows containing `Sending`, pause 1.5s, and re-confirm `Delivered` before returning `ok`.
- **Date:** 2026-09-22

### QA-018 — `run_script` shows ✓ and `list_runs` shows `success` when the script reports failure
- **Area:** Reduck
- **Severity:** P1
- **Steps:** Run `send_message` so it returns `{ ok: false, error: "composer not found …" }` (run `e134a9f0-cb50-4b06-9bb2-3c5cbc7b17e5`). Look at the `run_script` reply, then `list_runs`.
- **Expected:** Some signal that the script's own contract failed (`ok: false`), or a documented convention for it.
- **Actual:** The reply starts with `✓ ok: false`, and `list_runs` lists the run as `success`. Only a thrown error counts as a failure, so the run list can't show which sends didn't happen.
- **Workaround:** Our benchmarks check `result.ok` / `delivered` themselves. Suggestion: flag `ok: false` results in the run status, or at least drop the ✓.
- **Date:** 2026-09-22

### QA-019 — A new script can't start as a draft once the private quota is full
- **Area:** Reduck
- **Severity:** P2
- **Steps:** With 3 private scripts already owned, `create_script { draft: true }` for `send_message`.
- **Expected:** An untested first version that isn't live yet.
- **Actual:** “You've reached your plan's limit of 3 private scripts.” Drafts are private, and `draft` “cannot be combined with visibility 'public'”, so the only option is to publish v1 untested.
- **Workaround:** Publish v1 public, then iterate with `create_draft_script_version` + `run_script { version_id }` (drafts of a public script are allowed). Suggestion: don't count drafts against the private quota.
- **Date:** 2026-09-22

### QA-020 — `run_script.waitForSeconds` max (60) is only discoverable by error
- **Area:** Reduck
- **Severity:** P3
- **Steps:** `run_script { …, waitForSeconds: 90 }` for a send that can take ~60s.
- **Expected:** The limit in the tool description, or clamping.
- **Actual:** `Input validation error … too_big … expected number to be <=60`; nothing ran.
- **Workaround:** Use ≤60 and read longer runs later with `read_run_results`.
- **Date:** 2026-09-22

### QA-021 — `list_runs` can't filter by script and has no duration
- **Area:** Reduck
- **Severity:** P2
- **Steps:** `list_runs { host, slug, limit }` to find the last `send_message` runs and their timings.
- **Expected:** Filter by script; duration per run.
- **Actual:** `slug` / `limit` are rejected (“slug belongs to a script, not to the run”); only `status`, `host`, `page`. Rows have a start time but no duration, so benchmark timings need one `read_run_trace` per run, summing `step_trace[].durationMs`.
- **Workaround:** Filter by host and read traces (done for every benchmark here).
- **Date:** 2026-09-22

### QA-022 — Caller mistakes surface as `internal_error` “try again later”
- **Area:** Reduck
- **Severity:** P2
- **Steps:** Pass a Playwright Locator to `builtins.paste` (QA-016); run `29b699bd-c4a9-4745-9d76-9ba3a1dc42a6`.
- **Expected:** “paste expects a Sel (CSS string or {kind,…}[]), got Locator”.
- **Actual:** `Unknown ReduckStep kind: undefined` + `⚠ internal_error — … please try again later or with different parameters`. Retrying would never help.
- **Workaround:** Read the builtins reference (`Sel` type) in `authoring_scripts`.
- **Date:** 2026-09-22

### QA-023 — Group chats: member name tags read as messages, sender labels equal chat names
- **Area:** Snapchat
- **Severity:** P2
- **Steps:** `list_chat_messages { name: "TEST REDUCK", since: "hosting a party at my place" }` (run `df05e4a1-9376-40c3-a990-4b00aa13499d`).
- **Expected:** Only the replies: `Yesss I’m in` from Fatma, then my update.
- **Actual:** Two extra “messages” `saffist3r` and `Fatma` (the group's member tags next to the composer). A first fix that dropped any text equal to a chat name also dropped the caps sender label `FATMA BOUZID`, so her reply came back as `from: me` (run `2c7f63b8-3657-4c19-bab0-98ee1d099a3e`).
- **Workaround:** Read caps sender labels first, then drop bare chat names / first names. Clean result in run `87e1c0b7-33a6-4754-ac48-3b27a42fe1c6`.
- **Date:** 2026-09-22

## What worked well (Reduck)

- **Saved scripts + `loggedIn: true`**: cookie injection from the paired Chrome just worked for every Snapchat run; no login automation needed.
- **Draft versions**: `create_draft_script_version` with `edits` + `run_script { version_id }` made fix → retest loops cheap without touching the live version. `promote_script_version` / `archive_script` made the `send_chat_image` → `send_message` swap clean.
- **`read_run_trace`**: step trace + failing/final screenshots diagnosed QA-015 (tab takeover) in one call, with no rerun.
- **`list_runs` args column**: an audit trail of exactly what was sent to whom.
- **Script contracts**: JSON Schema input validation catches bad args before a browser opens (QA-010), which is also a safety net for write scripts.
- **Builtins**: `uploadFile` with in-memory bytes and `paste` (CDP insertText) handled Snapchat's rich composer with no flakiness once used correctly.

## Snapchat account risk — acknowledgment

I understand that automating Snapchat can get an account flagged or banned as a bot. For this work:

- I used a **dedicated test account**, not my personal one. The self-chat `saffist3r` and the group `TEST REDUCK` belong to that test account; the only other member is a consenting friend.
- Runs were **sequential and slow** (one at a time, a human pause between sends, about a dozen sends in total over two days).
- There was **no bulk messaging, no messages to strangers, no friend adds**, and the My AI terms prompt was never accepted by a script.
- If Snapchat challenges the account (captcha, logout, warning), I stop, log it here, and don't retry.

Details: [BAN_RISKS.md](BAN_RISKS.md).
