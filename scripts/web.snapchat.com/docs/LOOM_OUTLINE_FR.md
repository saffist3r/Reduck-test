# Loom outline (French) — 5–10 min

Use this as the speaking plan. Record in French.

## 1. Intro (≈45s)
- Qui je suis / le brief Reduck
- Persona: assistant community qui veut un digest matin de ses chats Snapchat Web
- Rappeler: compte **dédié**, pas de spam, lecture seule

## 2. Scope (≈1 min)
- Chaîne: `check_session` → `list_chats` → `open_chat` → `list_chat_messages`
- Pourquoi ce scope (valeur réelle, éthique, automatisable)
- Ce qu’on n’automatise pas (Send, Stories, APIs non officielles)

## 3. Démo live (≈3–4 min)
1. `check_session` → loggedIn true  
2. `list_chats` limit 5 → My AI / Team Snapchat  
3. `open_chat` My AI → URL conversation + composerHint  
4. `list_chat_messages` → textes visibles (accueil My AI)  
5. Edge: `open_chat` nom inexistant → notFound + available[]

Montrer aussi `benchmarks/latest.md` (5/5).

## 4. QA (≈2–3 min) — top findings
- **P0** Une seule tab Web (“Oops! Too many tabs…”)
- **P1** `start_session` = navigateur frais vs `run_script` + `loggedIn`
- **P1** Transcript messages parfois mélangé à l’UI chrome / caméra
- **P2** Limite plan Reduck: 3 scripts private → Snapchat en public
- **P2** Matching trop large corrigé (`target.includes(rowName)`)

Ce qui a bien marché: MCP agent, promote draft, listitem selectors, suite locale JSON/MD.

## 5. Closing (≈45s)
- Accusé risque ban Snapchat
- Scripts: `@saffist3r/web.snapchat.com/...`
- Docs: SCOPE + QA + benchmarks
- Ouvert aux questions
