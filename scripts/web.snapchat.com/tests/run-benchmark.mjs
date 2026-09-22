#!/usr/bin/env node
/**
 * Evaluate Reduck run payloads against a cases file and write local reports.
 *
 * Usage:
 *   node tests/run-benchmark.mjs --from-runs path/to/runs.json
 *   node tests/run-benchmark.mjs --from-runs runs.json --cases critical-cases.json --out critical
 *
 * Writes (default out=latest):
 *   ../benchmarks/<out>.json
 *   ../benchmarks/<out>.md
 *   ../benchmarks/history/<iso>.json
 *   ../benchmarks/history/<iso>.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BENCH_DIR = join(ROOT, "benchmarks");
const HISTORY_DIR = join(BENCH_DIR, "history");

function parseArgs(argv) {
  const out = { fromRuns: null, cases: join(__dirname, "cases.json"), outName: "latest" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--from-runs") out.fromRuns = argv[++i];
    else if (argv[i] === "--cases") out.cases = resolve(process.cwd(), argv[++i]);
    else if (argv[i] === "--out") out.outName = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") out.help = true;
  }
  return out;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Check expect block against a completed script result (and optional error). */
export function checkExpect(expect, result, error = null) {
  const failures = [];
  if (!expect || typeof expect !== "object") return failures;

  if (expect.ok === false) {
    const err = error != null ? String(error) : "";
    if (!err) failures.push("expected run to fail (ok:false) but no error");
    if (typeof expect.errorIncludes === "string") {
      if (!err.toLowerCase().includes(expect.errorIncludes.toLowerCase())) {
        failures.push(
          `errorIncludes: "${err.slice(0, 120)}" does not include "${expect.errorIncludes}"`,
        );
      }
    }
    return failures;
  }

  if (expect.ok === true && result == null) {
    failures.push("expected a result object (ok:true)");
  }

  if (expect.ok === true && result?.ok === false) {
    failures.push(`ok: result.ok is false${result.error ? ` (${result.error})` : ""}`);
  }

  if ("notFound" in expect) {
    if (!!result?.notFound !== !!expect.notFound) {
      failures.push(`notFound: got ${!!result?.notFound}, want ${!!expect.notFound}`);
    }
  }

  if ("loggedIn" in expect) {
    if (!!result?.loggedIn !== !!expect.loggedIn) {
      failures.push(`loggedIn: got ${!!result?.loggedIn}, want ${!!expect.loggedIn}`);
    }
  }

  if ("opened" in expect) {
    if (!!result?.opened !== !!expect.opened) {
      failures.push(`opened: got ${!!result?.opened}, want ${!!expect.opened}`);
    }
  }

  if ("tooManyTabs" in expect) {
    if (!!result?.tooManyTabs !== !!expect.tooManyTabs) {
      failures.push(
        `tooManyTabs: got ${!!result?.tooManyTabs}, want ${!!expect.tooManyTabs}`,
      );
    }
  }

  for (const key of ["clicked", "delivered"]) {
    if (key in expect && !!result?.[key] !== !!expect[key]) {
      failures.push(`${key}: got ${!!result?.[key]}, want ${!!expect[key]}`);
    }
  }

  if (typeof expect.count === "number") {
    const n = Number(result?.count);
    if (n !== expect.count) failures.push(`count: got ${n}, want ${expect.count}`);
  }

  if (typeof expect.minCount === "number") {
    const n = Number(result?.count ?? 0);
    if (n < expect.minCount) {
      failures.push(`minCount: got ${n}, want ≥ ${expect.minCount}`);
    }
  }

  if (typeof expect.maxCount === "number") {
    const n = Number(result?.count ?? 0);
    if (n > expect.maxCount) {
      failures.push(`maxCount: got ${n}, want ≤ ${expect.maxCount}`);
    }
  }

  if (typeof expect.urlIncludes === "string") {
    const url = String(result?.url || "");
    if (!url.toLowerCase().includes(expect.urlIncludes.toLowerCase())) {
      failures.push(`urlIncludes: "${url}" does not include "${expect.urlIncludes}"`);
    }
  }

  if (Array.isArray(expect.hasKeys)) {
    for (const k of expect.hasKeys) {
      if (result == null || !(k in result)) failures.push(`hasKeys: missing "${k}"`);
    }
  }

  if (typeof expect.chatNameIncludes === "string") {
    const names = (result?.chats || []).map((c) => String(c?.name || "").toLowerCase());
    const want = expect.chatNameIncludes.toLowerCase();
    if (!names.some((n) => n.includes(want))) {
      failures.push(
        `chatNameIncludes: none of [${names.join(", ")}] include "${expect.chatNameIncludes}"`,
      );
    }
  }

  if (Array.isArray(expect.chatRowHasKeys) && Array.isArray(result?.chats) && result.chats[0]) {
    const row = result.chats[0];
    for (const k of expect.chatRowHasKeys) {
      if (!(k in row)) failures.push(`chatRowHasKeys: first row missing "${k}"`);
    }
  }

  if (expect.hasAvailable === true) {
    if (!Array.isArray(result?.available) || result.available.length === 0) {
      failures.push("hasAvailable: expected non-empty available[]");
    }
  }

  if (typeof expect.messageTextIncludes === "string") {
    const blob = (result?.messages || [])
      .map((m) => String(m?.text || ""))
      .join("\n")
      .toLowerCase();
    if (!blob.includes(expect.messageTextIncludes.toLowerCase())) {
      failures.push(
        `messageTextIncludes: messages do not include "${expect.messageTextIncludes}"`,
      );
    }
  }

  return failures;
}

function summarizeResult(script, result, error = null) {
  if (error) return `error: ${String(error).slice(0, 120)}`;
  if (!result || typeof result !== "object") return "";
  switch (script) {
    case "check_session":
      return result.loggedIn ? `loggedIn (${result.title || result.url})` : "logged out";
    case "list_chats":
      return (
        `${result.count ?? 0} chats` +
        (result.chats?.[0]?.name ? `; first=${result.chats[0].name}` : "")
      );
    case "open_chat":
      if (result.notFound) {
        return `notFound; available=${(result.available || []).join("|")}`;
      }
      return result.opened ? `opened ${result.matchedName || result.name}` : "not opened";
    case "list_chat_messages":
      if (result.notFound) return "chat notFound";
      return `count ${result.count ?? 0}` + (result.note ? `; ${result.note}` : "");
    case "send_message": {
      if (result.notFound) return "chat notFound";
      const parts = [result.sentText && "text", result.sentImage && "image"].filter(Boolean);
      return `${result.delivered ? "delivered" : "not delivered"} (${parts.join(" + ") || "nothing"})`;
    }
    default:
      return "";
  }
}

function evaluateSuite(suite, runs, casesPath) {
  const byId = new Map(runs.map((r) => [r.id, r]));
  const results = [];

  for (const c of suite.cases) {
    const run = byId.get(c.id);

    if (!run) {
      results.push({
        id: c.id,
        script: c.script,
        tag: c.tag || null,
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
    const expectOkFalse = c.expect && c.expect.ok === false;

    if (expectOkFalse) {
      const failed =
        runStatus === "failed" ||
        runStatus === "error" ||
        (run.error != null && String(run.error).length > 0);
      const statusForExpect = failed ? "failed" : runStatus;
      const expectFailures = checkExpect(
        c.expect,
        run.result,
        failed ? run.error || `status=${statusForExpect}` : null,
      );
      // If run completed successfully but we expected failure:
      if (runStatus === "completed" && !run.error) {
        expectFailures.push("expected failure but run completed with a result");
      }
      results.push({
        id: c.id,
        script: c.script,
        tag: c.tag || null,
        args: c.args,
        status: expectFailures.length ? "fail" : "pass",
        reason: expectFailures.length ? expectFailures.join("; ") : "ok (expected error)",
        notes: summarizeResult(c.script, run.result, run.error),
        durationMs,
        runId: run.runId || null,
        expectFailures,
      });
      continue;
    }

    if (runStatus !== "completed") {
      results.push({
        id: c.id,
        script: c.script,
        tag: c.tag || null,
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

    const expectFailures = checkExpect(c.expect, run.result, run.error);
    results.push({
      id: c.id,
      script: c.script,
      tag: c.tag || null,
      args: c.args,
      status: expectFailures.length ? "fail" : "pass",
      reason: expectFailures.length ? expectFailures.join("; ") : "ok",
      notes: summarizeResult(c.script, run.result),
      durationMs,
      runId: run.runId || null,
      expectFailures,
    });
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.length - passed;
  // Several cases can be scored from one run: count each runId's time once.
  const timed = new Set();
  let totalDurationMs = 0;
  const byScript = {};
  for (const r of results) {
    byScript[r.script] ??= { passed: 0, failed: 0, durationMs: 0 };
    byScript[r.script][r.status === "pass" ? "passed" : "failed"] += 1;
    const key = r.runId || `case:${r.id}`;
    if (timed.has(key)) continue;
    timed.add(key);
    byScript[r.script].durationMs += r.durationMs || 0;
    totalDurationMs += r.durationMs || 0;
  }

  return {
    ranAt: new Date().toISOString(),
    suite: casesPath,
    suiteName: suite.suite || "default",
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
      tag: r.tag,
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
  const title =
    report.suiteName === "critical"
      ? "Snapchat Web critical suite"
      : "Snapchat Web benchmark";
  const lines = [
    `# ${title}`,
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
  lines.push(`| Case | Tag | Script | Status | Duration | Notes |`);
  lines.push(`| --- | --- | --- | --- | ---: | --- |`);

  for (const r of report.results) {
    const icon = r.status === "pass" ? "PASS" : "FAIL";
    const notes = (r.notes || r.reason || "").replace(/\|/g, "/");
    lines.push(
      `| ${r.id} | ${r.tag || ""} | ${r.script} | ${icon} | ${((r.durationMs || 0) / 1000).toFixed(1)}s | ${notes} |`,
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
  lines.push(`_Generated by \`scripts/web.snapchat.com/tests/run-benchmark.mjs\`._`, ``);
  return lines.join("\n");
}

function writeReports(report, outName) {
  mkdirSync(BENCH_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  const stamp = report.ranAt.replace(/[:.]/g, "-");
  const latestJson = join(BENCH_DIR, `${outName}.json`);
  const latestMd = join(BENCH_DIR, `${outName}.md`);
  const histJson = join(HISTORY_DIR, `${stamp}-${outName}.json`);
  const histMd = join(HISTORY_DIR, `${stamp}-${outName}.md`);
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
    console.log(`Usage: node tests/run-benchmark.mjs --from-runs <runs.json> [--cases <cases.json>] [--out name]

Examples:
  node tests/run-benchmark.mjs --from-runs tests/.last-runs.json
  node tests/run-benchmark.mjs --from-runs tests/.critical-runs.json --cases tests/critical-cases.json --out critical
`);
    process.exit(args.help ? 0 : 1);
  }

  const runsPath = resolve(process.cwd(), args.fromRuns);
  if (!existsSync(runsPath)) {
    console.error(`Runs file not found: ${runsPath}`);
    process.exit(1);
  }
  if (!existsSync(args.cases)) {
    console.error(`Cases file not found: ${args.cases}`);
    process.exit(1);
  }

  const suite = loadJson(args.cases);
  const runs = loadJson(runsPath);
  if (!Array.isArray(runs)) {
    console.error("runs.json must be an array of { id, status, result, ... }");
    process.exit(1);
  }

  const report = evaluateSuite(suite, runs, args.cases);
  const paths = writeReports(report, args.outName);

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
