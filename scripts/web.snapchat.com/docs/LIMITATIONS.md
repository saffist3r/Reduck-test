# Limitations — Snapchat for Web × Reduck

Capabilities and hard stops observed while building the morning-digest scripts and probing write-side flows (chat image, Lens, Story). Cross-refs: [QA.md](QA.md), [SCOPE.md](SCOPE.md), [BAN_RISKS.md](BAN_RISKS.md).

---

## Product scope (intentional)

| Limitation | Why |
|------------|-----|
| No auto-Send in shipped scripts | Ban risk + assignment safety rails |
| No friend adds, mass DMs, Story/Spotlight farming | Ethical / brand-safe digests only |
| Web UI only — no unofficial Snap APIs, no mobile automation | Reduck browser model + ToS |
| Text bubbles only in `list_chat_messages` | Media/Bitmoji/Snap opens are fragile / out of digest job |

Shipped catalog: `check_session` → `list_chats` → `open_chat` → `list_chat_messages`.

---

## Snapchat for Web (platform)

| Limitation | Detail | QA |
|------------|--------|----|
| **One Web tab** | “Too many tabs” modal blocks automation if another Snapchat Web tab is open | QA-001 |
| **Host redirect** | `web.snapchat.com` → `www.snapchat.com/web/`; scripts must `goto` the canonical URL | QA-002 |
| **Sparse / virtualized chat DOM** | Opening a chat often leaves camera / Bitmoji in the center pane; message nodes appear late or not at all | QA-005 |
| **Desktop App banner** | Install CTA sits above Search; harmless but pollutes text scrapes if not ignored | QA-004 |
| **Filters / Lenses = camera only** | Chat gallery upload (`input[name=uploadImages]`) stages an image with Send — **no** Lens carousel. Lenses live on the camera Snap overlay (`Hold to record` / shutter) | QA-011 |
| **Gallery image → My Story = not on Web** | Story post works from **camera Snap → Send To → My Story**. Chat/file upload has no Story destination. Camera `…` is device picker only (no camera-roll upload) | QA-012 |
| **Face Lenses need a face** | Without a face in the webcam feed, a Lens can be selected but the preview looks like a plain photo | QA-011 |
| **No fake webcam via Reduck alone** | Feeding a video/file as the camera device needs OS virtual cam (e.g. OBS) or Chrome flags on the paired browser — not something `exec_code` can inject | — |

### What *does* work on Web (probed, not shipped as scripts)

- Send a local image in chat via `setInputFiles` (prefer Node `Buffer` / bytes — Desktop path + naive `atob`/`DataTransfer` paths fail or corrupt).
- Capture webcam → optional Lens → **Send To** → friend and/or **My Story**.
- One-off sends only when explicitly requested; never promote auto-Send scripts for this take-home.

---

## Reduck / tooling

| Limitation | Detail | QA |
|------------|--------|----|
| **Private script quota = 3** | Free plan: new private scripts fail once Anybuddy fills the quota. Snapchat scripts are **public** | QA-007 |
| **`start_session` is a clean browser** | No “I’m already logged in in Chrome” unless cookies are injected. Production: `run_script` + `loggedIn: true` | QA-003 |
| **`setInputFiles` + absolute Desktop paths** | Extension/session may lack file-URL access; upload via in-memory bytes instead | — |
| **Run / agent token burn** | Each live probe burns Reduck runs and Cursor tokens — see [TOKEN_AND_QUOTA.md](TOKEN_AND_QUOTA.md) | — |
| **Schema vs script errors** | Empty `open_chat.name` fails MCP `minLength` before script body runs | QA-010 |

---

## Script reliability caveats

| Caveat | Mitigation |
|--------|------------|
| Loose name match can false-open chats | `open_chat` requires meaningful `rowName` and `===` / `rowName.includes(target)` (QA-008) |
| `list_chat_messages` may return `messages: []` | Structured empty + `note`; do not treat as hard failure for Bitmoji/camera panes |
| Multi-tab flakiness | Close other Snapchat Web tabs before every suite / demo |
| Ban / challenge risk | Dedicated test account, low rate, read-first — [BAN_RISKS.md](BAN_RISKS.md) |

---

## Quick decision guide

| Want… | On Snapchat Web via Reduck? |
|-------|-----------------------------|
| Morning text digest | Yes — shipped scripts |
| Send local image in a chat | Yes — one-off / exploratory (not in catalog) |
| Image + Lens filter | Camera path only; need face for face Lenses |
| Specific file as Story | **No** on Web — camera Snap → My Story only |
| Video file as webcam | Not via Reduck alone — OS virtual camera |
| Auto-post Stories / blast | Out of scope (safety) |
