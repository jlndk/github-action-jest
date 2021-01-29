import { truncateLeft } from '../util';

describe('truncateLeft', () => {
  it('removes characters from start if string is long enough', () => {
    const actual = truncateLeft('foobar', 3);
    expect(actual).toEqual('...bar');
  });
  it('preserves string if it is below length', () => {
    const actual = truncateLeft('foobar', 6);
    expect(actual).toEqual('foobar');
  });
});
