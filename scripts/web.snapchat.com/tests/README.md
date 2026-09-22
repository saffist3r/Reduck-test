# Snapchat Web tests

Repo: `scripts/web.snapchat.com/tests/`

| File | Purpose | Output |
|------|---------|--------|
| `cases.json` | Smoke (5) | `../benchmarks/latest.md` |
| `critical-cases.json` | Edges (14) | `../benchmarks/critical.md` |
| `checkExpect.test.js` | Host expect keys via ReDuckHunt | Actions Summary |
| `run-benchmark.mjs` | Score Reduck run JSON | benchmarks + history |

Live suites: **sequential only** ([BAN_RISKS](../docs/BAN_RISKS.md)). Close other Web tabs first.

```bash
# smoke — after writing .last-runs.json from Reduck
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.last-runs.json

# critical
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.critical-runs.json \
  --cases scripts/web.snapchat.com/tests/critical-cases.json \
  --out critical
```

Static: `npm test` from repo root (includes this folder’s `*.test.js`).
