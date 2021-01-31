import { getInput } from '@actions/core';

export function hasBooleanArg(key: string, required = false): boolean {
  return Boolean(JSON.parse(getInput(key, { required })));
}

export function getGithubToken(): string {
  const token = process.env.GITHUB_TOKEN;

  // Apparently the env var can be undefined as a string sometimes -_-'
  if (token == 'undefined' || token == undefined) {
    throw new Error('GITHUB_TOKEN not set.');
  }

  return token;
}
