import path, { sep } from 'path';
import * as core from '@actions/core';
import { getBooleanArg, getCWD } from './args';
import { outputCoverageResult } from './output';
import runJest from './run';
import { printTestResultAnnotations } from './testResults';

async function main(): Promise<void> {
  const shouldCommentCoverage = getBooleanArg('coverage-comment');

  const cwd = getCWD();
  const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

  // Run jest and read the results file
  core.info('Executing jest');
  const results = await runJest({
    coverageFilePath,
    baseCommand: core.getInput('test-command', { required: false }) ?? 'npm test',
    runOnlyChangedFiles: getBooleanArg('changes-only'),
    withCoverage: shouldCommentCoverage,
    cwd,
    exitOnJestFail: getBooleanArg('fail-action-if-jest-fails'),
  });

  // Report results as annotations
  core.info('Reporting test results annotations');
  printTestResultAnnotations(results);

  // Return early if we should not post code coverage comment
  if (!shouldCommentCoverage) {
    core.info('Code coverage commenting is disabled. Skipping...');
    return;
  }

  // Generate table for coverage data and output it
  await outputCoverageResult({
    ...results,
    dryRun: getBooleanArg('dry-run'),
  });
}

main().catch((err) => {
  core.setFailed(err.message);
});
