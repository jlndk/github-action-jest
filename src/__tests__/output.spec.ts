import { debug } from '@actions/core';
import { CoverageMap } from 'istanbul-lib-coverage';
import { mocked } from 'ts-jest/utils';
import { getGithubToken } from '../args';
import updateOrCreateComment from '../comment';
import { generateCommentBody } from '../coverage';
import { outputCoverageResult } from '../output';

jest.mock('@actions/core');
jest.mock('../comment');
jest.mock('../coverage');
jest.mock('../args');

describe('outputCoverageResult', () => {
  it('fails when coverageMap is falsy', async () => {
    expect(() =>
      outputCoverageResult({ coverageMap: null, dryRun: true })
    ).rejects.toThrow();
  });

  it('generates coverage table and prints it if dryRun is true', async () => {
    const commentBody = 'this is the comment body!';
    mocked(generateCommentBody).mockReturnValueOnce(commentBody);
    const coverageMap = {} as CoverageMap;
    await outputCoverageResult({
      coverageMap,
      dryRun: true,
    });

    expect(debug).toBeCalledWith(commentBody);
  });

  it('generates coverage table and posts it to github if dryRun is false', async () => {
    const commentBody = 'this is the comment body!';
    mocked(generateCommentBody).mockReturnValueOnce(commentBody);
    mocked(getGithubToken).mockReturnValueOnce('abc');

    const coverageMap = {} as CoverageMap;
    await outputCoverageResult({
      coverageMap,
      dryRun: false,
    });

    expect(updateOrCreateComment).toBeCalledWith(commentBody, 'abc');
  });
});
