# Reduck-test

Reduck browser-automation projects (handle `@saffist3r`).

| Folder | What it is |
|--------|------------|
| [`anybuddyapp.com/`](anybuddyapp.com/) | Court booking search — locations, clubs, matches |
| [`web.snapchat.com/`](web.snapchat.com/) | Snapchat for Web — morning chat digest (take-home) |
| [`ReDuckHunt/`](ReDuckHunt/) | Local + CI script test framework (Vitest) |

Each host has its own `README.md`, scripts, tests, and benchmarks.

## Tests (CI)

No live Reduck E2E in CI. Script contract / syntax / cases shape:

```bash
cd ReDuckHunt && npm install && npm test
# or from root after ReDuckHunt install:
npm test
```

Reports: `ReDuckHunt/test-results/` (JUnit + HTML). GitHub Actions: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Live host suites remain agent-driven (`run-benchmark.mjs` + Reduck MCP).
