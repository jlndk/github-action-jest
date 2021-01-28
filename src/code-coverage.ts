import path from 'path';
import { readFileSync } from 'fs';
import istanbulCoverage from 'istanbul-lib-coverage';
import { argv } from 'yargs';
import { toHTMLTable } from './html';
import { truncateLeft } from './util';
import { readFile } from 'fs/promises';

const rootPath = (argv.rootPath as string) || process.cwd();

type File = {
  relative: string;
  fileName: string;
  path: string;
  coverage: istanbulCoverage.CoverageSummary;
};

type Directories = {
  [key: string]: File[];
};

export async function readCoverageFile(coverageFilePath: string): Promise<istanbulCoverage.CoverageMap> {
  return JSON.parse(await readFile(coverageFilePath, 'utf-8'));
}

export function generateCommentBody(coverageMap: istanbulCoverage.CoverageMap): string {
  const { summaryTable, fullTable } = generateCoverageTable(coverageMap);
  const lines: string[] = [
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

function generateCoverageTable(
  coverageMap: istanbulCoverage.CoverageMap
): { summaryTable: string; fullTable: string } {
  const summaryToRow = (f: istanbulCoverage.CoverageSummary): string[] => [
    formatIfPoor(f.statements.pct),
    formatIfPoor(f.branches.pct),
    formatIfPoor(f.functions.pct),
    formatIfPoor(f.lines.pct),
  ];

  const parseFile = (absolute: string): File => {
    const relative = path.relative(rootPath, absolute);
    const fileName = path.basename(relative);
    const p = path.dirname(relative);
    const coverage = coverageMap.fileCoverageFor(absolute).toSummary();
    return { relative, fileName, path: p, coverage };
  };

  const groupByPath = (dirs: Directories, file: File): Directories => {
    if (!(file.path in dirs)) {
      dirs[file.path] = [];
    }

    dirs[file.path].push(file);

    return dirs;
  };

  const headers = ['% Statements', '% Branch', '% Funcs', '% Lines'];
  const summary = summaryToRow(coverageMap.getCoverageSummary());

  const files = coverageMap.files().map(parseFile).reduce(groupByPath, {});

  const rows = Object.entries(files)
    .map(([dir, files]) => [
      [`<b>${truncateLeft(dir, 50)}</b>`, '', '', '', ''], // TODO: Add metrics for directories by summing files
      ...files.map((file) => [`<code>${file.fileName}</code>`, ...summaryToRow(file.coverage)]),
    ])
    .flat();

  const fullHeaders = ['File', ...headers];

  const summaryTable = toHTMLTable(headers, [summary]);
  const fullTable = toHTMLTable(fullHeaders, rows);

  return { summaryTable, fullTable };
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
