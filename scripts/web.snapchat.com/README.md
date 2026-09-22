# web.snapchat.com

Reduck scripts for a **morning chat digest** on Snapchat for Web.

## Layout

```
scripts/web.snapchat.com/
  scripts/          # local script.js + meta.json mirrors
  docs/             # SCOPE, QA, SCRIPTS, Loom outline
  tests/            # cases.json + run-benchmark.mjs
  benchmarks/       # latest.md / latest.json + history/
```

## Safety
- Dedicated Snap test account only.
- Low request rate; read-first; **never** auto-Send.
- Close other Snapchat Web tabs before runs (single-tab lock).
- See [docs/SCOPE.md](docs/SCOPE.md), [docs/QA.md](docs/QA.md), [docs/LIMITATIONS.md](docs/LIMITATIONS.md), [docs/BAN_RISKS.md](docs/BAN_RISKS.md), [docs/TOKEN_AND_QUOTA.md](docs/TOKEN_AND_QUOTA.md), [docs/LOOM_OUTLINE_FR.md](docs/LOOM_OUTLINE_FR.md), [docs/SCRIPTS.md](docs/SCRIPTS.md).

## Scripts

| Local folder | Reduck address | Job |
|--------------|----------------|-----|
| `scripts/check_session/` | `@saffist3r/web.snapchat.com/check_session` | Am I logged in? |
| `scripts/list_chats/` | `@saffist3r/web.snapchat.com/list_chats` | Top N chats |
| `scripts/open_chat/` | `@saffist3r/web.snapchat.com/open_chat` | Open chat by display name |
| `scripts/list_chat_messages/` | `@saffist3r/web.snapchat.com/list_chat_messages` | Last M visible text messages |

Visibility: **public** (plan private quota already used by Anybuddy). Each script folder has `script.js` + `meta.json`.

## Chain
`check_session` → `list_chats` → `open_chat` → `list_chat_messages`

## Tests
- `tests/cases.json` — smoke (5)
- `tests/critical-cases.json` — capability suite (14)
- `node tests/run-benchmark.mjs --from-runs tests/.last-runs.json`
- Critical: `--cases tests/critical-cases.json --out critical` → `benchmarks/critical.md`
- Ban-risk map: [docs/BAN_RISKS.md](docs/BAN_RISKS.md)
