/** Parse API timestamps; bare values without a timezone are treated as UTC. */
export function parseApiTimestamp(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(NaN);

  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  return new Date(`${normalized}Z`);
}
