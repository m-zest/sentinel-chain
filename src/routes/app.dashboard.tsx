import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp, ExternalLink, Minus, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  formatCompact,
  formatNumber,
  severityRank,
  timeAgo,
  type Severity,
} from "@/lib/severity";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [{ title: "Risk Dashboard — SupplyPulse" }],
  }),
  component: DashboardPage,
});

type Region = {
  id: string;
  name: string;
  country_code: string;
  risk_level: Severity;
  summary: string | null;
};
type RiskEvent = {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  event_type: string;
  detected_at: string;
  resolved_at: string | null;
  source_url: string | null;
};
type PriceSnap = {
  id: string;
  commodity: string;
  region_id: string | null;
  price_usd: number;
  snapshot_at: string;
};
type Window = "7d" | "30d" | "90d";

function DashboardPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [prices, setPrices] = useState<PriceSnap[]>([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>("30d");
  const { items: watchItems } = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [r, e, p] = await Promise.all([
        supabase.from("regions").select("id,name,country_code,risk_level,summary"),
        supabase
          .from("risk_events")
          .select("id,title,description,severity,event_type,detected_at,resolved_at,source_url")
          .order("detected_at", { ascending: false })
          .limit(50),
        supabase
          .from("price_snapshots")
          .select("id,commodity,region_id,price_usd,snapshot_at")
          .order("snapshot_at", { ascending: true })
          .limit(2000),
      ]);
      if (cancelled) return;
      setRegions((r.data ?? []) as Region[]);
      setEvents((e.data ?? []) as RiskEvent[]);
      setPrices((p.data ?? []) as unknown as PriceSnap[]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // KPI: active critical events
  const criticalActive = events.filter((e) => !e.resolved_at && e.severity === "critical").length;
  const critical24h = events.filter(
    (e) => e.severity === "critical" && Date.now() - new Date(e.detected_at).getTime() < 86400000,
  ).length;

  // Find Europe region for headline price
  const europeId = regions.find((r) => r.name === "North Sea / Europe")?.id;
  const europeJet = prices
    .filter((p) => p.commodity === "jet_fuel" && p.region_id === europeId)
    .sort((a, b) => +new Date(a.snapshot_at) - +new Date(b.snapshot_at));
  const latestPrice = europeJet[europeJet.length - 1]?.price_usd ?? null;
  const sevenDaysAgo = europeJet.find(
    (p) => new Date(p.snapshot_at).getTime() <= Date.now() - 7 * 86400000,
  )?.price_usd;
  const priceDelta =
    latestPrice && sevenDaysAgo ? ((latestPrice - sevenDaysAgo) / sevenDaysAgo) * 100 : 0;

  // Watchlist risk score — weighted average across watched regions (or all if empty)
  const watchedRegionIds = useMemo(() => {
    const ids = new Set<string>();
    watchItems.forEach((w) => {
      if (w.entity_type === "region") ids.add(w.entity_id);
    });
    return ids;
  }, [watchItems]);

  const scoredRegions =
    watchedRegionIds.size > 0
      ? regions.filter((r) => watchedRegionIds.has(r.id))
      : regions;

  const avgRisk =
    scoredRegions.length > 0
      ? Math.round(
          (scoredRegions.reduce((sum, r) => sum + severityRank[r.risk_level], 0) /
            scoredRegions.length) *
            25,
        )
      : 0;

  const watchlistScopeLabel =
    watchItems.length > 0 ? `${watchItems.length} watched` : "all regions";

  // Supply buffer (Europe) — IEA narrative says 6 weeks
  const europeBuffer = "6w";

  // Chart data — windowed Europe jet fuel
  const cutoff = useMemo(() => {
    const days = window === "7d" ? 7 : window === "30d" ? 30 : 90;
    return Date.now() - days * 86400000;
  }, [window]);

  const chartData = useMemo(() => {
    return europeJet
      .filter((p) => new Date(p.snapshot_at).getTime() >= cutoff)
      .map((p) => ({
        date: new Date(p.snapshot_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ts: new Date(p.snapshot_at).getTime(),
        eu: p.price_usd,
      }));
  }, [europeJet, cutoff]);

  const eventMarkers = useMemo(() => {
    return events
      .filter((e) => e.severity === "critical" && new Date(e.detected_at).getTime() >= cutoff)
      .map((e) => ({
        date: new Date(e.detected_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        title: e.title,
      }));
  }, [events, cutoff]);

  return (
    <div className="p-4 lg:p-6">
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Risk Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Aviation fuel supply chain — live operational picture.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          {loading ? "Loading…" : `${events.length} events · ${prices.length} price points`}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Active Critical Events"
          value={String(criticalActive)}
          delta={critical24h > 0 ? `+${critical24h} / 24h` : "no change / 24h"}
          deltaDir={critical24h > 0 ? "up" : "flat"}
          tone={criticalActive > 0 ? "critical" : "low"}
        />
        <KpiCard
          label="Jet Fuel · Europe"
          value={latestPrice != null ? `$${latestPrice.toFixed(2)}` : "—"}
          unit="USD/gal"
          delta={`${priceDelta >= 0 ? "+" : ""}${priceDelta.toFixed(1)}% / 7d`}
          deltaDir={priceDelta > 0 ? "up" : priceDelta < 0 ? "down" : "flat"}
          tone={priceDelta > 5 ? "critical" : priceDelta > 0 ? "elevated" : "low"}
          sparkline={europeJet.slice(-30).map((p) => p.price_usd)}
        />
        <KpiCard
          label="Watchlist Risk Score"
          value={String(avgRisk)}
          unit="/ 100"
          delta={avgRisk >= 70 ? "ELEVATED" : avgRisk >= 50 ? "WATCH" : "LOW"}
          deltaDir="flat"
          tone={avgRisk >= 80 ? "critical" : avgRisk >= 60 ? "elevated" : avgRisk >= 40 ? "watch" : "low"}
        />
        <KpiCard
          label="Supply Buffer · Europe"
          value={europeBuffer}
          unit="jet fuel"
          delta="depleting"
          deltaDir="down"
          tone="elevated"
        />
      </div>

      {/* Middle: events + chart */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* Events */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Active Risk Events
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {events.filter((e) => !e.resolved_at).length} active
            </div>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading && <SkeletonRows />}
            {!loading && events.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">No events.</div>
            )}
            {!loading &&
              events
                .filter((e) => !e.resolved_at)
                .slice(0, 12)
                .map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/30"
                  >
                    <SeverityBadge severity={e.severity} pulse />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{e.title}</div>
                      {e.description && (
                        <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                          {e.description}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>{e.event_type}</span>
                        <span>·</span>
                        <span>{timeAgo(e.detected_at)}</span>
                      </div>
                    </div>
                    {e.source_url && (
                      <a
                        href={e.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Price chart */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Jet Fuel · Europe (USD/gal)
            </div>
            <div className="flex gap-1">
              {(["7d", "30d", "90d"] as Window[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWindow(w)}
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                    window === w
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[320px] p-3">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="euJet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.20 260)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.65 0.20 260)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "var(--color-border)" }}
                    tickLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 0.1", "dataMax + 0.1"]}
                    tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [`$${v.toFixed(3)}/gal`, "Jet Fuel EU"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="eu"
                    stroke="oklch(0.65 0.20 260)"
                    strokeWidth={2}
                    fill="url(#euJet)"
                  />
                  {eventMarkers.map((m, i) => (
                    <ReferenceLine
                      key={i}
                      x={m.date}
                      stroke="oklch(0.70 0.22 25)"
                      strokeDasharray="2 2"
                      label={{
                        value: "!",
                        fill: "oklch(0.70 0.22 25)",
                        fontSize: 10,
                        position: "top",
                      }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No price data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regional grid */}
      <div className="mt-3 rounded-md border border-border bg-card">
        <div className="border-b border-border px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Regional Status
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading && (
            <>{Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-card" />
            ))}</>
          )}
          {!loading &&
            [...regions]
              .sort((a, b) => severityRank[b.risk_level] - severityRank[a.risk_level])
              .map((r) => (
                <div key={r.id} className="bg-card p-3">
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {r.country_code}
                    </div>
                    <SeverityBadge severity={r.risk_level} pulse />
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{r.name}</div>
                  {r.summary && (
                    <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {r.summary}
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-4 rounded-md border border-border bg-muted/20 px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Disclaimer · Forecasts are AI- and rule-derived estimates from public signals. Validate against
          primary sources before operational decisions.
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaDir,
  tone = "low",
  sparkline,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
  tone?: Severity;
  sparkline?: number[];
}) {
  const toneColor: Record<Severity, string> = {
    low: "text-foreground",
    watch: "text-severity-watch",
    elevated: "text-severity-elevated",
    critical: "text-severity-critical",
  };
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {tone !== "low" && <SeverityBadge severity={tone} />}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <div className={cn("font-mono text-2xl font-semibold tabular", toneColor[tone])}>{value}</div>
        {unit && <div className="font-mono text-[10px] uppercase text-muted-foreground">{unit}</div>}
      </div>
      <div className="mt-1 flex items-center justify-between">
        {delta && (
          <div
            className={cn(
              "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider",
              deltaDir === "up" && tone !== "low" && "text-severity-critical",
              deltaDir === "up" && tone === "low" && "text-positive",
              deltaDir === "down" && "text-positive",
              deltaDir === "flat" && "text-muted-foreground",
            )}
          >
            {deltaDir === "up" && <ArrowUp className="h-3 w-3" />}
            {deltaDir === "down" && <ArrowDown className="h-3 w-3" />}
            {deltaDir === "flat" && <Minus className="h-3 w-3" />}
            {delta}
          </div>
        )}
        {sparkline && sparkline.length > 1 && (
          <div className="h-6 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline.map((v, i) => ({ i, v }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="oklch(0.65 0.20 260)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-4 w-14 animate-pulse rounded-sm bg-muted" />
          <div className="h-3 flex-1 animate-pulse rounded-sm bg-muted" />
        </div>
      ))}
    </div>
  );
}

// Avoid unused-imports warning in case we strip later
void formatNumber;
void formatCompact;
