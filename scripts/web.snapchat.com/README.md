# web.snapchat.com

Read-only Snapchat for Web scripts.

```
scripts/          # script.js + meta.json
docs/
tests/
benchmarks/
```

## Scripts

| Folder | Address |
|--------|---------|
| `check_session` | `@saffist3r/web.snapchat.com/check_session` |
| `list_chats` | `@saffist3r/web.snapchat.com/list_chats` |
| `open_chat` | `@saffist3r/web.snapchat.com/open_chat` |
| `list_chat_messages` | `@saffist3r/web.snapchat.com/list_chat_messages` |

Chain: `check_session` → `list_chats` → `open_chat` → `list_chat_messages`

## Safety

- Test account only; low rate; no auto-Send
- Close other Snapchat Web tabs before runs

Docs: [SCOPE](docs/SCOPE.md) · [QA](docs/QA.md) · [LIMITATIONS](docs/LIMITATIONS.md) · [BAN_RISKS](docs/BAN_RISKS.md) · [QUOTA](docs/TOKEN_AND_QUOTA.md) · [SCRIPTS](docs/SCRIPTS.md)

## Live suite

```bash
node scripts/web.snapchat.com/tests/run-benchmark.mjs \
  --from-runs scripts/web.snapchat.com/tests/.last-runs.json
```

Static checks: `npm test` (ReDuckHunt).
