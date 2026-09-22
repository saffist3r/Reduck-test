# Anybuddy tests

| File | Purpose |
|------|---------|
| `cases.json` | Live matrix |
| `checkExpect.test.js` | Host expect keys (ReDuckHunt) |
| `run-benchmark.mjs` | Evaluate run payloads |

```bash
node scripts/anybuddyapp.com/tests/run-benchmark.mjs \
  --from-runs scripts/anybuddyapp.com/tests/.last-runs.json
```

→ `benchmarks/latest.{json,md}` + `benchmarks/history/`.

Static: `npm test` from repo root.

`list_public_matches` covers empty matches and 404 city without hanging.
