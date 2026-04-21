import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/scenarios")({
  head: () => ({ meta: [{ title: "Scenarios — SupplyPulse" }] }),
  component: () => (
    <div className="p-6">
      <h1 className="text-lg font-semibold">What-If Scenario Simulator</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Run AI-powered "what if Hormuz closes for 30 days" simulations with structured impact estimates.
      </p>
      <div className="mt-6 rounded-md border border-dashed border-border bg-card p-12 text-center">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Coming in next build step
        </div>
        <div className="mt-2 text-sm">AI gateway edge function + scenario UI.</div>
      </div>
    </div>
  ),
});
