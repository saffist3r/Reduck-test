# Reduck-test

[Reduck](https://reduck.ai) browser-automation scripts for two sites, plus a Vitest suite that checks them in CI.

```
scripts/anybuddyapp.com/    # court booking search (public, no login)
scripts/web.snapchat.com/   # Snapchat Web: 4 read scripts + send_message (write: text and/or image)
tools/ReDuckHunt/           # Vitest runner (discovers scripts/<host>/)
```

## Hosts

| Host | Scripts | Live results | Details |
|------|---------|--------------|---------|
| `anybuddyapp.com` | `search_locations`, `search_clubs`, `get_club`, `list_public_matches` | smoke 9/9 | [README](scripts/anybuddyapp.com/README.md) |
| `web.snapchat.com` | `check_session`, `list_chats`, `open_chat`, `list_chat_messages`, `send_message` | smoke 5/5 · critical 14/14 · write 3/3 | [README](scripts/web.snapchat.com/README.md) |

All scripts are public under `@saffist3r/<host>/<slug>`. Each folder holds a local mirror (`script.js` + `meta.json`) of the version promoted on Reduck. Live reports are in `scripts/<host>/benchmarks/`.

## Tests

```bash
npm install --prefix tools/ReDuckHunt
npm test
```

Static checks only (contracts, syntax, case files, expect matcher). Live runs go through Reduck and are scored with each host's `tests/run-benchmark.mjs`.

CI report: Actions **Summary**.
