import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResultatsClient } from "./ResultatsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résultats — Tennis Club Halluin",
  description:
    "Tous les résultats des matchs du TCH : interclub, tournois internes, matchs amicaux.",
};

export default async function ResultatsPage() {
  const supabase = createServerSupabaseClient();

  const { data: resultats } = await supabase
    .from("resultats")
    .select("*")
    .order("date", { ascending: false });

  return <ResultatsClient resultats={resultats ?? []} />;
}
