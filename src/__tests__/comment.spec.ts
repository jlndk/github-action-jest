/* eslint-disable @typescript-eslint/no-explicit-any */
import nock from 'nock';
import updateOrCreateComment from '../comment';

jest.mock('@actions/github', () => ({
  ...jest.requireActual<any>('@actions/github'),
  context: {
    repo: {
      repo: 'github-action-jest',
      owner: 'jlndk',
    },
    payload: {
      number: 42,
    },
  },
}));

describe('updateOrCreateComment', () => {
  const url = 'https://api.github.com';
  const basePath = '/repos/jlndk/github-action-jest/issues';

  it('creates a new comment if old one does not exist', async () => {
    let postedBody: any = null;
    nock(url).get(`${basePath}/42/comments`).reply(200, []);

    nock(url)
      .post(`${basePath}/42/comments`, (body) => {
        postedBody = eval(body);
        return body;
      })
      .reply(200, []);

    const comment = 'hello world';

    await updateOrCreateComment(comment, 'abc', 'id');

    expect(postedBody).toEqual({ body: comment + 'id' });
  });

  it('can update an existing comment if it exists', async () => {
    let postedBody: any = null;
    nock(url)
      .get(`${basePath}/42/comments`)
      .reply(200, [{ id: 42, body: 'id foobar' }]);

    nock(url)
      .patch(`${basePath}/comments/42`, (body) => {
        postedBody = eval(body);
        return body;
      })
      .reply(200, []);

    const comment = 'hello world';

    await updateOrCreateComment(comment, 'abc', 'id');

    expect(postedBody).toEqual({ body: comment + 'id' });
  });
});
