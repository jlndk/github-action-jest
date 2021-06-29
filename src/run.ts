import { readFileSync, existsSync } from 'fs';
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { debug, endGroup, startGroup } from '@actions/core';
import { FormattedTestResults } from '@jest/test-result/build/types';

export type ExecuteJestOptions = {
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

export type RunJestArgs = GetJestCommandArgs & {
  cwd: string;
};

export type JestExecutionResult = {
  statusCode: number;
  testResults?: FormattedTestResults;
};

export default async function runJest({
  coverageFilePath,
  baseCommand,
  runOnlyChangedFiles,
  withCoverage,
  cwd,
}: RunJestArgs): Promise<JestExecutionResult> {
  // Make the jest command
  const cmd = getJestCommand({
    coverageFilePath,
    baseCommand,
    runOnlyChangedFiles,
    withCoverage,
  });

  const statusCode = await executeJest({ cmd, cwd });

  return {
    statusCode,
    testResults: readTestResults(coverageFilePath),
  };
}

export async function executeJest({ cmd, cwd }: ExecuteJestOptions): Promise<number> {
  startGroup('Jest output');

  const statusCode = await exec(cmd, [], { cwd, ignoreReturnCode: true });

  debug(`Jest exited with status code: ${statusCode}`);

  endGroup();

  return statusCode;
}

export function readTestResults(
  coverageFilePath: string
): FormattedTestResults | undefined {
  if (!existsSync(coverageFilePath)) return undefined;

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

export function exitIfFailed(statusCode: number, exitOnJestFail: boolean): void {
  if (statusCode === 0) {
    return;
  }
  if (exitOnJestFail) {
    throw new Error(
      'Jest returned non-zero exit code. Check annotations or debug output for more information.'
    );
  } else {
    core.info(
      'Continuing even though jest failed, since "fail-action-if-jest-fails" is false.'
    );
  }
}
