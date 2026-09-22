# Scope — Snapchat Web: tell your people about an event or an update

## Who it's for

My contact hosts things: house parties, a five-a-side team, a small association. His people are on Snapchat, split across a couple of group chats plus a few friends he messages one-to-one. Before every event he does the same chores by hand:

1. **Announce** — "Party at mine tomorrow, 8pm" to the group and to the 2–3 friends who aren't in it, sometimes with a flyer.
2. **Update** — "Moved to 9pm" / "bring a drink" / "cancelled", to the same people.
3. **Collect replies** — scroll each chat to see who said they're in.

That's a real, recurring job, and Snapchat has no scheduling, broadcast list or RSVP feature for it. Doing it by hand means opening 3–5 chats, pasting the same text, and scrolling back later.

## Why this scope

- **It's a real use case**: one repeated job (event comms) for one kind of user, not a pile of scripts.
- **It's the natural Snapchat use**: messaging people who are already your friends, in chats that already exist. No growth hacking.
- **Safe by construction**: exact recipient names only (a typo never lands in the wrong chat), one chat per run, runs one after another. An event means a handful of sends — what a person would do by hand, not a bulk sender. A group chat covers most of the audience in one send.
- **Confirmed**: a send counts only when Snapchat shows `Delivered`, so "it said ok" means the message really went out.

## Scripts (`@saffist3r/web.snapchat.com/<slug>`)

| Step | Script | Role | Effects |
|------|--------|------|---------|
| 0. Preflight | `check_session` | Logged in? Single-tab lock? | none |
| 1. Pick the audience | `list_chats` | Friends and groups with exact display names | none |
| 2. Announce / update | `send_message` | Text and/or flyer image to one exact chat (group or friend); ok only on `Delivered` | **write** |
| 3. Collect replies | `list_chat_messages` | Messages after the announcement (`since`), with sender | none |
| (helper) | `open_chat` | Open one chat by name (read-only navigation) | none |

```
check_session → list_chats → send_message (group, then each friend outside it) → … later … → list_chat_messages { since: <announcement> }
```

Full contracts: [SCRIPTS.md](SCRIPTS.md)

## End-to-end example (run live, 2026-09-22)

1. `list_chats` → `saffist3r`, `TEST REDUCK` (group), `Fatma Bouzid`, `My AI`, `Team Snapchat`.
2. `send_message { name: "TEST REDUCK", text: "Hey everyone! We're hosting a party at my place tomorrow night…" }` → `delivered`.
3. `send_message { name: "TEST", … }` → refused: `no chat named exactly "TEST" (did you mean: TEST REDUCK?)` — nothing sent.
4. `list_chat_messages { name: "TEST REDUCK", since: "hosting a party at my place" }` → what was said in the group after the announcement.

Run ids and timings: [benchmarks/](../benchmarks/).

## Out of scope (on purpose)

- Messaging people who aren't already in your chat list, or adding friends
- Broadcast lists, parallel runs, scheduled or looped sends
- Auto-replies, AI chatting, My AI (its terms prompt is never accepted by a script)
- Stories / Spotlight posting, Lenses, calls
- Unofficial APIs, mobile automation, personal accounts

## Notes

- Reduck host id: `web.snapchat.com`; canonical URL `www.snapchat.com/web/`
- One Snapchat Web tab at a time (QA-001, QA-015)
- Scripts are **public** (the plan's 3 private slots are used by other hosts, QA-007)
- Risk stance: [BAN_RISKS.md](BAN_RISKS.md)

[LIMITATIONS.md](LIMITATIONS.md) · [BAN_RISKS.md](BAN_RISKS.md) · [QA.md](QA.md)
