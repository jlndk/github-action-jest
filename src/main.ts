import path, { sep } from 'path';
import * as core from '@actions/core';
import { getGithubToken, hasBooleanArg } from './args';
import { generateCommentBody } from './coverage';
import updateOrCreateComment from './comment';
import runJest, { getJestCommand } from './run';

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
  const results = await runJest({ cmd, cwd, coverageFilePath });

  // If we should post a coverage comment
  if (shouldCommentCoverage) {
    core.info('Generating coverage table');
    // Make the comment content
    const commentContent = generateCommentBody(results);

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
}

main().catch((err) => {
  core.setFailed(err.message);
});
