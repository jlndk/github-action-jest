import path from 'path';
import { CoverageSummary, CoverageMap } from 'istanbul-lib-coverage';
import { argv } from 'yargs';

export type FileInfo = {
  absolute: string;
  relative: string;
  fileName: string;
  path: string;
  coverage: CoverageSummary;
};

const rootPath = (argv.rootPath as string) || process.cwd();

export function getFilesByDirectory(
  coverageMap: CoverageMap
): Record<string, FileInfo[]> {
  return coverageMap
    .files()
    .map((path) => getFileInfo(coverageMap, path))
    .reduce((dirs, file) => groupByPath(dirs, file), {});
}

export function getFileInfo(coverageMap: CoverageMap, absolute: string): FileInfo {
  const relative = path.relative(rootPath, absolute);
  return {
    absolute,
    relative,
    fileName: path.basename(relative),
    path: path.dirname(relative),
    coverage: coverageMap.fileCoverageFor(absolute).toSummary(),
  };
}

export function groupByPath(
  dirs: Record<string, FileInfo[]>,
  file: FileInfo
): Record<string, FileInfo[]> {
  if (!(file.path in dirs)) {
    dirs[file.path] = [];
  }

  dirs[file.path].push(file);

  return dirs;
}
