# Snapchat Web tests

| File | Purpose | Report |
|------|---------|--------|
| `cases.json` | Smoke | `benchmarks/latest.md` |
| `critical-cases.json` | Edges | `benchmarks/critical.md` |
| `checkExpect.test.js` | Host expect keys (ReDuckHunt) | Actions Summary |

Evaluator: `run-benchmark.mjs`. Run live suites **sequentially** (see [BAN_RISKS](../docs/BAN_RISKS.md)).

```bash
# after Reduck runs → .last-runs.json / .critical-runs.json
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.last-runs.json

node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.critical-runs.json \
  --cases scripts/web.snapchat.com/tests/critical-cases.json \
  --out critical
```

Static: `npm test` from repo root.
