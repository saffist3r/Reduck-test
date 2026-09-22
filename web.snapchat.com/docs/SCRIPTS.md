# Scripts inventory — Snapchat Web (Plan A)

Handle: **@saffist3r**

| Script | Address | What it does |
|--------|---------|--------------|
| Check session | `@saffist3r/web.snapchat.com/check_session` | Opens Snapchat for Web; returns `loggedIn`, url/title; dismisses single-tab modal |
| List chats | `@saffist3r/web.snapchat.com/list_chats` | Returns top N chat rows (`name`, preview/when when parseable, unread hint) |
| Open chat | `@saffist3r/web.snapchat.com/open_chat` | Opens a chat by display name; `notFound` + `available[]` if missing |
| List chat messages | `@saffist3r/web.snapchat.com/list_chat_messages` | Opens optional name then scrapes visible text bubbles (never sends) |

All: `loggedIn: true`, `sideEffects: none`, visibility public.

Local mirrors: `../scripts/<slug>/{script.js,meta.json}`  
Proof: [`../benchmarks/latest.md`](../benchmarks/latest.md)  
Also: [SCOPE](SCOPE.md) · [QA](QA.md) · [LIMITATIONS](LIMITATIONS.md) · [Loom FR](LOOM_OUTLINE_FR.md)
