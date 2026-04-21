import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Globe2, GitBranch, Bell, Zap, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SupplyPulse — Aviation Fuel Supply Chain Risk Intelligence" },
      {
        name: "description",
        content:
          "Real-time risk intelligence for aviation fuel supply chains. Monitor chokepoints, simulate disruptions, protect operations.",
      },
      { property: "og:title", content: "SupplyPulse — Aviation Fuel Risk Intelligence" },
      {
        property: "og:description",
        content:
          "Real-time risk intelligence for aviation fuel supply chains. Monitor chokepoints, simulate disruptions, protect operations.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider">SUPPLYPULSE</span>
            <span className="ml-1 rounded-sm border border-severity-critical/40 bg-severity-critical-bg/40 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-severity-critical">
              <span className="sp-pulse inline-block h-1.5 w-1.5 rounded-full bg-severity-critical mr-1" />
              Live
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Start free trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-sm border border-severity-critical/40 bg-severity-critical-bg/30 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-severity-critical">
              <AlertTriangle className="h-3 w-3" />
              Active crisis: Hormuz disruption
            </div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
              Aviation fuel supply chain risk —{" "}
              <span className="text-primary">in real time.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Track chokepoints, refineries, prices, and routes that move 100M+ barrels of jet fuel.
              When a disruption hits, see exactly which of your operations is exposed and what to do
              about it — before competitors react.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/auth/signup">
                <Button size="lg" className="font-medium">
                  Start free trial
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline">View live dashboard</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-xs text-muted-foreground">
              <div>
                <span className="text-severity-critical font-semibold">$4.30</span>/gal jet fuel · EU
              </div>
              <div>
                <span className="text-severity-critical font-semibold">6 wks</span> EU buffer
              </div>
              <div>
                <span className="text-severity-critical font-semibold">~20%</span> global flow at risk
              </div>
            </div>
          </div>

          {/* Stylized terminal preview */}
          <div className="rounded-md border border-border bg-card p-1 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-severity-critical" />
              <span className="h-2 w-2 rounded-full bg-severity-elevated" />
              <span className="h-2 w-2 rounded-full bg-severity-low" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                supplypulse / dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {[
                { l: "CRITICAL EVENTS", v: "5", d: "+2 / 24h", c: "text-severity-critical" },
                { l: "JET FUEL · EU", v: "$4.31", d: "+18.4%", c: "text-severity-critical" },
                { l: "WATCHLIST RISK", v: "82", d: "ELEVATED", c: "text-severity-elevated" },
                { l: "EU BUFFER", v: "6w", d: "depleting", c: "text-severity-elevated" },
              ].map((k) => (
                <div key={k.l} className="rounded-sm bg-muted/40 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {k.l}
                  </div>
                  <div className={`font-mono text-2xl font-semibold ${k.c}`}>{k.v}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{k.d}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Active risk events
              </div>
              {[
                { s: "critical", t: "Strait of Hormuz restricted", a: "4d" },
                { s: "critical", t: "IEA: Europe 6 weeks of jet fuel", a: "2d" },
                { s: "elevated", t: "Air Canada suspends YYZ→JFK", a: "1d" },
              ].map((e) => (
                <div key={e.t} className="flex items-center justify-between border-b border-border/50 px-1 py-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        e.s === "critical" ? "bg-severity-critical sp-pulse" : "bg-severity-elevated"
                      }`}
                    />
                    <span className="text-xs">{e.t}</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{e.a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Six modules. One operations picture.
          </h2>
          <div className="mt-10 grid gap-px bg-border lg:grid-cols-3">
            {[
              {
                icon: Activity,
                t: "Risk Dashboard",
                d: "KPI surface for active events, jet fuel prices, watchlist exposure, and regional buffers.",
              },
              {
                icon: Globe2,
                t: "World Risk Map",
                d: "Live heatmap of refineries, chokepoints, and supply routes — drill into any node.",
              },
              {
                icon: GitBranch,
                t: "Dependency Graph",
                d: "See upstream-downstream exposure: which airports depend on which refineries.",
              },
              {
                icon: Zap,
                t: "What-If Simulator",
                d: "AI-driven scenarios: model a Hormuz closure, refinery outage, or sanctions shift.",
              },
              {
                icon: Bell,
                t: "Alerts",
                d: "Rule-based price, event, and risk-score triggers via email and in-app.",
              },
              {
                icon: Shield,
                t: "Intelligence Feed",
                d: "Curated, scored news from Reuters, IATA, BBC, EIA, and more.",
              },
            ].map((f) => (
              <div key={f.t} className="bg-card p-6">
                <f.icon className="h-5 w-5 text-primary" />
                <div className="mt-4 text-sm font-semibold">{f.t}</div>
                <div className="mt-1.5 text-xs text-muted-foreground">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            The next disruption isn't on your dashboard yet.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            SupplyPulse gives airline operations, fuel procurement, and risk teams a single view of
            global aviation fuel exposure. Free trial — no credit card.
          </p>
          <Link to="/auth/signup" className="mt-6">
            <Button size="lg">
              Start free trial
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-xs text-muted-foreground">
        <div className="font-mono">© SUPPLYPULSE · v1.0</div>
        <div className="font-mono">Forecasts are estimates. Validate before acting.</div>
      </footer>
    </div>
  );
}
