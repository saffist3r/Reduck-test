# ReDuckHunt

Vitest checks for scripts under `scripts/`.

```bash
npm install
npm test
```

From repo root: `npm test`.

Checks: `meta.json`, `script.js` syntax, `cases.json` shape, `checkExpect` units.

On GitHub Actions the report is written to the job **Summary** (no download).
Locally: `test-results/report.md`.
