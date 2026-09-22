# Anybuddy script tests

Test matrix: `cases.json`. Local evaluator: `run-benchmark.mjs`.

## Cases

| id | script | expectation |
|----|--------|-------------|
| locations-lyon | search_locations | ≥1 candidate |
| locations-paris | search_locations | ≥1 candidate |
| clubs-lyon-tennis | search_clubs | ≥1 club |
| clubs-paris-padel | search_clubs | ≥1 club |
| club-racing | get_club | Racing Club profile |
| matches-paris-tennis-filled | list_public_matches | ≥1 match |
| matches-paris-badminton-empty | list_public_matches | count 0, notFound false |
| matches-lyon-padel | list_public_matches | ok |
| matches-cergy-404 | list_public_matches | notFound true |

## How to run

Ask the agent: **“run the Anybuddy benchmark suite”**.

It will:

1. Batch `run_script` for every case in `cases.json`
2. Write raw payloads to `tests/.last-runs.json`
3. Run:

```bash
node anybuddyapp.com/tests/run-benchmark.mjs --from-runs anybuddyapp.com/tests/.last-runs.json
```

Outputs:

- `benchmarks/latest.json` — machine-readable report
- `benchmarks/latest.md` — human-readable report
- `benchmarks/history/<timestamp>.{json,md}` — archived copy

## Regression covered

`list_public_matches` previously timed out when a city had **no open matches** or the matches URL **404’d**. The suite asserts both now succeed quickly with structured empty/`notFound` results.
