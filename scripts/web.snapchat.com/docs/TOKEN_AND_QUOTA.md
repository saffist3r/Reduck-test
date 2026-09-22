# Reduck runs & agent cost

Two meters (neither is a Snapchat ban signal):

| Meter | What | Where |
|-------|------|-------|
| Reduck runs | Each `run_script` | `whoami` → `runs N/100` |
| LLM tokens | Cursor agent / `ai.*` | Cursor usage; our scripts use no `ai.*` |

Snapshot **2026-09-22**:

```
runs 61/100 · resets 2026-10-21
web.snapchat.com ≈ 19 · anybuddyapp.com ≈ 42
```

## Suite cost (runs)

| Activity | Runs |
|----------|-----:|
| Smoke (5 cases) | ~5 |
| Critical (~12 unique runs) | ~12 |
| One digest chain | 4 |

## Agent tokens

Burn comes from probes/screenshots/orchestration — not from `run_script` itself. Prefer offline `run-benchmark.mjs` on saved run JSON; avoid screenshot loops once selectors are stable.

## Guardrails

| Rule | Value |
|------|-------|
| Digest | ≤ 4 runs |
| Smoke | sparingly |
| Critical | after real changes; sequential |
| Headroom | leave runs for demos |

Refresh:

```text
whoami
list_runs { host: web.snapchat.com }
```
