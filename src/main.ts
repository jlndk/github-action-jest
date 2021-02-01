import path, { sep } from 'path';
import * as core from '@actions/core';
import { getGithubToken, hasBooleanArg } from './args';
import { generateCommentBody } from './coverage';
import updateOrCreateComment from './comment';
import runJest, { getJestCommand, readTestResults } from './run';
import { reportTestResults } from './testResults';

async function main(): Promise<void> {
  // Get args
  const baseCommand = core.getInput('test-command', { required: false }) ?? 'npm test';
  const workingDirectory = core.getInput('working-directory', { required: false });
  const shouldCommentCoverage = hasBooleanArg('coverage-comment');
  const dryRun = hasBooleanArg('dry-run');
  const runOnlyChangedFiles = hasBooleanArg('changes-only');

  // Compute paths
  const cwd = workingDirectory ? path.resolve(workingDirectory) : process.cwd();
  const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

  // Make the jest command
  const cmd = getJestCommand({
    coverageFilePath,
    baseCommand,
    runOnlyChangedFiles,
    withCoverage: shouldCommentCoverage,
  });

  core.info('Executing jest');

  // execute jest
  const statusCode = await runJest({ cmd, cwd });
  const results = readTestResults(coverageFilePath);

  core.info('Reporting test results');
  reportTestResults(results);

  if (statusCode !== 0) {
    throw new Error(
      'Jest returned non-zero exit code. Check annotations or debug output for more information.'
    );
  }

  // Return early if we should not post code coverage comment
  if (!shouldCommentCoverage) {
    core.info('Code coverage commenting is disabled. Skipping...');
    return;
  }

  const coverageMap = results.coverageMap;

  if (!coverageMap) {
    throw new Error('Could not find coverage info in jest results file');
  }

  core.info('Generating coverage table');
  // Make the comment content
  const commentContent = generateCommentBody(coverageMap);

  if (dryRun) {
    core.debug(`Dry run detected: Here's the content of the comment:`);
    core.debug(commentContent);
  } else {
    core.info('Posting comment');
    const githubToken = getGithubToken();
    // Post the comment.
    await updateOrCreateComment(commentContent, githubToken);
  }
}

main().catch((err) => {
  core.setFailed(err.message);
});
