import { exec } from '@actions/exec';
import { info } from '@actions/core';
import mockFs from 'mock-fs';
import {
  makeJestArgs,
  getJestCommand,
  readTestResults,
  executeJest,
  exitIfFailed,
} from '../run';

beforeEach(() => {
  mockFs({
    'foobar.json': JSON.stringify({ foo: 'bar', baz: 2 }),
    'invalid.json': 'this is invalid json',
  });
});

afterEach(() => {
  mockFs.restore();
});

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

jest.mock('@actions/core');

jest.mock('@actions/exec');

describe('executeJest', () => {
  it('executes command', async () => {
    await executeJest({
      cmd: 'yarn test',
      cwd: './',
    });

    expect(exec).toBeCalledWith('yarn test', [], {
      cwd: './',
      ignoreReturnCode: true,
    });
  });
});

describe('readTestResults', () => {
  it('reads and parses test results', () => {
    expect(readTestResults('foobar.json')).toEqual({ foo: 'bar', baz: 2 });
  });
  it('returns undefined if test results does not exist', () => {
    expect(readTestResults('notexisting.json')).toBeUndefined();
  });
  it('throws if not able to parse test results', () => {
    expect(() => readTestResults('invalid.json')).toThrow();
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

describe('exitIfFailed', () => {
  it('completes if status code is 0 and exitOnJestFail is true', () => {
    expect(() => exitIfFailed(0, true)).not.toThrow();
  });
  it('throws if status code is not 0 and exitOnJestFail is true', () => {
    expect(() => exitIfFailed(1, true)).toThrow();
  });
  it('completes if status code is 0 and exitOnJestFail is false', () => {
    expect(() => exitIfFailed(0, false)).not.toThrow();
    expect(info).not.toBeCalledTimes(1);
  });
  it('completes if status code is not 0 and exitOnJestFail is false', () => {
    expect(() => exitIfFailed(1, false)).not.toThrow();
    expect(info).toBeCalledTimes(1);
  });
});
