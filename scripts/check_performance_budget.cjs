#!/usr/bin/env node
'use strict';

/**
 * Check the static review performance budget without a package manager or a
 * backend. The baseline runner writes the input JSON; this script only reads
 * that artifact and returns a CI-friendly exit status.
 */

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_INPUT = 'docs/performance/baseline.json';
const DEFAULT_BUDGET = 'docs/performance/performance-budget.json';

function option(name, fallback) {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find(arg => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const inputPath = path.resolve(option('--input', process.env.BASELINE_INPUT || DEFAULT_INPUT));
const budgetPath = path.resolve(option('--budget', process.env.PERFORMANCE_BUDGET || DEFAULT_BUDGET));
const jsonOutput = process.argv.includes('--json');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read JSON ${file}: ${error.message}`);
  }
}

function finiteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
  return value;
}

function recordsByName(rows, mode) {
  if (!Array.isArray(rows)) throw new Error(`baseline.${mode} must be an array`);
  const map = new Map();
  for (const row of rows) {
    if (!row || typeof row.name !== 'string' || !row.name) {
      throw new Error(`baseline.${mode} contains a record without a route name`);
    }
    if (map.has(row.name)) throw new Error(`baseline.${mode} contains duplicate route ${row.name}`);
    map.set(row.name, row);
  }
  return map;
}

function checkMetric(checks, route, mode, metric, actual, limit) {
  finiteNumber(actual, `${mode}.${route}.${metric}`);
  finiteNumber(limit, `budget.${mode}.${route}.${metric}`);
  const pass = actual <= limit;
  checks.push({ route, mode, metric, actual, limit, pass });
  return pass;
}

function main() {
  const baseline = readJson(inputPath);
  const budget = readJson(budgetPath);
  if (!Array.isArray(budget.routes) || budget.routes.length === 0) {
    throw new Error('budget.routes must contain at least one route');
  }
  const cold = recordsByName(baseline.cold, 'cold');
  const warm = recordsByName(baseline.warm, 'warm');
  const checks = [];
  const errors = [];
  const routeNames = new Set(budget.routes.map(route => route.name));
  if (routeNames.size !== budget.routes.length || budget.routes.some(route => !route || typeof route.name !== 'string')) {
    throw new Error('budget.routes must contain unique named routes');
  }

  for (const mode of ['cold', 'warm']) {
    const source = mode === 'cold' ? cold : warm;
    for (const routeBudget of budget.routes) {
      const route = source.get(routeBudget.name);
      if (!route) {
        errors.push(`Missing ${mode} baseline route ${routeBudget.name}`);
        continue;
      }
      const limits = routeBudget[mode];
      if (!limits || typeof limits !== 'object') {
        errors.push(`Missing ${mode} budget for ${routeBudget.name}`);
        continue;
      }
      for (const metric of ['openedMs', 'networkIdleMs', 'requests', 'bytesFromContentLength']) {
        try {
          if (!checkMetric(checks, routeBudget.name, mode, metric, route[metric], limits[metric])) {
            errors.push(`${mode} ${routeBudget.name} ${metric} ${route[metric]} > ${limits[metric]}`);
          }
        } catch (error) {
          errors.push(error.message);
        }
      }
      if (!Array.isArray(route.failures)) {
        errors.push(`${mode} ${routeBudget.name} failures must be an array`);
      } else {
        const maxFailures = finiteNumber(budget.invariants?.maxResponseFailures ?? 0, 'budget.invariants.maxResponseFailures');
        const pass = route.failures.length <= maxFailures;
        checks.push({ route: routeBudget.name, mode, metric: 'responseFailures', actual: route.failures.length, limit: maxFailures, pass });
        if (!pass) errors.push(`${mode} ${routeBudget.name} responseFailures ${route.failures.length} > ${maxFailures}`);
      }
    }
    for (const name of source.keys()) {
      if (!routeNames.has(name)) errors.push(`Unexpected ${mode} baseline route ${name}`);
    }
  }

  const catalogPanels = finiteNumber(baseline.dataset?.catalogPanels, 'baseline.dataset.catalogPanels');
  const minCatalogPanels = finiteNumber(budget.invariants?.minCatalogPanels ?? 0, 'budget.invariants.minCatalogPanels');
  const datasetPass = catalogPanels >= minCatalogPanels;
  checks.push({ metric: 'catalogPanels', actual: catalogPanels, limit: minCatalogPanels, comparison: '>=', pass: datasetPass });
  if (!datasetPass) errors.push(`catalogPanels ${catalogPanels} < ${minCatalogPanels}`);

  const result = {
    status: errors.length ? 'FAIL' : 'PASS',
    input: path.relative(process.cwd(), inputPath).replaceAll('\\', '/'),
    budget: path.relative(process.cwd(), budgetPath).replaceAll('\\', '/'),
    scope: budget.scope || 'unspecified',
    checks,
    errors,
  };
  if (jsonOutput) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Performance budget: ${result.status}`);
    console.log(`Input: ${result.input}`);
    for (const check of checks) {
      const op = check.comparison || '<=';
      const subject = [check.mode, check.route, check.metric].filter(Boolean).join(' ');
      console.log(`  ${check.pass ? 'PASS' : 'FAIL'} ${subject}: ${check.actual} ${op} ${check.limit}`);
    }
    if (errors.length) {
      console.error('\nBudget failures:');
      for (const error of errors) console.error(`- ${error}`);
    }
  }
  return errors.length ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`Performance budget: ERROR\n${error.message}`);
  process.exitCode = 2;
}
