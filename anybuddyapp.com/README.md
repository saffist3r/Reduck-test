# anybuddyapp.com

French racket-sport court booking (tennis, padel, badminton, squash, pickleball, table-tennis).

## Location slugs
Use `search_locations` first. City candidates return slugs like `lyon-69000-fr` / `paris-75000-fr` — pass those to `search_clubs`. Club candidates return `club/<slug>` — use `get_club` with the part after `club/`.

## Sports path segments
`tennis` | `padel` | `badminton` | `squash` | `pickleball` | `table-tennis`

## Notes
- Listings are public; no login required for search/get.
- Availability date is `YYYY-MM-DD` via `search_clubs.date`.
- Pagination is ~12 clubs/page; use `page` and `totalPages`.
- Cookie banner (Axeptio) may appear; scripts read JSON-LD / API and do not need it dismissed.

## Scripts in this repo

| Folder | Reduck address |
|--------|----------------|
| `anybuddyapp.com/search_locations/` | `@saffist3r/anybuddyapp.com/search_locations` |
| `anybuddyapp.com/search_clubs/` | `@saffist3r/anybuddyapp.com/search_clubs` |
| `anybuddyapp.com/get_club/` | `@saffist3r/anybuddyapp.com/get_club` |
| `anybuddyapp.com/list_public_matches/` | `@saffist3r/anybuddyapp.com/list_public_matches` |

Each script folder contains `script.js` (body) and `meta.json` (name, schemas, flags).

## Tests & benchmarks

- `tests/cases.json` — regression matrix (includes empty matches + 404 city)
- `tests/run-benchmark.mjs` — evaluates Reduck run payloads → local JSON + MD
- `benchmarks/latest.json` / `benchmarks/latest.md` — last suite report
- `benchmarks/history/` — timestamped archives

Re-run: ask the agent to **“run the Anybuddy benchmark suite”** (uses Reduck MCP, then writes the local files above).
