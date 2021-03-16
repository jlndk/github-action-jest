import { FormattedTestResults } from '@jest/test-result/build/types';
import { startGroup, endGroup } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';

const regex = /\((.+?):(\d+):(\d+)\)/;

export function printTestResultAnnotations(result: FormattedTestResults): void {
  if (result.numFailedTests == 0) {
    return;
  }

  startGroup('Jest Annotations');

  result.testResults
    // Merge the deeply nested array of objects into a simple string array
    .flatMap((t) => t.assertionResults.flatMap((a) => a.failureMessages))
    // Remove empty/non-existant messages
    .filter((msg): msg is string => msg != null)
    // Print all messages
    .forEach((msg) => printAnnotation(msg));

  endGroup();
}

export function printAnnotation(msg: string): void {
  const match = regex.exec(msg);
  if (match && match.length > 2) {
    const args = {
      file: match[1],
      line: match[2],
      col: match[3],
    };

    issueCommand('error', args, msg);
  }
}
