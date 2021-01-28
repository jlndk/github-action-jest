import path, { sep } from 'path';
import * as core from '@actions/core';
import { shouldCommentCoverage } from './args';
import { generateCommentBody, readCoverageFile } from './code-coverage';
import updateOrCreateComment from './comment';
import runJest from './run';

async function main(): Promise<void> {
  const workingDirectory = core.getInput('working-directory', { required: false });
  const cwd = workingDirectory ? path.resolve(workingDirectory) : process.cwd();
  const coverageFilePath = path.join(cwd + sep, 'jest.results.json');

  try {
    await runJest();

    if (shouldCommentCoverage()) {
      const coverageFile = await readCoverageFile(coverageFilePath);
      const commentContent = generateCommentBody(coverageFile);
      await updateOrCreateComment(commentContent);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
