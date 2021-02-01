import type { FormattedTestResults } from '@jest/test-result/build/types';
import { startGroup, endGroup } from '@actions/core';
import { issueCommand } from '@actions/core/lib/command';

const regex = /\((.+?):(\d+):(\d+)\)/;

export function reportTestResults(result: FormattedTestResults): void {
  if (result.numFailedTests == 0) {
    return;
  }

  startGroup('Jest Annotations');

  for (const testResult of result.testResults) {
    for (const assertion of testResult.assertionResults) {
      assertion?.failureMessages?.forEach((msg) => {
        const match = regex.exec(msg);
        if (match && match.length > 2) {
          const args = {
            file: match[1],
            line: match[2],
            col: match[3],
          };

          issueCommand('error', args, msg);
        }
      });
    }
  }

  endGroup();
}
