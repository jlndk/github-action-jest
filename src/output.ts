import * as core from '@actions/core';
import { FormattedTestResults } from '@jest/test-result/build/types';
import { getGithubToken } from './args';
import { generateCommentBody } from './coverage';
import updateOrCreateComment from './comment';

export type OutputCoverageTableArgs = Pick<FormattedTestResults, 'coverageMap'> & {
  dryRun: boolean;
};

export async function outputCoverageResult({
  coverageMap,
  dryRun,
}: OutputCoverageTableArgs): Promise<void> {
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
