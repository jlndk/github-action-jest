import path, { sep } from 'path';
import * as core from '@actions/core';
import { FormattedTestResults } from '@jest/test-result/build/types';
import { getGithubToken, getBooleanArg, getCWD } from './args';
import { generateCommentBody } from './coverage';
import updateOrCreateComment from './comment';
import runJest, { getJestCommand, readTestResults } from './run';
import { reportTestResults } from './testResults';

async function main(): Promise<void> {
  // Get args
  const shouldCommentCoverage = getBooleanArg('coverage-comment');
  const cwd = getCWD();

  // Compute paths
  const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

  // Run jest and read the results file
  core.info('Executing jest');
  const statusCode = await executeJest(coverageFilePath, cwd, shouldCommentCoverage);
  const results = readTestResults(coverageFilePath);

  // Parse the result file, output annotations, and exit if tests failed
  core.info('Reporting test results');
  reportTestResults(results);
  exitIfFailed(statusCode);

  // Return early if we should not post code coverage comment
  if (!shouldCommentCoverage) {
    core.info('Code coverage commenting is disabled. Skipping...');
    return;
  }

  // Generate table for coverage data and output it
  await outputCoverageTable(results);
}

async function executeJest(
  coverageFilePath: string,
  cwd: string,
  shouldCommentCoverage: boolean
): Promise<number> {
  const baseCommand = core.getInput('test-command', { required: false }) ?? 'npm test';
  const runOnlyChangedFiles = getBooleanArg('changes-only');

  // Make the jest command
  const cmd = getJestCommand({
    coverageFilePath,
    baseCommand,
    runOnlyChangedFiles,
    withCoverage: shouldCommentCoverage,
  });

  return await runJest({ cmd, cwd });
}

function exitIfFailed(statusCode: number): void {
  const exitOnJestFail = getBooleanArg('fail-action-if-jest-fails');

  if (exitOnJestFail && statusCode !== 0) {
    throw new Error(
      'Jest returned non-zero exit code. Check annotations or debug output for more information.'
    );
  }

  // Output status message if "fail-action-if-jest-fails" is disabled
  if (!exitOnJestFail) {
    core.info(
      'Continuing even though jest failed, since "fail-action-if-jest-fails" is false.'
    );
  }
}

async function outputCoverageTable({ coverageMap }: FormattedTestResults): Promise<void> {
  const dryRun = getBooleanArg('dry-run');

  if (!coverageMap) {
    throw new Error('Could not find coverage info in jest results file');
  }

  core.info('Generating coverage table');

  // Make the comment content
  const commentContent = generateCommentBody(coverageMap);

  if (dryRun) {
    core.debug(`Dry run detected: Here's the content of the comment:`);
    core.debug(commentContent);
    return;
  }

  core.info('Posting comment');
  const githubToken = getGithubToken();
  // Post the comment.
  await updateOrCreateComment(commentContent, githubToken);
}

main().catch((err) => {
  core.setFailed(err.message);
});
