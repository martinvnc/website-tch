import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EntraineurClient } from "./EntraineurClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace Entraîneur — Tennis Club Halluin",
};

export default async function EntraineurPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["coach", "admin"].includes(profile.role)) {
    redirect("/mon-compte");
  }

  const { data: groupes } = await supabase
    .from("groupes_entrainement")
    .select("*, groupe_membres(*, profiles(prenom, nom), profils_enfants(prenom, nom))")
    .eq("coach_id", user.id)
    .eq("actif", true);

  const { data: seances } = await supabase
    .from("seances")
    .select("*, groupes_entrainement(nom, couleur_hex), presences(*, profiles(prenom, nom), profils_enfants(prenom, nom))")
    .eq("coach_id", user.id)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date")
    .limit(20);

  return (
    <EntraineurClient
      groupes={groupes ?? []}
      seances={seances ?? []}
      coachId={user.id}
    />
  );
}
