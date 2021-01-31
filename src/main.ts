import path, { sep } from 'path';
import * as core from '@actions/core';
import { shouldCommentCoverage, shouldRunOnlyChangedFiles, getGithubToken } from './args';
import { generateCommentBody, readCoverageFile } from './coverage';
import updateOrCreateComment from './comment';
import runJest, { getJestCommand } from './run';

async function main(): Promise<void> {
  try {
    // Get args
    const baseCommand = core.getInput('test-command', { required: false }) ?? 'npm test';
    console.log(baseCommand);

    const workingDirectory = core.getInput('working-directory', { required: false });
    const githubToken = getGithubToken();

    // Compute paths
    const cwd = workingDirectory ? path.resolve(workingDirectory) : process.cwd();
    const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

    // Make the jest command
    const cmd = getJestCommand({
      coverageFilePath,
      baseCommand,
      runOnlyChangedFiles: shouldRunOnlyChangedFiles(),
      withCoverage: shouldCommentCoverage(),
    });

    // execute jest
    await runJest({ cmd, cwd });

    // If we should post a coverage comment
    if (shouldCommentCoverage()) {
      // Read the coverage file
      const coverageFile = readCoverageFile(coverageFilePath);
      // Make the comment content
      const commentContent = generateCommentBody(coverageFile);
      // Post the comment.
      await updateOrCreateComment(commentContent, githubToken);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
