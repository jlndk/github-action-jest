import { CoverageSummary } from 'istanbul-lib-coverage';
import { coveragePercentToString, coverageToRow } from '../format';

describe('coverageToRow', () => {
  it('converts coverage into table cells', () => {
    const summary = {
      statements: {
        total: 10,
        covered: 5,
        skipped: 0,
        pct: 50,
      },
      branches: {
        total: 15,
        covered: 5,
        skipped: 0,
        pct: 33,
      },
      functions: {
        total: 12,
        covered: 12,
        skipped: 0,
        pct: 100,
      },
      lines: {
        total: 100,
        covered: 0,
        skipped: 0,
        pct: 0,
      },
    } as CoverageSummary;

    expect(coverageToRow(summary)).toEqual([
      `50 :red_circle:`,
      `33 :red_circle:`,
      `100 :green_circle:`,
      `0 :red_circle:`,
    ]);
  });
});

describe('coveragePercentToString', () => {
  it('returns correct string for each bracket', () => {
    expect(coveragePercentToString(5)).toEqual(`5 :red_circle:`);
    expect(coveragePercentToString(55)).toEqual(`55 :orange_circle:`);
    expect(coveragePercentToString(80)).toEqual(`80 :yellow_circle:`);
    expect(coveragePercentToString(99)).toEqual(`99 :green_circle:`);
  });
});
