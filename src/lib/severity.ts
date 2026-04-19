export type Severity = "low" | "watch" | "elevated" | "critical";

export const severityLabel: Record<Severity, string> = {
  low: "Low",
  watch: "Watch",
  elevated: "Elevated",
  critical: "Critical",
};

export const severityRank: Record<Severity, number> = {
  low: 1,
  watch: 2,
  elevated: 3,
  critical: 4,
};

export const severityClasses: Record<Severity, string> = {
  low: "text-severity-low bg-severity-low-bg/40 border-severity-low/40",
  watch: "text-severity-watch bg-severity-watch-bg/40 border-severity-watch/40",
  elevated: "text-severity-elevated bg-severity-elevated-bg/40 border-severity-elevated/40",
  critical: "text-severity-critical bg-severity-critical-bg/40 border-severity-critical/50",
};

export const severityDotClasses: Record<Severity, string> = {
  low: "bg-severity-low",
  watch: "bg-severity-watch",
  elevated: "bg-severity-elevated",
  critical: "bg-severity-critical",
};

export function formatNumber(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", opts).format(n);
}

export function formatCompact(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
