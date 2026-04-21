import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist, type WatchEntityType } from "@/hooks/useWatchlist";
import { toast } from "sonner";

export function WatchToggle({
  type,
  entityId,
  entityName,
  size = "sm",
  className,
}: {
  type: WatchEntityType;
  entityId: string;
  entityName?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(type, entityId);

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const wasWatched = watched;
        await toggle(type, entityId);
        toast.success(
          wasWatched
            ? `Removed ${entityName ?? "item"} from watchlist`
            : `Added ${entityName ?? "item"} to watchlist`,
        );
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-sm border transition-colors",
        size === "sm" ? "h-6 w-6" : "h-7 w-7",
        watched
          ? "border-primary/60 bg-primary/15 text-primary hover:bg-primary/25"
          : "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-primary",
        className,
      )}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star
        className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", watched && "fill-current")}
      />
    </button>
  );
}
