import { readFileSync } from 'fs';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { debug, endGroup, startGroup } from '@actions/core';
import { FormattedTestResults } from '@jest/test-result/build/types';

export type RunJestOptions = {
  cmd: string;
  cwd: string;
};

type MakeJestArgs = {
  coverageFilePath: string;
  withCoverage: boolean;
  runOnlyChangedFiles: boolean;
};

export type GetJestCommandArgs = MakeJestArgs & {
  baseCommand: string;
};

export default async function runJest({ cmd, cwd }: RunJestOptions): Promise<number> {
  startGroup('Jest output');

  const statusCode = await exec(cmd, [], { cwd, ignoreReturnCode: true });

  debug(`Jest exited with status code: ${statusCode}`);

  endGroup();

  return statusCode;
}

export function readTestResults(coverageFilePath: string): FormattedTestResults {
  const content = readFileSync(coverageFilePath, 'utf-8');

  return JSON.parse(content) as FormattedTestResults;
}

export function getJestCommand({ baseCommand, ...rest }: GetJestCommandArgs): string {
  const cmd = baseCommand;

  const args = makeJestArgs(rest);

  const runnersWithHyphen = ['npm', 'npx', 'pnpm', 'pnpx'];

  const shouldAddHyphen = runnersWithHyphen.some((runner) => cmd.startsWith(runner));
  const seperator = shouldAddHyphen ? ' -- ' : ' ';

  return `${cmd}${seperator}${args.join(' ')}`;
}

export function makeJestArgs({
  coverageFilePath,
  withCoverage,
  runOnlyChangedFiles,
}: MakeJestArgs): string[] {
  const args = ['--testLocationInResults', '--json', `--outputFile=${coverageFilePath}`];

  if (withCoverage) {
    args.push('--coverage');
  }

  const baseRef = context.payload.pull_request?.base.ref;

  if (runOnlyChangedFiles && baseRef) {
    args.push(`--changedSince=${baseRef}`);
  }

  return args;
}
