import { CoverageSummary } from 'istanbul-lib-coverage';
import { truncateLeft } from '../util';
import { FileInfo } from './file';

export function directoriesToRows(dirs: Record<string, FileInfo[]>): string[][] {
  return Object.entries(dirs).flatMap(([dir, files]) => {
    const fileRows = files.map((file) => fileToRow(file));
    return [makeDirectoryRow(dir), ...fileRows];
  });
}

export function makeDirectoryRow(dir: string): string[] {
  // TODO: Add metrics for directories by summing files
  return [`<b>${truncateLeft(dir, 50)}</b>`, '', '', '', ''];
}

export function fileToRow({ fileName, coverage }: FileInfo): string[] {
  return [`<code>${fileName}</code>`, ...coverageToRow(coverage)];
}

export function coverageToRow(f: CoverageSummary): string[] {
  const cells = [f.statements, f.branches, f.functions, f.lines];

  return cells.map((cell) => coveragePercentToString(cell.pct));
}

export function coveragePercentToString(number: number): string {
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
