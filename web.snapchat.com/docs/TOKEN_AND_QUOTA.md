# Token & quota consumption — assessment

Two different “meters” matter for this take-home. Confusing them leads to bad risk calls.

| Meter | What it is | Where we see it | Snapchat ban? |
|-------|------------|-----------------|---------------|
| **Reduck runs** | Each `run_script` / billed browser execution | `whoami` → `runs N/100` | No — plan limit |
| **LLM tokens** | Cursor agent + any Reduck `ai.*` calls | Cursor usage UI; scripts here use **no** `ai` builtin | No — agent cost |

Snapchat does **not** bill us in tokens. Token/run burn is a **project / plan risk**: you can exhaust Reduck monthly runs or Cursor budget while “just testing.”

Snapshot measured **2026-09-22** via Reduck `whoami` + `list_runs`.

---

## 1. Reduck run quota (hard data)

```
usage: runs 61/100 · cloud browser 0/60 min · residential proxy 0/25 MB
resets: 2026-10-21
```

| Bucket | Count | Notes |
|--------|------:|-------|
| Period quota | 100 | Free-plan style cap |
| Used (all hosts) | **61** | Anybuddy + Snapchat + probe |
| Remaining | **39** | Until 2026-10-21 |
| `web.snapchat.com` runs listed | **19** | From `list_runs` host filter |
| `anybuddyapp.com` runs listed | **42** | Same period (page shows 42 total) |

### Snapchat run mix (19)

| Script | Approx share of Snapchat runs |
|--------|-------------------------------|
| `open_chat` | ~8 |
| `list_chat_messages` | ~5 |
| `list_chats` | ~4 |
| `check_session` | ~2 |

Includes smoke suite, critical suite, and open-chat matching fixes.

### Cost of our suites (runs, not tokens)

| Activity | Reduck runs | % of monthly 100 |
|----------|------------:|-----------------:|
| Smoke suite (`cases.json`, 5 cases) | ~5 | 5% |
| Critical suite (14 cases, ~12 unique `run_script`s)* | ~12 | 12% |
| One production morning digest | **4** | 4% |
| Full digest every weekday × 4 weeks | 4 × 20 = **80** | 80% |

\*Critical suite reuses some results for shape checks; unique browser executions ≈ 12.

**Verdict:** Critical + smoke alone already spent a large share of Snapchat’s 19 runs. At 4 runs/day for a real digest, the **100-run month is the binding constraint**, not Snapchat tokens.

---

## 2. LLM token estimates (soft data)

Reduck MCP does **not** expose per-run LLM token counts for `run_script`. Our scripts do **not** call `ai.*`, so **script execution itself is not an LLM completion** — cost is browser/run quota.

LLM tokens appear when a **Cursor agent** authors, probes (`start_session` + screenshots), or orchestrates suites.

### Static size of our artifacts (~4 chars ≈ 1 token)

| Artifact | Chars | ~Tokens |
|----------|------:|--------:|
| `check_session/script.js` | 2 260 | ~565 |
| `list_chats/script.js` | 2 875 | ~719 |
| `open_chat/script.js` | 3 305 | ~826 |
| `list_chat_messages/script.js` | 4 186 | ~1 046 |
| **All script bodies** | 12 626 | **~3 200** |
| All `docs/*.md` | 14 230 | ~3 600 |
| Critical suite JSON results (stored) | — | ~720 |

### Agent-side burn (order-of-magnitude)

These are **estimates** for planning, not Cursor invoices:

| Activity | Why it burns tokens | Rough order |
|----------|---------------------|-------------|
| DOM probe + screenshots in chat | Image/screenshot descriptions + page dumps | **High** (tens–hundreds of kTok per deep probe session) |
| `create_script` with full `code` in MCP args | Full body in tool JSON | ~0.5–1kTok per script create |
| Orchestrating critical suite in agent | Tool results echoed into context each run | **Medium–high** (grows with each YAML result) |
| Re-running evaluator locally (`node run-benchmark.mjs`) | No LLM | **0** |

**Mitigation for agent tokens:** prefer `run_script` without pasting full traces; write results to `.critical-runs.json` and evaluate offline; avoid screenshot loops once selectors are known; use `edits` instead of full `code` redeploys.

---

## 3. Risk rating (project)

| Risk | Level | Why |
|------|-------|-----|
| Exhaust Reduck monthly runs mid-take-home | **High** | 61/100 already; one critical suite ≈ 12% |
| Agent context bloat from suite orchestration | **Medium** | Many MCP result blobs in one chat |
| Snapchat ban from “token use” | **N/A** | Not a Snapchat meter |
| Accidental `ai.*` in scripts later | **Medium** | Would add model $ on top of runs — keep scripts deterministic |

---

## 4. Budgets we should keep

| Guardrail | Rule |
|-----------|------|
| Production digest | ≤ **4 runs** / invocation |
| Smoke suite | ≤ **1× / day** while iterating |
| Critical suite | ≤ **1× / major change**; sequential delays (also Snapchat-safe) |
| Remaining period | Leave ≥ **20 runs** headroom for Loom rehearsal demos |
| Agent | After scripts are stable, run suites via short prompts (“run critical suite”) not full recon |

---

## 5. How to refresh this data

```text
whoami                          → runs used / quota / reset
list_runs { host: web.snapchat.com } → count Snapchat executions
```

Local size refresh:

```bash
wc -c web.snapchat.com/scripts/*/script.js
```

---

## Acknowledgement

Quota and LLM-token burn are **our** constraints (Reduck plan + Cursor agent), distinct from Snapchat enforcement in [BAN_RISKS.md](BAN_RISKS.md). Over-testing can fail the take-home by hitting `61→100` before the Loom is recorded.
