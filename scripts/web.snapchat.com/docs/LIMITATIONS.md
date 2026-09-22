# Limitations — Snapchat Web

Hard stops for scripts under `scripts/web.snapchat.com/`. See [QA.md](QA.md) · [SCRIPTS.md](SCRIPTS.md).

## Catalog

| Choice | Why |
|--------|-----|
| No auto-Send | Ban risk |
| No friend spam / Story farming | Abuse surface |
| Web UI only | No unofficial APIs |
| Text messages only | Media DOM is fragile |

## Platform

| Limit | Detail | QA |
|-------|--------|----|
| One Web tab | “Too many tabs” modal | QA-001 |
| Host redirect | `web.snapchat.com` → `www.snapchat.com/web/` | QA-002 |
| Sparse chat DOM | Camera/Bitmoji pane; virtualized messages | QA-005 |
| Desktop App banner | Noise in scrapes | QA-004 |
| Lenses = camera only | Chat upload has no Lens UI | QA-011 |
| No gallery → My Story | Story only via camera Snap → Send To | QA-012 |
| Face Lenses need a face | Else preview looks plain | QA-011 |
| No fake webcam via Reduck | Needs OS virtual cam / Chrome flags | — |

Works when probed (not in catalog): chat image upload via `setInputFiles` (Buffer); camera → Lens → Send To → chat or My Story.

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
| Ban risk | Test account, low rate — [BAN_RISKS.md](BAN_RISKS.md) |
