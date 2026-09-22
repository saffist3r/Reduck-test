# Reduck-test

[Reduck](https://reduck.ai) browser-automation scripts, plus a Vitest suite that checks them in CI.

## The Snapchat challenge → [`scripts/web.snapchat.com/`](scripts/web.snapchat.com/README.md)

**Use case:** a host (parties, a five-a-side team, a small association) tells his friends and groups about an event or an update, then collects the replies — without opening every chat by hand.

| Deliverable | Where |
|-------------|-------|
| Scripts (`@saffist3r/web.snapchat.com/<slug>`) | [README → Scripts](scripts/web.snapchat.com/README.md#scripts) · contracts in [SCRIPTS.md](scripts/web.snapchat.com/docs/SCRIPTS.md) |
| Scope write-up | [SCOPE.md](scripts/web.snapchat.com/docs/SCOPE.md) |
| QA report + account-risk acknowledgment | [QA.md](scripts/web.snapchat.com/docs/QA.md) · [BAN_RISKS.md](scripts/web.snapchat.com/docs/BAN_RISKS.md) · [LIMITATIONS.md](scripts/web.snapchat.com/docs/LIMITATIONS.md) |
| Live results | [benchmarks/](scripts/web.snapchat.com/benchmarks/) |

Scripts: `check_session`, `list_chats`, `send_message` (write), `list_chat_messages`, `open_chat`.

## Also in this repo

`scripts/anybuddyapp.com/` is a separate, earlier exercise (public court-booking search, no login, read-only) kept because it shares the test tooling. It is not part of the Snapchat scope. [README](scripts/anybuddyapp.com/README.md)

```
scripts/web.snapchat.com/   # the Snapchat challenge
scripts/anybuddyapp.com/    # separate read-only exercise
tools/ReDuckHunt/           # Vitest runner (discovers scripts/<host>/)
```

Each script folder holds a local mirror (`script.js` + `meta.json`) of the version promoted on Reduck. All scripts are public under `@saffist3r/<host>/<slug>`.

## Tests

```bash
npm install --prefix tools/ReDuckHunt
npm test
```

Static checks only (contracts, syntax, case files, expect matcher). Live runs go through Reduck and are scored with each host's `tests/run-benchmark.mjs`; the committed reports in `benchmarks/` are the record.

CI report: Actions **Summary**.
