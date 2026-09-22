# Limitations — Snapchat Web

Hard stops for scripts under `scripts/web.snapchat.com/`. See [QA.md](QA.md) · [SCRIPTS.md](SCRIPTS.md).

## Catalog

| Choice | Why |
|--------|-----|
| No auto-Send in **read** scripts | Ban risk; only `send_message` sends |
| No friend spam / Story farming | Abuse surface |
| Web UI only | No unofficial APIs |
| Text messages only (read) | Media DOM is fragile; sending images is `send_message` |

## Platform

| Limit | Detail | QA |
|-------|--------|----|
| One Web tab | “Too many tabs” modal | QA-001 |
| Host redirect | `web.snapchat.com` → `www.snapchat.com/web/` | QA-002 |
| Sparse chat DOM | Camera/Bitmoji pane; virtualized messages | QA-005 |
| Desktop App banner | Noise in scrapes | QA-004 |
| Lenses = camera only | Chat upload has no Lens UI | QA-011 |
| No gallery → My Story | Story only via camera Snap → Send To | QA-012 |
| Chat open → camera / My AI modal | Blocks `uploadImages` until real composer | QA-013 |
| MyAI “Send” aria-label | Steals send click after image stage | QA-014 |
| Face Lenses need a face | Else preview looks plain | QA-011 |
| No fake webcam via Reduck | Needs OS virtual cam / Chrome flags | — |

Works in catalog: `send_message` (text paste and/or upload via `uploadImages`, then Enter). Camera → Lens → Send To → chat or My Story was probed but not catalogued.

## Reduck

| Limit | Detail | QA |
|-------|--------|----|
| Private scripts cap = 3 | Snapchat scripts are public | QA-007 |
| `start_session` is clean | Use `run_script` + `loggedIn: true` | QA-003 |
| Desktop path uploads flaky | Prefer in-memory bytes | — |
| Run quota | Each `run_script` counts against Reduck plan (`whoami`) — not a Snapchat ban signal | — |
| Empty `open_chat.name` | MCP schema rejects before script | QA-010 |

## Caveats

| Issue | Mitigation |
|-------|------------|
| Loose name match | Exact / includes with min length (QA-008) |
| Empty messages | Structured `messages: []` + note |
| Multi-tab flake | Close other Web tabs |
| Send confirmation | `send_message` is `ok` only when the chat row changes after Enter and settles on `Delivered · just now` (no `Sending…`). Rows are matched by display name, so two chats with the same name can confuse it |
| Text + image | Snapchat sends them as two messages (text first); there is no single "image with caption" message | 
| Multi-tab takeover | Another Snapchat tab can re-show “Too many tabs” after the chat opens; `send_message` keeps dismissing it for 20s while waiting for the composer (QA-015) |
| My AI disclaimer | `send_message` stops with `ok: false`; accept it manually (never automated) |
| Benchmark timing | Step-trace sum per run, excludes browser startup; backfilled via `read_run_trace`, not measured by `run-benchmark.mjs` |
| Ban risk | Test account, low rate — [BAN_RISKS.md](BAN_RISKS.md) |
