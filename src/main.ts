import path, { sep } from 'path';
import * as core from '@actions/core';
import { getBooleanArg, getCWD, hasIssueNumber } from './args';
import { outputCoverageResult } from './output';
import runJest, { exitIfFailed } from './run';
import { printTestResultAnnotations } from './testResults';

async function main(): Promise<void> {
  const shouldCommentCoverage = getBooleanArg('coverage-comment');

  const cwd = getCWD();
  const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

  // Run jest and read the results file
  core.info('Executing jest');
  const { testResults, statusCode } = await runJest({
    coverageFilePath,
    baseCommand: core.getInput('test-command', { required: false }) ?? 'npm test',
    runOnlyChangedFiles: getBooleanArg('changes-only'),
    withCoverage: shouldCommentCoverage,
    cwd,
  });

  // Report results as annotations
  if (testResults) {
    core.info('Reporting test results annotations');
    printTestResultAnnotations(testResults);
  } else {
    core.info('Test results file not found. Cannot print annotations.');
  }

  exitIfFailed(statusCode, getBooleanArg('fail-action-if-jest-fails'));

  console.log('Has issue number? ', hasIssueNumber());

  // Return early if we should not post code coverage comment
  if (!shouldCommentCoverage) {
    core.info('Code coverage commenting is disabled. Skipping...');
    return;
  } else if (!hasIssueNumber()) {
    core.info(
      'No issue number given to this action (this might be a push instead of a PR). Skipping code coverage comment...'
    );
    return;
  }

  // Generate table for coverage data and output it
  await outputCoverageResult({
    ...testResults,
    dryRun: getBooleanArg('dry-run'),
  });
}

main();

process.on('uncaughtException', (err) => core.setFailed(err));
process.on('unhandledRejection', (err) => core.setFailed(err as Error));
