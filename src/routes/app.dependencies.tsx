import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/dependencies")({
  head: () => ({ meta: [{ title: "Dependencies — SupplyPulse" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="text-lg font-semibold">Dependency Graph</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Upstream / downstream supply chain visualization with react-flow.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coming in next build step
        </div>
      </div>
    </div>
  ),
});
