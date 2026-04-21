import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/map")({
  head: () => ({ meta: [{ title: "World Map — SupplyPulse" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="text-lg font-semibold">World Risk Map</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Interactive Leaflet map with refineries, chokepoints, routes, and active events.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coming in next build step
        </div>
        <div className="mt-2 text-sm">react-leaflet integration with all layer toggles.</div>
      </div>
    </div>
  ),
});
