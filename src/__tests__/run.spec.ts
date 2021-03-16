import { exec } from '@actions/exec';
import mockFs from 'mock-fs';
import { makeJestArgs, getJestCommand, readTestResults, executeJest } from '../run';

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
    const actual = readTestResults('foobar.json');

    expect(actual).toEqual({ foo: 'bar', baz: 2 });
  });
  it('throws if not able to parse test results', () => {
    expect(() => readTestResults('invalid.json')).toThrow();
  });
  it('throws if test results does not exist', () => {
    expect(() => readTestResults('notexisting.json')).toThrow();
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
