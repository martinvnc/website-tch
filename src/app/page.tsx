import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HomeClient } from "@/components/home/HomeClient";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [
    { data: news },
    { data: resultats },
    { data: ticker },
  ] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("date_publication", { ascending: false })
      .limit(4),
    supabase
      .from("resultats")
      .select("*")
      .order("date", { ascending: false })
      .limit(4),
    supabase
      .from("ticker_items")
      .select("*")
      .eq("actif", true)
      .order("ordre"),
  ]);

  return (
    <HomeClient
      news={news ?? []}
      resultats={resultats ?? []}
      ticker={ticker ?? []}
    />
  );
}
