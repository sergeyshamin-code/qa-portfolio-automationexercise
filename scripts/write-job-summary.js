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

function newmanSection(path, label) {
  if (!fs.existsSync(path)) return missingSection(label);
  const report = JSON.parse(fs.readFileSync(path, 'utf8'));
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
}

function playwrightSection(path, label) {
  if (!fs.existsSync(path)) return missingSection(label);
  const report = JSON.parse(fs.readFileSync(path, 'utf8'));
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
