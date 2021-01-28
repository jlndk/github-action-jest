import { exec } from '@actions/exec';

export type RunJestOptions = {
  cmd?: string;
  cwd?: string;
};

export default async function runJest({ cwd, cmd }: RunJestOptions = {}): Promise<void> {
  await exec(cmd ?? 'npm test', [], { silent: true, cwd: cwd });
}
