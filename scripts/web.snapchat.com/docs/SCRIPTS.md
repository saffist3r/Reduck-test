# Scripts — web.snapchat.com

Handle: `@saffist3r`  
Local mirrors: `scripts/web.snapchat.com/scripts/<slug>/{script.js,meta.json}`  
URL: `https://www.snapchat.com/web/` (Reduck host id stays `web.snapchat.com`)

All four: `loggedIn: true`, `sideEffects: none`, `visibility: public`, never Send.

```
check_session → list_chats → open_chat → list_chat_messages
```

---

## `check_session`

`@saffist3r/web.snapchat.com/check_session`

Opens Snapchat for Web; reports login + url/title; dismisses the single-tab modal.

| | |
|--|--|
| **Args** | none |
| **Returns** | `loggedIn`, `url` (required); `username`, `displayName`, `tooManyTabs`, `title` |

---

## `list_chats`

`@saffist3r/web.snapchat.com/list_chats`

Top N chat rows (name, preview, relative time, unread hint).

| | |
|--|--|
| **Args** | `limit` (1–50, default 10) |
| **Returns** | `count`, `chats[]`, `url`; optional `loggedIn`, `tooManyTabs` |
| **Row** | `name`, `preview`, `when`, `unread` |

---

## `open_chat`

`@saffist3r/web.snapchat.com/open_chat`

Open a chat by display name from `list_chats`. Read-only navigation.

| | |
|--|--|
| **Args** | `name` (required, minLength 1) |
| **Returns** | `opened`, `name`, `url`; `notFound`, `matchedName`, `available[]`, `composerHint`, `tooManyTabs`, `title` |

Match: exact or `rowName.includes(target)` with a meaningful row name (see QA-008).

---

## `list_chat_messages`

`@saffist3r/web.snapchat.com/list_chat_messages`

Optionally open by name, then scrape **visible text** bubbles. Empty pane → `count: 0` + `note` (no hang).

| | |
|--|--|
| **Args** | `name` (optional), `limit` (1–50, default 20) |
| **Returns** | `count`, `messages[]`, `url`; `opened`, `notFound`, `name`, `composerHint`, `tooManyTabs`, `note` |
| **Message** | `text`, `from`, `when`, `type` |

---

## Docs

[SCOPE](SCOPE.md) · [QA](QA.md) · [LIMITATIONS](LIMITATIONS.md) · [BAN_RISKS](BAN_RISKS.md)  
Benchmarks: [`../benchmarks/latest.md`](../benchmarks/latest.md) · [`../benchmarks/critical.md`](../benchmarks/critical.md)
