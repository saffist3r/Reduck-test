# ReDuckHunt

Vitest checks for whatever lives under `scripts/<host>/`.

```bash
npm install
npm test
```

From repo root: `npm test`.

Auto-discovers:
- packs: `scripts/<host>/<slug>/` or `scripts/<host>/scripts/<slug>/` (`script.js` + `meta.json`)
- cases: `scripts/<host>/tests/*.json` with a `cases` array

On GitHub Actions the report is the job **Summary**. Locally: `test-results/report.md`.
