export function toHTMLTable(headers: string[], rows: string[][]): string {
  const headerHtml = toHTMLTableRow([headers], (cell) => `<th>${cell}</th>`, 'thead');
  const bodyHtml = toHTMLTableRow(
    rows,
    (cell, i) => `<td${i > 0 ? ' nowrap="nowrap" align="right"' : ''}>${cell}</td>`,
    'tbody'
  );

  return ['<table width="100%">', headerHtml, bodyHtml, '</table>'].join('');
}

export function toHTMLTableRow(
  rows: string[][],
  formatCellCB: (cell: string, i: number) => string,
  wrapperElement: string
): string {
  return `<${wrapperElement}>${rows
    .map((row) => `<tr>${row.map(formatCellCB).join('')}</tr>`)
    .join('')}</${wrapperElement}>`;
}
