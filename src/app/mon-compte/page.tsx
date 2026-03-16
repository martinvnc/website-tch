import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MonCompteClient } from "./MonCompteClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon compte — Tennis Club Halluin",
};

export default async function MonComptePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, terrains(nom)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(10);

  const { data: enfants } = await supabase
    .from("profils_enfants")
    .select("*")
    .eq("parent_id", user.id)
    .eq("actif", true);

  return (
    <MonCompteClient
      profile={profile}
      reservations={reservations ?? []}
      enfants={enfants ?? []}
    />
  );
}
