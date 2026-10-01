#!/usr/bin/env node
/**
 * Appends a short markdown pass/fail table to the GitHub Actions job
 * summary, parsed from Newman's or Playwright's JSON reporter output.
 *
 * Used only by .github/workflows/tests.yml. Safe to run locally too — it
 * just does nothing (with a message) when GITHUB_STEP_SUMMARY isn't set,
 * since that's only ever present inside a GitHub Actions runner.
 *
 * Usage: node scripts/write-job-summary.js <api|ui>
 */

const fs = require('fs');

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (!summaryPath) {
  console.log('GITHUB_STEP_SUMMARY not set — skipping (not running in GitHub Actions).');
  process.exit(0);
}

function missingSection(label) {
  return `### ${label}\n\n_No report found — the run may have failed before producing output._\n`;
}

function corruptSection(label, error) {
  return `### ⚠️ ${label}\n\n_Report file exists but couldn't be parsed (${error.message}) — likely truncated by an interrupted run._\n`;
}

/** Reads and JSON-parses a report file, returning null (never throwing) if it's missing, truncated, or otherwise unreadable — this step runs with `if: always()` specifically to survive earlier failures, so it must not itself crash the job. */
function readJsonReport(path) {
  if (!fs.existsSync(path)) return { report: null, error: null };
  try {
    return { report: JSON.parse(fs.readFileSync(path, 'utf8')), error: null };
  } catch (error) {
    return { report: null, error };
  }
}

function newmanSection(path, label) {
  const { report, error } = readJsonReport(path);
  if (error) return corruptSection(label, error);
  if (!report) return missingSection(label);
  // A validly-parsed-but-unexpectedly-shaped report (e.g. {} from a run that
  // errored before writing real stats, or a future Newman schema change)
  // would otherwise throw here and defeat this step's if: always() purpose
  // — same resilience goal as the JSON.parse guard above, same fallback.
  try {
    const s = report.run.stats;
    const failed = s.assertions.failed;
    const icon = failed === 0 ? '✅' : '❌';
    return [
      `### ${icon} ${label}`,
      '',
      '| Requests | Assertions | Failed |',
      '|---|---|---|',
      `| ${s.requests.total} | ${s.assertions.total} | ${failed} |`,
      '',
    ].join('\n');
  } catch (shapeError) {
    return corruptSection(label, shapeError);
  }
}

function playwrightSection(path, label) {
  const { report, error } = readJsonReport(path);
  if (error) return corruptSection(label, error);
  if (!report) return missingSection(label);
  try {
    const s = report.stats;
    const failed = s.unexpected;
    const icon = failed === 0 ? '✅' : '❌';
    return [
      `### ${icon} ${label}`,
      '',
      '| Passed | Failed | Flaky | Skipped |',
      '|---|---|---|---|',
      `| ${s.expected} | ${failed} | ${s.flaky} | ${s.skipped} |`,
      '',
    ].join('\n');
  } catch (shapeError) {
    return corruptSection(label, shapeError);
  }
}

const mode = process.argv[2];
let output;
if (mode === 'api') {
  output =
    newmanSection('api-tests/newman-reports/report.json', 'API tests') +
    '\n' +
    newmanSection('api-tests/newman-reports/report-data.json', 'API tests — data-driven (DDT)');
} else if (mode === 'ui') {
  output = playwrightSection('playwright-report/results.json', 'UI tests (Playwright)');
} else {
  console.error('Usage: node scripts/write-job-summary.js <api|ui>');
  process.exit(1);
}

fs.appendFileSync(summaryPath, output);
console.log('Wrote job summary:\n' + output);
