# web.snapchat.com

Snapchat for Web scripts (`@saffist3r`) — four read + one write image send.

Repo path: `scripts/web.snapchat.com/`

```
scripts/<slug>/     # script.js + meta.json
docs/               # SCOPE, QA, SCRIPTS, …
tests/              # cases, critical-cases, write-cases, fixtures, checkExpect, run-benchmark
benchmarks/         # latest + critical + write reports
```

## Scripts

| Slug | Address | Job |
|------|---------|-----|
| `check_session` | `@saffist3r/web.snapchat.com/check_session` | Logged in? |
| `list_chats` | `@saffist3r/web.snapchat.com/list_chats` | Top N chats |
| `open_chat` | `@saffist3r/web.snapchat.com/open_chat` | Open by name |
| `list_chat_messages` | `@saffist3r/web.snapchat.com/list_chat_messages` | Visible text |
| `send_chat_image` | `@saffist3r/web.snapchat.com/send_chat_image` | Upload + send image (**write**) |

Chain: `check_session` → `list_chats` → `open_chat` → `list_chat_messages`  
Write: `send_chat_image` (fixture `tests/fixtures/send-test.png`)

Contracts: [docs/SCRIPTS.md](docs/SCRIPTS.md)

## Safety

- Test account only · low rate · read scripts never Send
- `send_chat_image` is deliberate write — prefer a self-chat; avoid blasting My AI / friends
- Close other Snapchat Web tabs before runs

[SCOPE](docs/SCOPE.md) · [QA](docs/QA.md) · [LIMITATIONS](docs/LIMITATIONS.md) · [BAN_RISKS](docs/BAN_RISKS.md) · [SCRIPTS](docs/SCRIPTS.md)

## Latest live results

| Suite | Result | Script time | Report |
|-------|--------|-------------|--------|
| Smoke | 5/5 | 33.6s | [benchmarks/latest.md](benchmarks/latest.md) |
| Critical | 14/14 | 75.5s | [benchmarks/critical.md](benchmarks/critical.md) |
| Write (`send_chat_image`) | 2/2 | 15.8s | [benchmarks/write.md](benchmarks/write.md) |

Script time = sum of Reduck step-trace durations (excludes browser startup). Each report lists the Reduck run id per case.

## Tests

Static (ReDuckHunt): `npm test` from repo root.

Live suites are scored from local run files (`tests/.*-runs.json`, gitignored); the committed reports in `benchmarks/` are the record.

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

Write (`send_chat_image`, test account):

```bash
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.write-runs.json \
  --cases scripts/web.snapchat.com/tests/write-cases.json \
  --out write
```
