import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReservationClient } from "./ReservationClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver un terrain — Tennis Club Halluin",
  description:
    "Consultez les disponibilités et réservez votre terrain de tennis en ligne. Courts indoor et outdoor disponibles 7j/7.",
};

export default async function ReservationPage() {
  const supabase = createServerSupabaseClient();

  const { data: terrains } = await supabase
    .from("terrains")
    .select("*")
    .eq("actif", true)
    .order("ordre");

  const { data: creneaux } = await supabase
    .from("creneaux")
    .select("*, creneaux_types(nom, couleur)");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ReservationClient terrains={terrains ?? []} isAuthenticated={!!user} creneaux={creneaux ?? []} />;
}
