import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActualitesClient } from "./ActualitesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités — Tennis Club Halluin",
  description: "Toutes les actualités du Tennis Club Halluin : tournois, stages, soirées et vie du club.",
};

export default async function ActualitesPage() {
  const supabase = createServerSupabaseClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("date_publication", { ascending: false });

  return <ActualitesClient news={news ?? []} />;
}
