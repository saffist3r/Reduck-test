# Snapchat Web tests

## Suites

| File | Purpose | Report |
|------|---------|--------|
| `cases.json` | Smoke (5 cases) | `benchmarks/latest.md` |
| `critical-cases.json` | Capability + edges (14 cases) | `benchmarks/critical.md` |

Evaluator: `run-benchmark.mjs`

## Critical suite — what it stresses

| Tag | Capabilities |
|-----|----------------|
| `session` | loggedIn, url shape, tooManyTabs false, required keys |
| `list` | min/max count vs `limit`, My AI present, row shape |
| `open` | exact / case-insensitive / partial match, notFound + available[], empty name error |
| `messages` | min text content, limit cap, notFound empty |

## How to run (IMPORTANT)

**Sequential only** — do not parallel-blast. See [docs/BAN_RISKS.md](../docs/BAN_RISKS.md).

1. Close other Snapchat Web tabs.
2. Ask the agent: **“run the Snapchat critical suite”** (delays between `run_script` calls).
3. Evaluate:

```bash
node web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs web.snapchat.com/tests/.critical-runs.json \
  --cases web.snapchat.com/tests/critical-cases.json \
  --out critical
```

Smoke:

```bash
node web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs web.snapchat.com/tests/.last-runs.json
```

## Safety
Dedicated test account only. Keep `limit` small. Stop if Snapchat challenges the account.
