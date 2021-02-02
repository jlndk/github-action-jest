import { createCoverageMap, CoverageMap } from 'istanbul-lib-coverage';
import { setOutput } from '@actions/core';
import { toHTMLTable } from '../html';
import { getFilesByDirectory } from './file';
import { coverageToRow, directoriesToRows } from './format';

const headers = ['% Statements', '% Branch', '% Funcs', '% Lines'];

export function generateCommentBody(data: CoverageMap): string {
  // Create the coverage map object from the raw data
  const map = createCoverageMap(data);

  const summaryTable = createSummaryTable(map);
  const fullTable = createFullTable(map);

  const lines = [
    '# Code Coverage :mag_right:',
    summaryTable,
    '', // Add empty line to make sure header still renders correctly
    '## Full overview',
    '<details>',
    '<summary>Click to expand</summary>\n',
    fullTable,
    '</details>',
  ];

  return lines.join('\n');
}

export function createSummaryTable(coverageMap: CoverageMap): string {
  // Create row for summary table
  const summary = coverageToRow(coverageMap.getCoverageSummary());

  // Generate HTML output for summary table
  return toHTMLTable(headers, [summary]);
}

export function createFullTable(coverageMap: CoverageMap): string {
  // Get files grouped by directory, with coverage info
  const dirs = getFilesByDirectory(coverageMap);

  // Make table rows based on files in directories.
  const rows = directoriesToRows(dirs);

  // Generate HTML output for summary table. Also add filename as a header
  return toHTMLTable(['File', ...headers], rows);
}

export function setCoverageOutput(data: CoverageMap): void {
  const map = createCoverageMap(data);
  const summary = map.getCoverageSummary();
  setOutput('branch-coverage', summary.branches.pct);
  setOutput('line-coverage', summary.lines.pct);
  setOutput('function-coverage', summary.functions.pct);
  setOutput('statement-coverage', summary.statements.pct);
}
