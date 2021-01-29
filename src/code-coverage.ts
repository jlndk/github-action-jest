import path from 'path';
import { readFileSync } from 'fs';
import { createCoverageMap, CoverageSummary, CoverageMap, CoverageMapData } from 'istanbul-lib-coverage';
import type { FormattedTestResults } from '@jest/test-result/build/types';
import { argv } from 'yargs';
import { toHTMLTable } from './html';
import { truncateLeft } from './util';

const rootPath = (argv.rootPath as string) || process.cwd();

type File = {
  relative: string;
  fileName: string;
  path: string;
  coverage: CoverageSummary;
};

type Directories = {
  [key: string]: File[];
};

export function readCoverageFile(coverageFilePath: string): CoverageMapData {
  const content = readFileSync(coverageFilePath, 'utf-8');

  const results = JSON.parse(content) as FormattedTestResults;

  if (!results.coverageMap) {
    throw new Error('Could not read coverage results from file');
  }

  return (results.coverageMap as unknown) as CoverageMapData;
}

export function generateCommentBody(coverageMap: CoverageMapData): string {
  const { summaryTable, fullTable } = generateCoverageTable(coverageMap);
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

function generateCoverageTable(coverageData: CoverageMapData): { summaryTable: string; fullTable: string } {
  const summaryToRow = (f: CoverageSummary): string[] => [
    formatIfPoor(f.statements.pct),
    formatIfPoor(f.branches.pct),
    formatIfPoor(f.functions.pct),
    formatIfPoor(f.lines.pct),
  ];

  const coverageMap = createCoverageMap(coverageData);

  const headers = ['% Statements', '% Branch', '% Funcs', '% Lines'];
  const summary = summaryToRow(coverageMap.getCoverageSummary());

  const files = coverageMap
    .files()
    .map((path) => parseFile(coverageMap, path))
    .reduce(groupByPath, {});

  const rows = Object.entries(files).flatMap(([dir, files]) => {
    // TODO: Add metrics for directories by summing files
    const dirRow = [`<b>${truncateLeft(dir, 50)}</b>`, '', '', '', ''];
    const fileRows = files.map((file) => [`<code>${file.fileName}</code>`, ...summaryToRow(file.coverage)]);
    return [dirRow, ...fileRows];
  });

  return {
    summaryTable: toHTMLTable(headers, [summary]),
    fullTable: toHTMLTable(['File', ...headers], rows),
  };
}

function formatIfPoor(number: number): string {
  if (number > 90) {
    return `${number} :green_circle:`;
  }
  if (number > 75) {
    return `${number} :yellow_circle:`;
  }
  if (number > 50) {
    return `${number} :orange_circle:`;
  }
  return `${number} :red_circle:`;
}

function parseFile(coverageMap: CoverageMap, absolute: string): File {
  const relative = path.relative(rootPath, absolute);
  return {
    relative,
    fileName: path.basename(relative),
    path: path.dirname(relative),
    coverage: coverageMap.fileCoverageFor(absolute).toSummary(),
  };
}

function groupByPath(dirs: Directories, file: File): Directories {
  if (!(file.path in dirs)) {
    dirs[file.path] = [];
  }

  dirs[file.path].push(file);

  return dirs;
}
