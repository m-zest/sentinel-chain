import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SupplyPulse" },
      { name: "description", content: "Sign in to your SupplyPulse risk intelligence workspace." },
    ],
  }),
  component: LoginPage,
});

const DEMO_EMAIL = "demo@supplypulse.app";
const DEMO_PASSWORD = "DemoPulse2026!";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function signIn(emailValue: string, passwordValue: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    });
    if (error) {
      toast.error(error.message);
      return false;
    }
    toast.success("Signed in");
    navigate({ to: "/app/dashboard" });
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  }

  async function onDemo() {
    setDemoLoading(true);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    setDemoLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider">SUPPLYPULSE</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-8">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to SupplyPulse.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || demoLoading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                or
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onDemo}
            disabled={loading || demoLoading}
          >
            {demoLoading ? "Loading demo…" : "Try the demo (no signup)"}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Instant access to a shared analyst workspace.
          </p>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/signup" className="text-primary hover:underline">
              Start a free trial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
