import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/alerts")({
  head: () => ({ meta: [{ title: "Alerts — SupplyPulse" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Alerts</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Rule-based price, event, and risk-score triggers.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coming in next build step
        </div>
      </div>
    </div>
  ),
});
