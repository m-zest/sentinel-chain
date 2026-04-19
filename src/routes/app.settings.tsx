import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — SupplyPulse" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <h1 className="text-lg font-semibold">Settings</h1>
      <p className="mt-1 text-xs text-muted-foreground">Account & workspace preferences.</p>
      <div className="mt-6 rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Account
        </div>
        <div className="space-y-2 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-mono">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-[10px]">{user?.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
