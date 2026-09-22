# Scope — Snapchat Web

Read-only chat digest on `https://www.snapchat.com/web/`.

## Scripts

| Script | Role |
|--------|------|
| `check_session` | Logged in? |
| `list_chats` | Top N chats |
| `open_chat` | Open by display name |
| `list_chat_messages` | Visible text messages |

```
check_session → list_chats → open_chat → list_chat_messages
```

## Out of scope

- Auto-Send, friend adds, Story/Spotlight spam
- Unofficial APIs, mobile automation
- Personal accounts

## Notes

- Host id `web.snapchat.com`; URL is `www.snapchat.com/web/`
- One Web tab at a time
- Scripts are public (private quota used elsewhere)

See [LIMITATIONS.md](LIMITATIONS.md), [BAN_RISKS.md](BAN_RISKS.md), [TOKEN_AND_QUOTA.md](TOKEN_AND_QUOTA.md).
