import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WatchEntityType = "airport" | "route" | "supplier" | "region";

export type WatchItem = {
  id: string;
  user_id: string;
  entity_type: WatchEntityType;
  entity_id: string;
  created_at: string;
};

export function useWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("watchlist_items")
      .select("id,user_id,entity_type,entity_id,created_at")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as WatchItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWatched = useCallback(
    (type: WatchEntityType, entityId: string) =>
      items.some((i) => i.entity_type === type && i.entity_id === entityId),
    [items],
  );

  const add = useCallback(
    async (type: WatchEntityType, entityId: string) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("watchlist_items")
        .insert({ user_id: user.id, entity_type: type, entity_id: entityId })
        .select()
        .single();
      if (!error && data) setItems((prev) => [data as WatchItem, ...prev]);
      return { data, error };
    },
    [user],
  );

  const remove = useCallback(
    async (type: WatchEntityType, entityId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("entity_type", type)
        .eq("entity_id", entityId);
      if (!error) {
        setItems((prev) =>
          prev.filter((i) => !(i.entity_type === type && i.entity_id === entityId)),
        );
      }
      return { error };
    },
    [user],
  );

  const toggle = useCallback(
    async (type: WatchEntityType, entityId: string) => {
      if (isWatched(type, entityId)) return remove(type, entityId);
      return add(type, entityId);
    },
    [isWatched, add, remove],
  );

  return { items, loading, refresh, isWatched, add, remove, toggle };
}
