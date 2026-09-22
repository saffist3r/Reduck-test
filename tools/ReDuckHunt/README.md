# ReDuckHunt

Vitest runner for this repo.

```bash
npm install && npm test
```

Includes:
- `tools/ReDuckHunt/tests/` — discovery + shared matcher
- `scripts/<host>/tests/**/*.test.js` — per-host tests

Discovers packs under `scripts/<host>/` (flat or nested `scripts/`) and `tests/*.json` case suites.

Report: Actions job **Summary**, or local `test-results/report.md`.
