import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import {
  Activity,
  LayoutDashboard,
  Globe2,
  GitBranch,
  Zap,
  Bell,
  Newspaper,
  Star,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, signOut } from "@/hooks/useAuth";

const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/map", label: "World Map", icon: Globe2 },
  { to: "/app/dependencies", label: "Dependencies", icon: GitBranch },
  { to: "/app/scenarios", label: "Scenarios", icon: Zap },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/news", label: "Intelligence", icon: Newspaper },
  { to: "/app/watchlist", label: "Watchlist", icon: Star },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login" });
  }, [loading, user, navigate]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="font-mono text-xs text-muted-foreground tracking-wider">LOADING…</div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary">
              <Activity className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-sidebar-foreground">
              SUPPLYPULSE
            </span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-xs transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 truncate font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
            {user.email}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-start text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 rounded-sm border border-border bg-muted/40 px-2.5 py-1 sm:flex">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search routes, airports, suppliers…"
                className="w-72 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-sm border border-severity-critical/40 bg-severity-critical-bg/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-severity-critical sm:flex">
              <span className="sp-pulse h-1.5 w-1.5 rounded-full bg-severity-critical" />
              Live data
            </div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
