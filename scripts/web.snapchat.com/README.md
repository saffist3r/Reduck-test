# web.snapchat.com

Snapchat for Web scripts (`@saffist3r`) for one job: **tell your friends and groups about an event or an update, then collect the replies.** Four read scripts + one write script. Why this scope: [docs/SCOPE.md](docs/SCOPE.md).

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
| `check_session` | `@saffist3r/web.snapchat.com/check_session` | Preflight: logged in, no tab lock |
| `list_chats` | `@saffist3r/web.snapchat.com/list_chats` | Friends + groups with exact names |
| `send_message` | `@saffist3r/web.snapchat.com/send_message` | Announcement or update (text and/or flyer image) to one exact chat, friend or group (**write**) |
| `list_chat_messages` | `@saffist3r/web.snapchat.com/list_chat_messages` | Replies, optionally only after the announcement (`since`) |
| `open_chat` | `@saffist3r/web.snapchat.com/open_chat` | Open one chat (read-only helper) |

Flow: `check_session` → `list_chats` → `send_message` (once per group / friend) → `list_chat_messages { since }`  
Fixture for image sends: `tests/fixtures/send-test.png`

Contracts: [docs/SCRIPTS.md](docs/SCRIPTS.md)

## Safety

- Test account only · low rate · read scripts never Send
- Writes: exact chat names only, one chat per run, runs one after another with a pause — a handful of chats per event, never a list blast
- Close other Snapchat Web tabs before runs
- Account-risk acknowledgment: [docs/QA.md](docs/QA.md#snapchat-account-risk--acknowledgment)

[SCOPE](docs/SCOPE.md) · [QA](docs/QA.md) · [LIMITATIONS](docs/LIMITATIONS.md) · [BAN_RISKS](docs/BAN_RISKS.md) · [SCRIPTS](docs/SCRIPTS.md)

## Latest live results

| Suite | Result | Script time | Report |
|-------|--------|-------------|--------|
| Smoke | 5/5 | 33.6s | [benchmarks/latest.md](benchmarks/latest.md) |
| Critical | 14/14 | 75.5s | [benchmarks/critical.md](benchmarks/critical.md) |
| Write (`send_message`) | 3/3 | 28.9s | [benchmarks/write.md](benchmarks/write.md) |
| Scope (event flow: exact-name safety, group send, replies `since`) | 6/6 | 50.0s | [benchmarks/scope.md](benchmarks/scope.md) |

Smoke and critical ran before the exact-name matching change (v3 of `open_chat` / `list_chat_messages` / `send_message`); the scope suite covers the new matching plus two regression cases on v3.

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

Write (`send_message`, test account):

```bash
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.write-runs.json \
  --cases scripts/web.snapchat.com/tests/write-cases.json \
  --out write
```
