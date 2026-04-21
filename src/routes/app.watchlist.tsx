import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plane, Ship, Factory, Globe2, Search, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWatchlist, type WatchEntityType } from "@/hooks/useWatchlist";
import { SeverityBadge } from "@/components/SeverityBadge";
import { WatchToggle } from "@/components/WatchToggle";
import { cn } from "@/lib/utils";
import { type Severity, formatCompact } from "@/lib/severity";
import { toast } from "sonner";

export const Route = createFileRoute("/app/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — SupplyPulse" },
      {
        name: "description",
        content:
          "Curate the airports, routes, suppliers, and regions you operate against. Dashboard KPIs follow your watchlist scope.",
      },
    ],
  }),
  component: WatchlistPage,
});

type Region = { id: string; name: string; country_code: string; risk_level: Severity };
type Airport = {
  id: string;
  iata_code: string;
  name: string;
  region_id: string | null;
  annual_fuel_demand_bbl: number | null;
};
type Supplier = {
  id: string;
  name: string;
  type: "refinery" | "port" | "pipeline" | "storage" | "chokepoint";
  region_id: string | null;
  capacity_bpd: number | null;
  criticality_score: number | null;
};
type RouteRow = {
  id: string;
  name: string;
  mode: "sea" | "air" | "rail" | "pipeline";
  origin_region_id: string | null;
  destination_region_id: string | null;
  annual_volume_bbl: number | null;
  risk_score: number | null;
};

const TABS: { key: WatchEntityType; label: string; icon: typeof Plane }[] = [
  { key: "airport", label: "Airports", icon: Plane },
  { key: "route", label: "Routes", icon: Ship },
  { key: "supplier", label: "Suppliers", icon: Factory },
  { key: "region", label: "Regions", icon: Globe2 },
];

function WatchlistPage() {
  const { items, loading: wlLoading, refresh } = useWatchlist();
  const [active, setActive] = useState<WatchEntityType>("airport");
  const [query, setQuery] = useState("");

  const [regions, setRegions] = useState<Region[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingData(true);
      const [r, a, s, rt] = await Promise.all([
        supabase.from("regions").select("id,name,country_code,risk_level"),
        supabase.from("airports").select("id,iata_code,name,region_id,annual_fuel_demand_bbl"),
        supabase
          .from("suppliers")
          .select("id,name,type,region_id,capacity_bpd,criticality_score"),
        supabase
          .from("routes")
          .select(
            "id,name,mode,origin_region_id,destination_region_id,annual_volume_bbl,risk_score",
          ),
      ]);
      if (cancelled) return;
      setRegions((r.data ?? []) as Region[]);
      setAirports((a.data ?? []) as Airport[]);
      setSuppliers((s.data ?? []) as Supplier[]);
      setRoutes((rt.data ?? []) as RouteRow[]);
      setLoadingData(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const regionMap = useMemo(() => {
    const m = new Map<string, Region>();
    regions.forEach((r) => m.set(r.id, r));
    return m;
  }, [regions]);

  const watchedByType = useMemo(() => {
    const map: Record<WatchEntityType, Set<string>> = {
      airport: new Set(),
      route: new Set(),
      supplier: new Set(),
      region: new Set(),
    };
    items.forEach((i) => map[i.entity_type].add(i.entity_id));
    return map;
  }, [items]);

  const counts = {
    airport: watchedByType.airport.size,
    route: watchedByType.route.size,
    supplier: watchedByType.supplier.size,
    region: watchedByType.region.size,
  };

  const totalWatched = items.length;

  // Filter datasets for the active tab
  const activeRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (active === "airport") {
      return airports
        .filter(
          (a) =>
            !q ||
            a.iata_code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q),
        )
        .map((a) => ({
          id: a.id,
          primary: a.iata_code,
          secondary: a.name,
          tertiary: regionMap.get(a.region_id ?? "")?.name ?? "—",
          meta: a.annual_fuel_demand_bbl
            ? `${formatCompact(a.annual_fuel_demand_bbl)} bbl/yr`
            : "—",
          risk: regionMap.get(a.region_id ?? "")?.risk_level ?? "low",
        }));
    }
    if (active === "route") {
      return routes
        .filter((r) => !q || r.name.toLowerCase().includes(q))
        .map((r) => ({
          id: r.id,
          primary: r.mode.toUpperCase(),
          secondary: r.name,
          tertiary: `${regionMap.get(r.origin_region_id ?? "")?.country_code ?? "?"} → ${
            regionMap.get(r.destination_region_id ?? "")?.country_code ?? "?"
          }`,
          meta: r.annual_volume_bbl
            ? `${formatCompact(r.annual_volume_bbl)} bbl/yr`
            : "—",
          risk: ((r.risk_score ?? 0) >= 75
            ? "critical"
            : (r.risk_score ?? 0) >= 50
              ? "elevated"
              : (r.risk_score ?? 0) >= 25
                ? "watch"
                : "low") as Severity,
        }));
    }
    if (active === "supplier") {
      return suppliers
        .filter((s) => !q || s.name.toLowerCase().includes(q) || s.type.includes(q))
        .map((s) => ({
          id: s.id,
          primary: s.type.toUpperCase(),
          secondary: s.name,
          tertiary: regionMap.get(s.region_id ?? "")?.name ?? "—",
          meta: s.capacity_bpd ? `${formatCompact(s.capacity_bpd)} bpd` : "—",
          risk: ((s.criticality_score ?? 0) >= 75
            ? "critical"
            : (s.criticality_score ?? 0) >= 50
              ? "elevated"
              : (s.criticality_score ?? 0) >= 25
                ? "watch"
                : "low") as Severity,
        }));
    }
    return regions
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.country_code.toLowerCase().includes(q),
      )
      .map((r) => ({
        id: r.id,
        primary: r.country_code,
        secondary: r.name,
        tertiary: "Region",
        meta: "—",
        risk: r.risk_level,
      }));
  }, [active, query, airports, routes, suppliers, regions, regionMap]);

  // "My watchlist" rendered list (across all types)
  const watchedRows = useMemo(() => {
    return items
      .map((it) => {
        if (it.entity_type === "airport") {
          const a = airports.find((x) => x.id === it.entity_id);
          if (!a) return null;
          return {
            ...it,
            label: `${a.iata_code} · ${a.name}`,
            sub: regionMap.get(a.region_id ?? "")?.name ?? "—",
            risk: regionMap.get(a.region_id ?? "")?.risk_level ?? ("low" as Severity),
          };
        }
        if (it.entity_type === "route") {
          const r = routes.find((x) => x.id === it.entity_id);
          if (!r) return null;
          return {
            ...it,
            label: r.name,
            sub: `${r.mode} · ${formatCompact(r.annual_volume_bbl ?? 0)} bbl/yr`,
            risk: ((r.risk_score ?? 0) >= 75
              ? "critical"
              : (r.risk_score ?? 0) >= 50
                ? "elevated"
                : (r.risk_score ?? 0) >= 25
                  ? "watch"
                  : "low") as Severity,
          };
        }
        if (it.entity_type === "supplier") {
          const s = suppliers.find((x) => x.id === it.entity_id);
          if (!s) return null;
          return {
            ...it,
            label: `${s.name}`,
            sub: `${s.type} · ${regionMap.get(s.region_id ?? "")?.name ?? "—"}`,
            risk: ((s.criticality_score ?? 0) >= 75
              ? "critical"
              : (s.criticality_score ?? 0) >= 50
                ? "elevated"
                : "watch") as Severity,
          };
        }
        const reg = regions.find((x) => x.id === it.entity_id);
        if (!reg) return null;
        return {
          ...it,
          label: reg.name,
          sub: reg.country_code,
          risk: reg.risk_level,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      entity_type: WatchEntityType;
      entity_id: string;
      label: string;
      sub: string;
      risk: Severity;
    }>;
  }, [items, airports, routes, suppliers, regions, regionMap]);

  async function clearAll() {
    if (!items.length) return;
    if (!confirm(`Remove all ${items.length} watchlist items?`)) return;
    const ids = items.map((i) => i.id);
    const { error } = await supabase.from("watchlist_items").delete().in("id", ids);
    if (error) toast.error(error.message);
    else toast.success("Watchlist cleared");
    refresh();
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold">Watchlist</h1>
          <p className="text-xs text-muted-foreground">
            Track operational entities. Dashboard KPIs follow your watchlist scope.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {totalWatched} item{totalWatched === 1 ? "" : "s"}
          </span>
          {totalWatched > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-severity-critical/60 hover:text-severity-critical"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        {/* Browse / Add */}
        <div className="rounded-md border border-border bg-card">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border px-2">
            <div className="flex">
              {TABS.map((t) => {
                const isActive = active === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActive(t.key)}
                    className={cn(
                      "flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <t.icon className="h-3 w-3" />
                    {t.label}
                    <span
                      className={cn(
                        "ml-1 rounded-sm px-1 text-[9px]",
                        counts[t.key] > 0
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground/70",
                      )}
                    >
                      {counts[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${active}s…`}
              className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          {/* List */}
          <div className="max-h-[560px] overflow-y-auto">
            {(loadingData || wlLoading) && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">Loading…</div>
            )}
            {!loadingData && activeRows.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matches.
              </div>
            )}
            {!loadingData &&
              activeRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-border/60 px-3 py-2 last:border-0 hover:bg-muted/20"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {row.primary}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{row.secondary}</div>
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      {row.tertiary} · {row.meta}
                    </div>
                  </div>
                  <SeverityBadge severity={row.risk} />
                  <WatchToggle type={active} entityId={row.id} entityName={row.secondary} />
                </div>
              ))}
          </div>
        </div>

        {/* Right rail — current watchlist */}
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <Star className="h-3 w-3" /> My Watchlist
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">{watchedRows.length}</div>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {watchedRows.length === 0 && (
              <div className="px-3 py-8 text-center">
                <Star className="mx-auto h-6 w-6 text-muted-foreground/40" />
                <div className="mt-2 text-xs text-muted-foreground">
                  No items watched yet.
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Add airports, routes, suppliers, regions →
                </div>
              </div>
            )}
            {watchedRows.map((w) => (
              <div
                key={w.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border/60 px-3 py-2 last:border-0"
              >
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {w.entity_type.slice(0, 3)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{w.label}</div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">
                    {w.sub}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <SeverityBadge severity={w.risk} />
                  <WatchToggle
                    type={w.entity_type}
                    entityId={w.entity_id}
                    entityName={w.label}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
