import { FormattedTestResults } from '@jest/test-result/build/types';
import { startGroup, endGroup } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';
import { printTestResultAnnotations, printAnnotation } from '../testResults';

jest.mock('@actions/core');
jest.mock('@actions/core/lib/command');

describe('reportTestResults', () => {
  it('does nothing if numFailedTests is zero', () => {
    printTestResultAnnotations({
      numFailedTests: 0,
    } as FormattedTestResults);

    expect(startGroup).not.toBeCalled();
    expect(issueCommand).toBeCalledTimes(0);
    expect(endGroup).not.toBeCalled();
  });

  it('prints failureMessages', () => {
    const results = {
      numFailedTests: 1,
      testResults: [
        {
          assertionResults: [{ failureMessages: ['(foobar.js:42:69)this is a failure'] }],
        },
      ],
    } as FormattedTestResults;

    printTestResultAnnotations(results);

    expect(startGroup).toBeCalledWith('Jest Annotations');
    expect(issueCommand).toBeCalledTimes(1);
    expect(endGroup).toBeCalled();
  });

  it('skips printing message if it does not match regex', () => {
    const results = {
      numFailedTests: 1,
      testResults: [
        {
          assertionResults: [{ failureMessages: ['this does not match regex'] }],
        },
      ],
    } as FormattedTestResults;

    printTestResultAnnotations(results);

    expect(startGroup).toBeCalledWith('Jest Annotations');
    expect(issueCommand).not.toBeCalled();
    expect(endGroup).toBeCalled();
  });

  it('skips printing message failureMessages does not exist', () => {
    const results = {
      numFailedTests: 1,
      testResults: [{ assertionResults: [{ failureMessages: null }] }],
    } as FormattedTestResults;

    printTestResultAnnotations(results);

    expect(startGroup).toBeCalledWith('Jest Annotations');
    expect(issueCommand).not.toBeCalled();
    expect(endGroup).toBeCalled();
  });
});

describe('printAnnotation', () => {
  it('parses and prints message', () => {
    const msg = '(foobar.js:42:69)this is a failure';

    printAnnotation(msg);

    expect(issueCommand).toBeCalledWith(
      'error',
      { file: 'foobar.js', line: '42', col: '69' },
      '(foobar.js:42:69)this is a failure'
    );
  });

  it('skips printing message if it does not match regex', () => {
    const msg = 'this does not match regex';

    printAnnotation(msg);

    expect(issueCommand).not.toBeCalled();
  });
});
