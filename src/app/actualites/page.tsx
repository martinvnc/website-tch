import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActualitesClient } from "./ActualitesClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités — Tennis Club Halluin",
  description: "Toutes les actualités du Tennis Club Halluin : tournois, stages, soirées et vie du club.",
};

export default async function ActualitesPage() {
  const supabase = createServerSupabaseClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("date_publication", { ascending: false });

  console.log("[ACTUALITES] news count:", news?.length, "error:", error?.message);

  return <ActualitesClient news={news ?? []} />;
}
