const groupDigits = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatDecimal = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value).trim();
  const match = raw.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) return raw;
  const [, sign, integer, fraction] = match;
  const trimmedFraction = fraction?.replace(/0+$/, '');
  return `${sign}${groupDigits(integer)}${trimmedFraction ? `,${trimmedFraction}` : ''}`;
};
