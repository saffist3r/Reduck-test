# Ban / enforcement risks

Not legal advice. Probable risk map from product behavior and common anti-abuse patterns.

**Policy:** test account · read-first · low rate · no spam.  
Read scripts never Send. `send_chat_image` is the only write — self-chat / test friend, rare runs.

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
| `send_chat_image` | Test account; self-chat preferred; never parallel / never blast |

## If challenged

Stop runs → log in QA → no retry storms → fix on the test account only.
