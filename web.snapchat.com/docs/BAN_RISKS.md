# Snapchat ban / enforcement risks

Working notes for the Reduck take-home. Not legal advice. Snapchat does not publish a full automation-detection playbook; this is a **probable-risk map** from ToS/community norms, Web product constraints we observed, and common anti-abuse patterns.

**Policy for this project:** dedicated test account only · read-first · low rate · never auto-Send · never spam.

## Severity legend

| Level | Meaning |
|-------|---------|
| **Critical** | Likely to trigger lock / ban / permanent trust loss if done at scale |
| **High** | Strong signal to automated or human review |
| **Medium** | Raises risk when combined with other signals |
| **Low** | Usually fine in isolation at human pace |

---

## Critical — do not do

| Risk | Why it gets flagged | Our stance |
|------|---------------------|------------|
| Mass DMs / blast messaging | Classic spam / bot signature | Out of scope; no Send |
| Friend-add / follow farming | Growth abuse | Out of scope |
| Story / Spotlight spam | Content spam | Out of scope |
| Credential stuffing / account takeover tooling | Security abuse | Never |
| Unofficial private APIs / reverse-engineered clients | Explicit ToS / integrity violation | Web UI only via Reduck |
| Using a **personal** account for automation | Real-world harm if banned | Dedicated test account only |

---

## High

| Risk | Why | Mitigation we use |
|------|-----|-------------------|
| High request rate / bursty parallel runs | Looks non-human; trips rate limits | Sequential runs, delays between scripts, no fan-out spam |
| Many concurrent Web sessions | Snapchat already enforces **one Web tab**; multi-session looks botty | Close other Web tabs; dismiss “Too many tabs”; one device |
| Repeated failed logins / 2FA loops | Account integrity | Manual login once; scripts use `loggedIn` cookie inject |
| Scraping at max scroll depth for hours | Data harvesting pattern | Cap `limit`; morning-digest size only |
| Automating camera Snaps / calls | Write-side + engagement abuse surface | Not automated |

---

## Medium

| Risk | Why | Mitigation |
|------|-----|------------|
| Headless / automation fingerprints | Browser automation can look different from a normal user | Use paired real Chrome extension (not bare headless cloud as default) |
| Always-on polling every few seconds | Bot heartbeat | Manual / agent-triggered suites only |
| Opening dozens of distinct chats per minute | Enumeration | Critical suite opens My AI + at most one known system chat |
| Ignoring soft blocks (captcha, “try again”, sudden logout) | Retry storms worsen bans | Fail structured; stop and log in QA |
| New account + heavy automation on day one | Trust score cold start | Prefer aged dedicated account; still keep volume low |

---

## Low (usually OK if human-paced)

| Activity | Notes |
|----------|-------|
| Opening Web while already logged in on phone | Normal product use; watch single-tab modal |
| Reading chat list a few times a day | Matches persona |
| Opening one known chat and reading visible text | Matches morning digest |
| Searching within own inbox for a display name | Normal |

---

## Signals we personally observed (product, not bans)

These are **not** bans, but they correlate with “don’t look reckless”:

1. **Single-tab lock** — `Oops! Too many tabs…` when Web is already open elsewhere ([QA-001](QA.md)).
2. **Session kick / modal storms** during Reduck `start_session` vs an existing Web tab.
3. **Public script quota workarounds** don’t affect Snapchat bans, but chasing upgrades by blasting runs wastes quota and raises rate.
4. **Reduck run / agent token burn** — not a Snapchat ban vector, but can exhaust the monthly **100-run** plan and Cursor budget. See [TOKEN_AND_QUOTA.md](TOKEN_AND_QUOTA.md) (measured **61/100** runs used as of 2026-09-22).

---

## Mapping to our scripts

| Script | Ban-relevant behavior | Safe use |
|--------|----------------------|----------|
| `check_session` | One navigation | OK |
| `list_chats` | Reads visible list; `limit` caps | Keep `limit` ≤ 20 in prod |
| `open_chat` | Navigates into one chat | Prefer known names from `list_chats` |
| `list_chat_messages` | Scrapes visible text only | Cap `limit`; no Send |

---

## If the account gets challenged

1. **Stop** all Reduck runs immediately.  
2. Log the UI state in [QA.md](QA.md) (screenshot / body text).  
3. Do **not** retry loops.  
4. Resolve via official Snapchat flows on the **dedicated** account only.  
5. Shrink suite frequency before resuming.

---

## Acknowledgement (submission)

We acknowledge that automating Snapchat can lead to temporary locks or permanent bans. This work is performed on a **dedicated test account**, at low rate, with **read-only** scripts, and without spam or unofficial APIs.
