import { exec } from '@actions/exec';
import runJest, { makeJestArgs, getJestCommand } from '../run';

jest.mock('@actions/github', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...jest.requireActual<any>('@actions/github'),
  context: {
    payload: {
      pull_request: {
        base: {
          ref: 'abc',
        },
      },
    },
  },
}));

jest.mock('@actions/exec');

describe('runJest', () => {
  it('executes command', async () => {
    await runJest({
      cmd: 'yarn test',
      cwd: './',
    });

    expect(exec).toBeCalledWith('yarn test', [], {
      silent: true,
      cwd: './',
    });
  });
});

describe('makeJestArgs', () => {
  const baseArgs = ['--testLocationInResults', '--json', `--outputFile=foo.json`];
  it('returns base args', () => {
    const actual = makeJestArgs({
      coverageFilePath: 'foo.json',
      withCoverage: false,
      runOnlyChangedFiles: false,
    });

    expect(actual).toEqual(baseArgs);
  });

  it('can add argument to collect code coverage', () => {
    const actual = makeJestArgs({
      coverageFilePath: 'foo.json',
      withCoverage: true,
      runOnlyChangedFiles: false,
    });

    expect(actual).toEqual([...baseArgs, '--coverage']);
  });

  it('can add argument to only run tests on changed files', () => {
    const actual = makeJestArgs({
      coverageFilePath: 'foo.json',
      withCoverage: false,
      runOnlyChangedFiles: true,
    });

    expect(actual).toEqual([...baseArgs, '--changedSince=abc']);
  });
});

describe('getJestCommand', () => {
  it('makes jest command', () => {
    const actual = getJestCommand({
      baseCommand: 'yarn run test',
      coverageFilePath: 'foo.json',
      withCoverage: false,
      runOnlyChangedFiles: false,
    });

    expect(actual).toEqual(
      'yarn run test --testLocationInResults --json --outputFile=foo.json'
    );
  });

  it('adds hyphern before args for some runners', () => {
    const runners = ['npm', 'npx', 'pnpm', 'pnpx'];

    expect.assertions(runners.length);

    for (const runner of runners) {
      const actual = getJestCommand({
        baseCommand: `${runner} test`,
        coverageFilePath: 'foo.json',
        withCoverage: false,
        runOnlyChangedFiles: false,
      });

      expect(actual).toEqual(
        `${runner} test -- --testLocationInResults --json --outputFile=foo.json`
      );
    }
  });
});
