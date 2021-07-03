import { exec } from '@actions/exec';

describe('main', () => {
  jest.setTimeout(30_000);
  it('exists with status code 1 on failed tests', async () => {
    const statusCode = await exec('yarn run test:demo', [], {
      silent: true,
      ignoreReturnCode: true,
    });
    expect(statusCode).toBe(1);
  });
  // it('exists with status code 0 on successful tests', async () => {
  //   const statusCode = await exec('yarn run test', [], {
  //     silent: true,
  //     ignoreReturnCode: true,
  //   });
  //   expect(statusCode).toBe(1);
  // });
});
