import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — SupplyPulse" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Watchlist</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Track airports, routes, suppliers, and regions. Dashboard KPIs default to your watchlist scope.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coming in next build step
        </div>
      </div>
    </div>
  ),
});
