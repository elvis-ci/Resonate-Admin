// Returns null when there's no prior-period baseline to compare against
// (avoids a misleading "+∞%" or "-100%" on a from-zero comparison).
export function delta(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return ((current - prior) / prior) * 100;
}

export function formatDelta(pct: number | null): string {
  if (pct === null) return "";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

// For cancellations/no-shows, a rise is bad — flip the "good" direction with lowerIsBetter.
export function deltaColor(pct: number | null, lowerIsBetter = false): string {
  if (pct === null || pct === 0) return "text-muted";
  const isFavorable = lowerIsBetter ? pct < 0 : pct > 0;
  return isFavorable ? "text-emerald-600" : "text-red-600";
}