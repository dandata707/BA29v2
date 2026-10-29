export function nextDocumentCode(prefix: string, codes: string[], year = new Date().getFullYear()) {
  const expression = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const numbers = codes.map(code => Number(code.match(expression)?.[1] || 0));
  return `${prefix}-${year}-${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}
