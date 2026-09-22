# Scripts — web.snapchat.com

Handle: `@saffist3r`  
Local mirrors: `scripts/web.snapchat.com/scripts/<slug>/{script.js,meta.json}`  
URL: `https://www.snapchat.com/web/` (Reduck host id stays `web.snapchat.com`)

Read four: `loggedIn: true`, `sideEffects: none`, `visibility: public`, never Send.  
Write one: `send_message` (`sideEffects: write`, `humanRequired: true`) — test account only.

```
check_session → list_chats → open_chat → list_chat_messages
                                      ↘ send_message (write)
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

## `send_message`

`@saffist3r/web.snapchat.com/send_message` (replaces the archived `send_chat_image`)

**Write.** Opens an optional chat by name, then sends text, an image, or both. The image goes through `input[name=uploadImages]`; text is pasted into the composer; Enter sends (never the “Send this text to MyAI” shortcut). With both, Snapchat sends two messages (text, then image).

`ok` is true only when the chat’s sidebar row **changes** after the send and settles on `Delivered · just now` with nothing still `Sending…`. Stops with `ok: false` on the My AI disclaimer (never accepts it) or when no composer appears. Throws if neither `text` nor `image.png` is given. Prefer a self-chat / test friend.

| | |
|--|--|
| **Args** | `text` (optional); `image.png` (file, optional) — at least one; `name` (optional) |
| **Returns** | `ok`, `delivered`, `clicked`, `sentText`, `sentImage`, `error`, `snippet`; open meta: `opened`, `notFound`, `name`, `matchedName`, `available[]` |
| **Effects** | `sideEffects: write`, `humanRequired: true` |

Fixture for local smoke: `tests/fixtures/send-test.png`.

---

## Docs

[SCOPE](SCOPE.md) · [QA](QA.md) · [LIMITATIONS](LIMITATIONS.md) · [BAN_RISKS](BAN_RISKS.md)  
Benchmarks: [`../benchmarks/latest.md`](../benchmarks/latest.md) · [`../benchmarks/critical.md`](../benchmarks/critical.md) · [`../benchmarks/write.md`](../benchmarks/write.md)
