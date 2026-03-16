import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration — Tennis Club Halluin",
};

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/mon-compte");
  }

  const [
    { count: membresCount },
    { count: reservationsCount },
    { count: ticketsNouveaux },
    { data: codes },
    { data: recentTickets },
    { data: recentReservations },
    { data: news },
    { count: seancesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("statut", "confirmed"),
    supabase.from("contact_tickets").select("*", { count: "exact", head: true }).eq("statut", "nouveau"),
    supabase.from("codes_acces").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_tickets").select("*").order("created_at", { ascending: false }),
    supabase.from("reservations").select("*, terrains(nom), profiles!reservations_user_id_fkey(prenom, nom)")
      .eq("statut", "confirmed").order("created_at", { ascending: false }).limit(5),
    supabase.from("news").select("*").order("created_at", { ascending: false }),
    supabase.from("seances").select("*", { count: "exact", head: true }).eq("statut", "planifiee"),
  ]);

  return (
    <AdminClient
      stats={{
        membres: membresCount ?? 0,
        reservations: reservationsCount ?? 0,
        ticketsNouveaux: ticketsNouveaux ?? 0,
        seances: seancesCount ?? 0,
      }}
      codes={codes ?? []}
      recentTickets={recentTickets ?? []}
      recentReservations={recentReservations ?? []}
      news={news ?? []}
    />
  );
}
