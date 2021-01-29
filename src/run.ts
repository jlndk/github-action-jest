import { exec } from '@actions/exec';
import { context } from '@actions/github';

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
  return await exec(cmd, [], { silent: true, cwd: cwd });
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
  const baseRef = context.payload.pull_request?.base.ref;

  const args = ['--testLocationInResults', '--json', `--outputFile=${coverageFilePath}`];

  if (withCoverage) {
    args.push('--coverage');
  }

  if (runOnlyChangedFiles && baseRef) {
    args.push(`--changedSince=${baseRef}`);
  }

  return args;
}
