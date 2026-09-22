# Ban / enforcement risks

Not legal advice. Probable risk map from product behavior and common anti-abuse patterns.

**Policy:** test account · read-first · low rate · no spam.  
Read scripts never Send. The one write, `send_message`, only messages a chat that already exists, by exact name.

Guardrails built into `send_message` (not just advice):

| Guardrail | How |
|-----------|-----|
| Exact chat name only | Partial names refused with suggestions (`name: "TEST"` never reaches `TEST REDUCK`) |
| One chat per run | No recipient list; several people = several sequential runs |
| Confirmed or failed | `ok` only on `Delivered`; no silent retries |
| Never accept the My AI terms prompt | Stops with `ok: false` |
| `humanRequired: true`, `sideEffects: write` | Declared on the script |

Account acknowledgment: [QA.md](QA.md#snapchat-account-risk--acknowledgment).

## Critical

| Risk | Stance |
|------|--------|
| Mass DMs / friend farming / Story spam | Out of scope |
| Unofficial APIs / credential abuse | Never |
| Personal account | Never |

## High

| Risk | Mitigation |
|------|------------|
| Burst / parallel runs | Sequential + delays |
| Multi Web tabs | One tab; dismiss modal |
| Deep endless scrape | Cap `limit` |
| Auto camera / calls | Not automated |

## Medium

| Risk | Mitigation |
|------|------------|
| Automation fingerprints | Paired real Chrome |
| Tight polling | On-demand runs only |
| Ignore captcha / logout | Stop; log QA |

## Low

Normal paced list/open/read of a few chats.

## Observed product friction (not bans)

1. Single-tab lock — QA-001  
2. Session/modal fights between Web tabs  
3. Reduck monthly `run_script` quota (`whoami`) — plan limit, not a Snapchat ban

## Script map

| Script | Safe use |
|--------|----------|
| `check_session` | OK |
| `list_chats` | `limit` ≤ 20 |
| `open_chat` | Known names |
| `list_chat_messages` | Cap `limit`; no Send |
| `send_message` | People you know; a group + a few friends per event; ≥20s between runs; never parallel, never on a schedule |

## If challenged

Stop runs → log in QA → no retry storms → fix on the test account only.
