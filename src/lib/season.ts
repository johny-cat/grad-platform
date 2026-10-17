/** Keep the "Today" label inside the season timeline near either end. */
export function edgeClass(fraction: number): string {
  if (fraction < 0.07) return ' is-start';
  if (fraction > 0.93) return ' is-end';
  return '';
}
