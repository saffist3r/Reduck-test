# QA — Snapchat Web

Log of Reduck × Snapchat friction. Template: `.cursor/rules/qa-report.mdc`.

**Safety:** test account, low rate, read-first. Personal accounts out of scope.

## Probe verdict (2026-09-21)
**GO** — logged-in chat list is readable under Reduck after dismissing the multi-tab modal. Canonical URL redirects to `https://www.snapchat.com/web/`. Chat rows are `[role="listitem"]` (observed: My AI, Team Snapchat). Opening a chat is fragile when another Snapchat Web tab is open.

## What worked well
- Reduck `start_session` + `exec_code` + screenshots for live recon
- Extension device wakeable from offline
- Chat list exposes stable `role=listitem` rows with name / preview / relative time
- Composer surface detectable via `aria-label` like `Send this text to MyAI` after selecting My AI

## Findings

### QA-001 — Single-tab lock (“Oops! Too many tabs…”)
- **Area:** Snapchat
- **Severity:** P0
- **Steps:** 1. Have Snapchat Web open in a normal tab. 2. Open/control another tab via Reduck `start_session` / navigation to `web.snapchat.com`.
- **Expected:** Automation tab becomes the active session or shares state cleanly.
- **Actual:** Modal: “Snapchat can only be open in one tab at a time.” Clicking dismisses temporarily; actions often re-trigger it.
- **Workaround:** Close all other Snapchat Web tabs before runs; scripts call a dismiss helper then wait.
- **Date:** 2026-09-21

### QA-002 — URL host vs Reduck host folder
- **Area:** Both
- **Severity:** P2
- **Steps:** Navigate to `https://web.snapchat.com`.
- **Expected:** Stay on `web.snapchat.com`.
- **Actual:** Lands on `https://www.snapchat.com/web/` (title like `(N) Snapchat`).
- **Workaround:** Scripts `goto` `https://www.snapchat.com/web/`; local/Reduck host id stays `web.snapchat.com` per plan.
- **Date:** 2026-09-21

### QA-003 — `start_session` is a fresh browser (no prior cookies)
- **Area:** Reduck
- **Severity:** P1
- **Steps:** Read authoring docs; start session; open Snapchat.
- **Expected:** Confusion with “I’m already logged in on Chrome”.
- **Actual:** Session browsers start clean; login state appeared because the paired profile / prior Web session interacted with the one-tab lock. Saved scripts must set `loggedIn: true` so `run_script` injects device cookies.
- **Workaround:** Use `run_script` with `loggedIn: true` for production scripts; keep one Web session only.
- **Date:** 2026-09-21

### QA-004 — Desktop App install banner
- **Area:** Snapchat
- **Severity:** P3
- **Steps:** Load logged-in Web chat list.
- **Expected:** Clean chat list.
- **Actual:** Blue banner “Click to install the Desktop App…” sits above Search / chats.
- **Workaround:** Scripts ignore banner text when parsing list items; optional dismiss if a close control is found.
- **Date:** 2026-09-21

### QA-005 — Chat open does not always reveal a classic message transcript
- **Area:** Snapchat
- **Severity:** P1
- **Steps:** Click `My AI` list item after dismiss.
- **Expected:** Message history + textbox in main pane.
- **Actual:** Center pane often still shows camera / “Create Bitmoji”; composer aria appears intermittently; listitem status changes (e.g. to “Received · 34m”). Message DOM is sparse / virtualized.
- **Workaround:** `list_chat_messages` returns structured empty `messages: []` with `opened`/`note` rather than timing out; prefer parsing visible text nodes when present.
- **Date:** 2026-09-21

### QA-007 — Private script quota (3) blocks new private hosts
- **Area:** Reduck
- **Severity:** P2
- **Steps:** 1. Own 3 private Anybuddy scripts. 2. `create_script` for `web.snapchat.com/check_session` with visibility private.
- **Expected:** Create succeeds or clear upgrade path before authoring.
- **Actual:** Error: “You've reached your plan's limit of 3 private scripts.”
- **Workaround:** Created Snapchat scripts as **public**; documented in SCOPE.
- **Date:** 2026-09-21

### QA-008 — Loose chat name match false-positive
- **Area:** Both (our script + Snapchat DOM)
- **Severity:** P1
- **Steps:** `open_chat` with `name=zzz-nonexistent-chat-xyz` on v1 matching `target.includes(rowName)`.
- **Expected:** `notFound: true`.
- **Actual:** `opened: true` (empty/short row names satisfy `"".includes` / over-broad contains).
- **Workaround:** Promoted v2: require `rowName.length >= 2` and only `rowName === target || rowName.includes(target)`.
- **Date:** 2026-09-21

### QA-010 — Empty `open_chat.name` fails at schema, not script body
- **Area:** Reduck
- **Severity:** P3
- **Steps:** `run_script` `open_chat` with `name: ""`.
- **Expected:** Script throws `name is required` OR schema rejects.
- **Actual:** MCP args validation: `data/name must NOT have fewer than 1 characters` (meta `minLength: 1`).
- **Workaround:** Critical suite asserts `ok:false` + `errorIncludes: "name"`. Both layers are fine.
- **Date:** 2026-09-21

### QA-011 — Filters/Lenses only on camera Snap path, not chat file upload
- **Area:** Snapchat
- **Severity:** P2 (capability gap for “upload + filter”)
- **Steps:** 1. In an open chat, attach via `input[name=uploadImages]` / gallery. 2. Look for Lens/filter UI before send. 3. Separately open composer camera control → capture overlay.
- **Expected:** Filters available either on uploaded chat images or clearly documented as camera-only.
- **Actual:** Chat upload stages an image with Send only — no Lens carousel. Camera overlay (`Hold to record` / `Click to record`) exposes a Lens carousel (e.g. “funny face…”); capture → Send To modal → Send. Confirmed toast: `Snap sent!`
- **Workaround:** For filtered media, use camera Snap flow (composer left camera control), select a Lens, shutter, then Send To. Face Lenses need a face in the webcam feed; otherwise the Lens label applies but the preview looks like a plain photo.
- **Date:** 2026-09-22

### QA-012 — Post to My Story works; gallery image → Story not available on Web
- **Area:** Snapchat
- **Severity:** P2
- **Steps:** 1. Home camera → shutter → **Send To**. 2. Select **My Story** (Friends Only) only. 3. **Send**. Separately try attaching a local image via chat `uploadImages` and look for Story destination.
- **Expected:** Both camera snaps and uploaded images can go to My Story.
- **Actual:** Camera path works: Send To lists Stories / My Story; after Send the modal closes (story posted). Chat/file upload only stages a chat attachment — no Story destination. Camera `…` menu is device picker only (no camera-roll upload).
- **Workaround:** Post Stories from the camera Snap → Send To → My Story flow. For a specific generated file, send in chat instead, or capture/webcam for Story.
- **Date:** 2026-09-22

## What worked well (updated)
- Live probe proved GO: chat list via `[role=listitem]`
- Full chain demo: session → chats → open My AI → messages (incl. real My AI welcome)
- Draft → promote for the name-match fix
- Local `cases.json` + `run-benchmark.mjs` → **5/5** `benchmarks/latest.md`
- Cursor rules kept agent on safety + quality rails
