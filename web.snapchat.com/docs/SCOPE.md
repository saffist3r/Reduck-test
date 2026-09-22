# Scope — Snapchat morning chat digest

## Persona
A community / creator assistant who already chats with a fixed set of people on Snapchat and wants a **read-only morning digest** without unlocking their phone.

## Job story
Each morning: am I logged in on Web → list my chats → open one thread → pull recent **text** messages.

## Why this scope
- Compelling for a real user (repeatable ops task), not a random scrape pile.
- Ethical and brand-safe: no spam, no mass outreach, no Story farming.
- Fits Reduck’s browser model via Snapchat for Web (`https://www.snapchat.com/web/`).
- End-to-end chain: four scripts that compose cleanly.
- Verified live: suite **5/5** in [`benchmarks/latest.md`](../benchmarks/latest.md).

## Script coverage

| Script | Role |
|--------|------|
| `@saffist3r/web.snapchat.com/check_session` | Session / identity gate |
| `@saffist3r/web.snapchat.com/list_chats` | Top N conversations |
| `@saffist3r/web.snapchat.com/open_chat` | Focus one chat by display name |
| `@saffist3r/web.snapchat.com/list_chat_messages` | Last M visible text messages |

```
check_session → list_chats → open_chat → list_chat_messages
```

## Explicit exclusions
- Auto-Send, draft-in-composer, friend adds, Story/Spotlight posting
- Unofficial Snap APIs, mobile app automation
- Personal Snap accounts

## Platform notes
- Canonical URL redirects to `www.snapchat.com/web/` (Reduck host id remains `web.snapchat.com`).
- Snapchat enforces **one Web tab** at a time — close other tabs before runs.
- Scripts are **public** on Reduck because the free plan caps private scripts at 3 (Anybuddy already uses that quota).

## Limitations
Hard stops (Web product + Reduck + write-side probes): **[LIMITATIONS.md](LIMITATIONS.md)** — notably: Lenses camera-only; gallery file cannot post to My Story on Web; no fake webcam via Reduck alone.

## Account risk acknowledgement
Automating Snapchat can flag or ban an account. This project uses a **dedicated test account**, keeps request rate low, and sticks to normal-user read flows. A personal account must never be used.

See **[BAN_RISKS.md](BAN_RISKS.md)** for Snapchat enforcement risks, and **[TOKEN_AND_QUOTA.md](TOKEN_AND_QUOTA.md)** for Reduck run / agent token burn (measured quota data).
