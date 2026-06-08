export function truncateTitle(theme: string): string {
  const trimmed = theme.trim();
  return trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}...`;
}
