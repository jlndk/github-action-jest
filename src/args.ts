import { getInput } from '@actions/core';

export function hasBooleanArg(key: string, required = false): boolean {
  return Boolean(JSON.parse(getInput(key, { required })));
}

export function shouldCommentCoverage(): boolean {
  return hasBooleanArg('coverage-comment');
}

export function shouldRunOnlyChangedFiles(): boolean {
  return hasBooleanArg('changes-only');
}

export function getGithubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (token === undefined) {
    throw new Error('GITHUB_TOKEN not set.');
  }
  return token;
}
