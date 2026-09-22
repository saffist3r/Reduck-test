# anybuddyapp.com

Court booking search (tennis, padel, badminton, squash, pickleball, table-tennis).

## Scripts

| Folder | Address |
|--------|---------|
| `search_locations` | `@saffist3r/anybuddyapp.com/search_locations` |
| `search_clubs` | `@saffist3r/anybuddyapp.com/search_clubs` |
| `get_club` | `@saffist3r/anybuddyapp.com/get_club` |
| `list_public_matches` | `@saffist3r/anybuddyapp.com/list_public_matches` |

## Notes

- Public listings; no login for search/get
- City slug e.g. `lyon-69000-fr` from `search_locations`
- Club slug is the part after `club/` from candidates
- Sports path: `tennis` \| `padel` \| `badminton` \| `squash` \| `pickleball` \| `table-tennis`
- `search_clubs.date` = `YYYY-MM-DD`; ~12 clubs/page

## Live suite

Latest: **9/9 passed**, 5.7s script time (sum of Reduck step-trace durations) — [benchmarks/latest.md](benchmarks/latest.md). The run file `tests/.last-runs.json` is local (gitignored).

```bash
node scripts/anybuddyapp.com/tests/run-benchmark.mjs \
  --from-runs scripts/anybuddyapp.com/tests/.last-runs.json
```

Static checks: `npm test` (ReDuckHunt).
