import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LeClubClient } from "./LeClubClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Club — Tennis Club Halluin · Histoire & Installations",
  description:
    "Découvrez l'histoire du TCH depuis 1927, nos 6 terrains indoor et outdoor, notre équipe et nos installations à Halluin (59).",
};

export default async function LeClubPage() {
  const supabase = createServerSupabaseClient();

  const [
    { data: timeline },
    { data: comite },
    { data: terrains },
    { data: sponsors },
    { data: galerie },
  ] = await Promise.all([
    supabase.from("timeline_items").select("*").order("ordre"),
    supabase.from("comite_membres").select("*").order("ordre"),
    supabase.from("terrains").select("*").eq("actif", true).order("ordre"),
    supabase.from("sponsors").select("*").eq("actif", true).order("ordre"),
    supabase.from("galerie_photos").select("*").eq("actif", true).order("ordre"),
  ]);

  return (
    <LeClubClient
      timeline={timeline ?? []}
      comite={comite ?? []}
      terrains={terrains ?? []}
      sponsors={sponsors ?? []}
      galerie={galerie ?? []}
    />
  );
}
