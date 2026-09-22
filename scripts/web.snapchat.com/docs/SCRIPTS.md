# Scripts — web.snapchat.com

Handle: `@saffist3r`

| Name | Address | Does |
|------|---------|------|
| Check session | `@saffist3r/web.snapchat.com/check_session` | Login gate; dismisses single-tab modal |
| List chats | `@saffist3r/web.snapchat.com/list_chats` | Top N rows |
| Open chat | `@saffist3r/web.snapchat.com/open_chat` | Open by name; `notFound` + `available[]` |
| List messages | `@saffist3r/web.snapchat.com/list_chat_messages` | Visible text only; never sends |

All: `loggedIn: true`, `sideEffects: none`, public.

Local: `../scripts/<slug>/{script.js,meta.json}`  
Benchmarks: [`../benchmarks/latest.md`](../benchmarks/latest.md)
