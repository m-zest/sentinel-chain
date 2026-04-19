import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/severity";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/news")({
  head: () => ({ meta: [{ title: "Intelligence Feed — SupplyPulse" }] }),
  component: NewsPage,
});

type Article = {
  id: string;
  headline: string;
  summary: string | null;
  source: string | null;
  source_url: string | null;
  published_at: string;
  risk_score: number | null;
  tags: string[] | null;
};

function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("id,headline,summary,source,source_url,published_at,risk_score,tags")
        .order("published_at", { ascending: false })
        .limit(100);
      if (!cancelled) {
        setArticles((data ?? []) as unknown as Article[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function riskClass(score: number) {
    if (score >= 80) return "text-severity-critical bg-severity-critical-bg/40 border-severity-critical/40";
    if (score >= 60) return "text-severity-elevated bg-severity-elevated-bg/40 border-severity-elevated/40";
    if (score >= 40) return "text-severity-watch bg-severity-watch-bg/40 border-severity-watch/40";
    return "text-severity-low bg-severity-low-bg/40 border-severity-low/40";
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">Intelligence Feed</h1>
        <p className="text-xs text-muted-foreground">
          Curated risk-scored news from Reuters, IATA, BBC, CNBC, and more.
        </p>
      </div>
      <div className="rounded-md border border-border bg-card">
        {loading && <div className="px-4 py-8 text-center text-xs text-muted-foreground">Loading…</div>}
        {!loading &&
          articles.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-muted/30"
            >
              <div
                className={cn(
                  "rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                  riskClass(a.risk_score ?? 0),
                )}
              >
                {a.risk_score ?? 0}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{a.headline}</div>
                {a.summary && <div className="mt-1 text-[12px] text-muted-foreground">{a.summary}</div>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>{a.source ?? "Source unknown"}</span>
                  <span>·</span>
                  <span>{timeAgo(a.published_at)}</span>
                  {a.tags?.map((t) => (
                    <span key={t} className="rounded-sm bg-muted px-1 py-0.5 normal-case">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {a.source_url && (
                <a
                  href={a.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
