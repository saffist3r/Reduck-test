# Scope — Snapchat Web

Chat digest + one optional image send on `https://www.snapchat.com/web/`.

## Scripts

| Script | Role | Effects |
|--------|------|---------|
| `check_session` | Logged in? | none |
| `list_chats` | Top N chats | none |
| `open_chat` | Open by display name | none |
| `list_chat_messages` | Visible text messages | none |
| `send_chat_image` | Upload image + send in a chat | **write** |

```
check_session → list_chats → open_chat → list_chat_messages
                                      ↘ send_chat_image (write, test account)
```

Full contracts: [SCRIPTS.md](SCRIPTS.md)

## Out of scope

- Mass DMs, friend spam, Story/Spotlight blasting, engagement farming
- Unofficial APIs, mobile automation
- Personal accounts (use a dedicated test account)
- Auto-Send in the **read** scripts (only `send_chat_image` clicks Send / Enter)
## Notes

- Reduck host id: `web.snapchat.com`
- Canonical URL: `www.snapchat.com/web/`
- One Web tab at a time
- Scripts are **public** (private quota used by other hosts)
- Local tree: `scripts/web.snapchat.com/`

[LIMITATIONS.md](LIMITATIONS.md) · [BAN_RISKS.md](BAN_RISKS.md) · [QA.md](QA.md)
