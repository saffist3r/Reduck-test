# web.snapchat.com

Read-only Snapchat for Web scripts (`@saffist3r`).

Repo path: `scripts/web.snapchat.com/`

```
scripts/<slug>/     # script.js + meta.json
docs/               # SCOPE, QA, SCRIPTS, …
tests/              # cases, critical-cases, checkExpect, run-benchmark
benchmarks/         # latest + critical reports
```

## Scripts

| Slug | Address | Job |
|------|---------|-----|
| `check_session` | `@saffist3r/web.snapchat.com/check_session` | Logged in? |
| `list_chats` | `@saffist3r/web.snapchat.com/list_chats` | Top N chats |
| `open_chat` | `@saffist3r/web.snapchat.com/open_chat` | Open by name |
| `list_chat_messages` | `@saffist3r/web.snapchat.com/list_chat_messages` | Visible text |

Chain: `check_session` → `list_chats` → `open_chat` → `list_chat_messages`

Contracts: [docs/SCRIPTS.md](docs/SCRIPTS.md)

## Safety

- Test account only · low rate · no auto-Send
- Close other Snapchat Web tabs before runs

[SCOPE](docs/SCOPE.md) · [QA](docs/QA.md) · [LIMITATIONS](docs/LIMITATIONS.md) · [BAN_RISKS](docs/BAN_RISKS.md) · [TOKEN_AND_QUOTA](docs/TOKEN_AND_QUOTA.md)

## Tests

Static (ReDuckHunt): `npm test` from repo root.

Live smoke (after Reduck runs → `.last-runs.json`):

```bash
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.last-runs.json
```

Critical:

```bash
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.critical-runs.json \
  --cases scripts/web.snapchat.com/tests/critical-cases.json \
  --out critical
```
