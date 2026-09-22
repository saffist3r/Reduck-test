# Scripts — web.snapchat.com

Handle: `@saffist3r`  
Local mirrors: `scripts/web.snapchat.com/scripts/<slug>/{script.js,meta.json}`  
URL: `https://www.snapchat.com/web/` (Reduck host id stays `web.snapchat.com`)

Use case: announce an event or an update to friends and groups, then collect replies ([SCOPE](SCOPE.md)).

Read four: `loggedIn: true`, `sideEffects: none`, `visibility: public`, never Send.  
Write one: `send_message` (`sideEffects: write`, `humanRequired: true`) — test account only. Several recipients = several runs, one after another.

```
check_session → list_chats → send_message (per group / friend) → list_chat_messages { since }
                          ↘ open_chat (read-only helper)
```

**Name matching (all scripts):** exact, case-insensitive name wins. Read scripts also accept a single partial match; several partial matches → `ambiguous: true` + `candidates[]`. Write scripts act **only** on an exact name — a partial match returns `notFound` with `candidates[]` as suggestions (QA-008).

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
| **Returns** | `opened`, `name`, `url`; `notFound`, `ambiguous`, `candidates[]`, `matchedName`, `available[]`, `composerHint`, `tooManyTabs`, `title` |

---

## `list_chat_messages`

`@saffist3r/web.snapchat.com/list_chat_messages`

Optionally open by name, then return the newest **visible text** messages. Pass `since` (your announcement text) to get only the replies after it — the RSVP step. `from` comes from Snapchat's caps sender labels (`me`, `FATMA BOUZID`); best effort. Empty pane → `count: 0` + `note` (no hang).

| | |
|--|--|
| **Args** | `name` (optional), `limit` (1–50, default 20), `since` (optional) |
| **Returns** | `count`, `messages[]`, `url`; `opened`, `notFound`, `ambiguous`, `candidates[]`, `name`, `since`, `sinceFound`, `composerHint`, `tooManyTabs`, `note` |
| **Message** | `text`, `from`, `when` (null), `type` |

---

## `send_message`

`@saffist3r/web.snapchat.com/send_message` (replaces the archived `send_chat_image`)

**Write.** Opens an optional chat by name, then sends text, an image, or both. The image goes through `input[name=uploadImages]`; text is pasted into the composer; Enter sends (never the “Send this text to MyAI” shortcut). With both, Snapchat sends two messages (text, then image).

`ok` is true only when the chat’s sidebar row **changes** after the send and settles on `Delivered · just now` with nothing still `Sending…`. Stops with `ok: false` on the My AI disclaimer (never accepts it) or when no composer appears. Throws if neither `text` nor `image.png` is given. Prefer a self-chat / test friend.

| | |
|--|--|
| **Args** | `text` (optional); `image.png` (file, optional) — at least one; `name` (optional, exact) |
| **Returns** | `ok`, `delivered`, `clicked`, `sentText`, `sentImage`, `error`, `snippet`; open meta: `opened`, `notFound`, `ambiguous`, `candidates[]`, `name`, `matchedName`, `available[]` |
| **Effects** | `sideEffects: write`, `humanRequired: true` |

Fixture for local smoke: `tests/fixtures/send-test.png`.

---

## Docs

[SCOPE](SCOPE.md) · [QA](QA.md) · [LIMITATIONS](LIMITATIONS.md) · [BAN_RISKS](BAN_RISKS.md)  
Benchmarks: [`../benchmarks/latest.md`](../benchmarks/latest.md) · [`../benchmarks/critical.md`](../benchmarks/critical.md) · [`../benchmarks/write.md`](../benchmarks/write.md)
