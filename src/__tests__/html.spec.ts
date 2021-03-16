import { toHTMLTable, toHTMLTableRow } from '../html';

describe('toHTMLTable', () => {
  it('renders html table', () => {
    const headers = ['a', 'b', 'c'];
    const rows = [
      ['foo', 'bar', 'baz'],
      ['foobar', 'barfoo', 'bazbaz'],
    ];

    const actual = toHTMLTable(headers, rows);

    let expected = '';
    expected += '<table width="100%">';
    expected += '<thead>';

    expected += '<tr>';
    expected += '<th>a</th>';
    expected += '<th>b</th>';
    expected += '<th>c</th>';
    expected += '</tr>';

    expected += '</thead>';
    expected += '<tbody>';

    expected += '<tr>';
    expected += '<td>foo</td>';
    expected += '<td nowrap="nowrap" align="right">bar</td>';
    expected += '<td nowrap="nowrap" align="right">baz</td>';
    expected += '</tr>';

    expected += '<tr>';
    expected += '<td>foobar</td>';
    expected += '<td nowrap="nowrap" align="right">barfoo</td>';
    expected += '<td nowrap="nowrap" align="right">bazbaz</td>';
    expected += '</tr>';

    expected += '</tbody>';
    expected += '</table>';

    expect(actual).toEqual(expected);
  });
});

describe('toHTMLTableRow', () => {
  it('renders html table rows', () => {
    const rows = [
      ['foo', 'bar', 'baz'],
      ['qux', 'mux', 'bux'],
    ];

    const actual = toHTMLTableRow(rows, (c) => `|${c}|`, 'wrapper');

    expect(actual).toEqual(
      '<wrapper><tr>|foo||bar||baz|</tr><tr>|qux||mux||bux|</tr></wrapper>'
    );
  });
});
