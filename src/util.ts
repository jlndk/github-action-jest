export function truncateLeft(str: string, len: number): string {
  if (len >= str.length) {
    return str;
  }

  const subStr = str.substring(str.length - len);

  return `...${subStr}`;
}
