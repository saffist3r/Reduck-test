# ReDuckHunt

Local + CI test framework for Reduck host scripts in this monorepo.

**Does not** call Reduck or run live browser E2E. Live suites stay agent-driven via each host’s `tests/run-benchmark.mjs`.

## What it checks

| Suite | Asserts |
|-------|---------|
| `tests/scripts/meta.test.js` | Every `meta.json` has host/slug/name/schemas/flags; `script.js` exists |
| `tests/scripts/syntax.test.js` | Every `script.js` parses (`node --check` after wrapping Reduck top-level `await`/`return`) |
| `tests/scripts/cases.test.js` | `cases.json` / `critical-cases.json` shape; ids unique; script slugs resolve |
| `tests/unit/checkExpect.test.js` | Pure expect matcher used by case evaluations |

## Run

```bash
cd ReDuckHunt
npm install
npm test
```

From repo root:

```bash
npm test
```

Watch / HTML+JUnit report:

```bash
npm run test:watch --prefix ReDuckHunt
npm run test:report --prefix ReDuckHunt
# open ReDuckHunt/test-results/index.html
```

## Layout

```
ReDuckHunt/
  lib/           # discover scripts, checkExpect
  tests/         # Vitest suites
  vitest.config.js
  package.json
```

Hosts scanned: `anybuddyapp.com/` (flat script folders) and `web.snapchat.com/scripts/`.
