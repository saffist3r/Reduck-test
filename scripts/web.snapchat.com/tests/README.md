# Snapchat Web tests

Repo: `scripts/web.snapchat.com/tests/`

| File | Purpose | Output |
|------|---------|--------|
| `cases.json` | Smoke (5 read) | `../benchmarks/latest.md` |
| `critical-cases.json` | Edges (14 read) | `../benchmarks/critical.md` |
| `write-cases.json` | Write smoke (`send_message`: text, image + text, not found) | `../benchmarks/write.md` |
| `scope-cases.json` | Event scope end to end: exact-name safety, group send, replies `since`, matching regression | `../benchmarks/scope.md` |
| `fixtures/send-test.png` | Tiny PNG for the image case | — |
| `checkExpect.test.js` | Host expect keys via ReDuckHunt | Actions Summary |
| `run-benchmark.mjs` | Score Reduck run JSON | benchmarks + history |

Live suites: **sequential only** ([BAN_RISKS](../docs/BAN_RISKS.md)). Close other Web tabs first. Write suite: once, test account, prefer self-chat.

```bash
# smoke — after writing .last-runs.json from Reduck
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.last-runs.json

# critical
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.critical-runs.json \
  --cases scripts/web.snapchat.com/tests/critical-cases.json \
  --out critical

# write (after .write-runs.json)
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.write-runs.json \
  --cases scripts/web.snapchat.com/tests/write-cases.json \
  --out write

# scope (after .scope-runs.json)
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.scope-runs.json \
  --cases scripts/web.snapchat.com/tests/scope-cases.json \
  --out scope
```

Run files hold each case’s Reduck `runId`, result and `durationMs`. `durationMs` is the sum of the run’s step-trace durations (`read_run_trace`), so it excludes browser startup. Cases scored from the same run count its time once.

Static: `npm test` from repo root (includes this folder’s `*.test.js`).
