#!/usr/bin/env node
/**
 * Evaluate Reduck run payloads against cases.json and write local reports.
 *
 * Usage:
 *   node tests/run-benchmark.mjs --from-runs path/to/runs.json
 *
 * runs.json shape:
 * [
 *   {
 *     "id": "locations-lyon",          // must match cases.json id
 *     "status": "completed" | "failed" | ...,
 *     "result": { ... },               // script return value (when completed)
 *     "error": "..." | null,
 *     "runId": "...",
 *     "durationMs": 1234
 *   },
 *   ...
 * ]
 *
 * Writes:
 *   ../benchmarks/latest.json
 *   ../benchmarks/latest.md
 *   ../benchmarks/history/<iso>.json
 *   ../benchmarks/history/<iso>.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CASES_PATH = join(__dirname, "cases.json");
const BENCH_DIR = join(ROOT, "benchmarks");
const HISTORY_DIR = join(BENCH_DIR, "history");

function parseArgs(argv) {
  const out = { fromRuns: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--from-runs") out.fromRuns = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") out.help = true;
  }
  return out;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Check expect block against a completed script result. */
export function checkExpect(expect, result) {
  const failures = [];
  if (!expect || typeof expect !== "object") return failures;

  if (expect.ok === true && result == null) {
    failures.push("expected a result object (ok:true)");
  }

  if (typeof expect.minCandidates === "number") {
    const n = Array.isArray(result?.candidates) ? result.candidates.length : 0;
    if (n < expect.minCandidates) {
      failures.push(`minCandidates: got ${n}, want ≥ ${expect.minCandidates}`);
    }
  }

  if (typeof expect.firstSlugIncludes === "string") {
    const slug = String(result?.candidates?.[0]?.slug || "");
    if (!slug.toLowerCase().includes(expect.firstSlugIncludes.toLowerCase())) {
      failures.push(
        `firstSlugIncludes: "${slug}" does not include "${expect.firstSlugIncludes}"`,
      );
    }
  }

  if (typeof expect.minClubs === "number") {
    const n = Array.isArray(result?.clubs) ? result.clubs.length : 0;
    if (n < expect.minClubs) {
      failures.push(`minClubs: got ${n}, want ≥ ${expect.minClubs}`);
    }
  }

  if (typeof expect.clubNameIncludes === "string") {
    const name = String(result?.club?.name || "");
    if (!name.toLowerCase().includes(expect.clubNameIncludes.toLowerCase())) {
      failures.push(
        `clubNameIncludes: "${name}" does not include "${expect.clubNameIncludes}"`,
      );
    }
  }

  if ("notFound" in expect) {
    if (!!result?.notFound !== !!expect.notFound) {
      failures.push(
        `notFound: got ${!!result?.notFound}, want ${!!expect.notFound}`,
      );
    }
  }

  if (typeof expect.count === "number") {
    const n = Number(result?.count);
    if (n !== expect.count) {
      failures.push(`count: got ${n}, want ${expect.count}`);
    }
  }

  if (typeof expect.minCount === "number") {
    const n = Number(result?.count ?? 0);
    if (n < expect.minCount) {
      failures.push(`minCount: got ${n}, want ≥ ${expect.minCount}`);
    }
  }

  return failures;
}

function summarizeResult(script, result) {
  if (!result || typeof result !== "object") return "";
  switch (script) {
    case "search_locations":
      return `${result.candidates?.length ?? 0} candidates`;
    case "search_clubs":
      return `${result.count ?? result.clubs?.length ?? 0} clubs / ${result.totalClubs ?? "?"} total`;
    case "get_club":
      return [
        result.club?.name,
        result.club?.rating != null ? `rating ${result.club.rating}` : null,
      ]
        .filter(Boolean)
        .join(", ");
    case "list_public_matches":
      if (result.notFound) return "notFound";
      return `count ${result.count ?? 0}` +
        (result.openMatches != null ? `, open ${result.openMatches}` : "");
    default:
      return "";
  }
}

function evaluateSuite(suite, runs) {
  const byId = new Map(runs.map((r) => [r.id, r]));
  const results = [];

  for (const c of suite.cases) {
    const run = byId.get(c.id);
    const started = Date.now();

    if (!run) {
      results.push({
        id: c.id,
        script: c.script,
        args: c.args,
        status: "fail",
        reason: "missing run payload",
        notes: "",
        durationMs: 0,
        runId: null,
        expectFailures: ["no run for this case id"],
      });
      continue;
    }

    const durationMs = Number(run.durationMs) || 0;
    const runStatus = String(run.status || "").toLowerCase();

    if (runStatus !== "completed") {
      results.push({
        id: c.id,
        script: c.script,
        args: c.args,
        status: "fail",
        reason: `run status=${run.status}`,
        notes: run.error ? String(run.error).slice(0, 200) : "",
        durationMs,
        runId: run.runId || null,
        expectFailures: [`run did not complete (${run.status})`],
        error: run.error || null,
      });
      continue;
    }

    const expectFailures = checkExpect(c.expect, run.result);
    const notes = summarizeResult(c.script, run.result);
    results.push({
      id: c.id,
      script: c.script,
      args: c.args,
      status: expectFailures.length ? "fail" : "pass",
      reason: expectFailures.length ? expectFailures.join("; ") : "ok",
      notes,
      durationMs,
      runId: run.runId || null,
      expectFailures,
      resultPreview: run.result,
    });

    void started;
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.length - passed;
  const byScript = {};
  for (const r of results) {
    byScript[r.script] ??= { passed: 0, failed: 0, durationMs: 0 };
    byScript[r.script][r.status === "pass" ? "passed" : "failed"] += 1;
    byScript[r.script].durationMs += r.durationMs || 0;
  }

  const totalDurationMs = results.reduce((a, r) => a + (r.durationMs || 0), 0);

  return {
    ranAt: new Date().toISOString(),
    suite: "anybuddyapp.com/tests/cases.json",
    host: suite.host,
    summary: {
      total: results.length,
      passed,
      failed,
      passRate: results.length ? passed / results.length : 0,
      totalDurationMs,
    },
    byScript,
    results: results.map((r) => ({
      id: r.id,
      script: r.script,
      status: r.status,
      notes: r.notes,
      reason: r.reason,
      durationMs: r.durationMs,
      runId: r.runId,
      expectFailures: r.expectFailures,
    })),
  };
}

function renderMarkdown(report) {
  const pct = Math.round(100 * report.summary.passRate);
  const lines = [
    `# Anybuddy benchmark`,
    ``,
    `- **Ran at:** ${report.ranAt}`,
    `- **Host:** ${report.host}`,
    `- **Suite:** \`${report.suite}\``,
    `- **Result:** **${report.summary.passed}/${report.summary.total} passed** (${pct}%)`,
    `- **Script time:** ${(report.summary.totalDurationMs / 1000).toFixed(1)}s total (sum of Reduck step-trace durations per run; excludes browser startup)`,
    ``,
    `## By script`,
    ``,
    `| Script | Passed | Failed | Duration |`,
    `| --- | ---: | ---: | ---: |`,
  ];

  for (const [script, s] of Object.entries(report.byScript)) {
    lines.push(
      `| ${script} | ${s.passed} | ${s.failed} | ${(s.durationMs / 1000).toFixed(1)}s |`,
    );
  }

  lines.push(``, `## Cases`, ``);
  lines.push(`| Case | Script | Status | Duration | Notes |`);
  lines.push(`| --- | --- | --- | ---: | --- |`);

  for (const r of report.results) {
    const icon = r.status === "pass" ? "✅" : "❌";
    const notes = (r.notes || r.reason || "").replace(/\|/g, "/");
    lines.push(
      `| ${r.id} | ${r.script} | ${icon} ${r.status} | ${((r.durationMs || 0) / 1000).toFixed(1)}s | ${notes} |`,
    );
  }

  const fails = report.results.filter((r) => r.status === "fail");
  if (fails.length) {
    lines.push(``, `## Failures`, ``);
    for (const f of fails) {
      lines.push(`### ${f.id}`);
      lines.push(``);
      lines.push(`- Script: \`${f.script}\``);
      lines.push(`- Reason: ${f.reason}`);
      if (f.runId) lines.push(`- Run id: \`${f.runId}\``);
      if (f.expectFailures?.length) {
        lines.push(`- Expect failures:`);
        for (const e of f.expectFailures) lines.push(`  - ${e}`);
      }
      lines.push(``);
    }
  }

  lines.push(``, `---`, ``);
  lines.push(
    `_Generated by \`anybuddyapp.com/tests/run-benchmark.mjs\`._`,
    ``,
  );
  return lines.join("\n");
}

function writeReports(report) {
  mkdirSync(BENCH_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  const stamp = report.ranAt.replace(/[:.]/g, "-");
  const latestJson = join(BENCH_DIR, "latest.json");
  const latestMd = join(BENCH_DIR, "latest.md");
  const histJson = join(HISTORY_DIR, `${stamp}.json`);
  const histMd = join(HISTORY_DIR, `${stamp}.md`);
  const md = renderMarkdown(report);

  writeFileSync(latestJson, JSON.stringify(report, null, 2) + "\n");
  writeFileSync(latestMd, md);
  writeFileSync(histJson, JSON.stringify(report, null, 2) + "\n");
  writeFileSync(histMd, md);

  return { latestJson, latestMd, histJson, histMd };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.fromRuns) {
    console.log(`Usage: node tests/run-benchmark.mjs --from-runs <runs.json>

Evaluates Reduck run payloads against cases.json and writes:
  benchmarks/latest.json
  benchmarks/latest.md
  benchmarks/history/<timestamp>.{json,md}

Ask the Cursor agent to "run the Anybuddy benchmark suite" to execute
cases via Reduck MCP, then feed the payloads into this script.`);
    process.exit(args.help ? 0 : 1);
  }

  const runsPath = resolve(process.cwd(), args.fromRuns);
  if (!existsSync(runsPath)) {
    console.error(`Runs file not found: ${runsPath}`);
    process.exit(1);
  }

  const suite = loadJson(CASES_PATH);
  const runs = loadJson(runsPath);
  if (!Array.isArray(runs)) {
    console.error("runs.json must be an array of { id, status, result, ... }");
    process.exit(1);
  }

  const report = evaluateSuite(suite, runs);
  const paths = writeReports(report);

  console.log(
    `Benchmark ${report.summary.passed}/${report.summary.total} passed (${Math.round(100 * report.summary.passRate)}%)`,
  );
  console.log(`JSON: ${paths.latestJson}`);
  console.log(`MD:   ${paths.latestMd}`);
  console.log(`Hist: ${paths.histMd}`);

  process.exit(report.summary.failed ? 1 : 0);
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) main();
