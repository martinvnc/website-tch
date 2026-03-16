"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ReservationState = {
  error?: string;
  success?: string;
};

export async function createReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Vous devez être connecté." };

  const terrainId = formData.get("terrainId") as string;
  const date = formData.get("date") as string;
  const heureDebut = formData.get("heureDebut") as string;
  const partenaireId = formData.get("partenaireId") as string;

  if (!terrainId || !date || !heureDebut || !partenaireId) {
    return { error: "Tous les champs sont obligatoires." };
  }

  if (partenaireId === user.id) {
    return { error: "Vous ne pouvez pas vous sélectionner comme partenaire." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("adhesion_expire")
    .eq("id", user.id)
    .single();

  if (profile?.adhesion_expire && new Date(profile.adhesion_expire) < new Date()) {
    return { error: "Votre adhésion n'est pas active. Renouvelez-la pour réserver." };
  }

  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("adhesion_expire")
    .eq("id", partenaireId)
    .single();

  if (partnerProfile?.adhesion_expire && new Date(partnerProfile.adhesion_expire) < new Date()) {
    return { error: "L'adhésion de votre partenaire n'est pas active." };
  }

  const { count: userCount } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .or(`user_id.eq.${user.id},partenaire_user_id.eq.${user.id}`)
    .eq("date", date)
    .eq("statut", "confirmed");

  if (userCount && userCount > 0) {
    return { error: "Vous avez déjà une réservation ce jour. Limite : 1 par jour." };
  }

  const { count: partnerCount } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .or(`user_id.eq.${partenaireId},partenaire_user_id.eq.${partenaireId}`)
    .eq("date", date)
    .eq("statut", "confirmed");

  if (partnerCount && partnerCount > 0) {
    return { error: "Votre partenaire a déjà une réservation ce jour." };
  }

  const { count: slotCount } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("terrain_id", terrainId)
    .eq("date", date)
    .eq("heure_debut", heureDebut + ":00")
    .eq("statut", "confirmed");

  if (slotCount && slotCount > 0) {
    return { error: "Ce créneau vient d'être réservé. Choisissez-en un autre." };
  }

  const startHour = parseInt(heureDebut.split(":")[0]);
  const heureFin = `${(startHour + 1).toString().padStart(2, "0")}:00:00`;

  const { error } = await supabase.from("reservations").insert({
    terrain_id: terrainId,
    user_id: user.id,
    partenaire_user_id: partenaireId,
    date,
    heure_debut: heureDebut + ":00",
    heure_fin: heureFin,
    statut: "confirmed",
  });

  if (error) {
    return { error: "Erreur lors de la réservation. Réessayez." };
  }

  revalidatePath("/reservation");
  revalidatePath("/mon-compte");

  return { success: "Terrain réservé avec succès !" };
}

export async function cancelReservation(reservationId: string): Promise<ReservationState> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Vous devez être connecté." };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { error: "Réservation introuvable." };

  if (reservation.user_id !== user.id && reservation.partenaire_user_id !== user.id) {
    return { error: "Vous ne pouvez annuler que vos propres réservations." };
  }

  const resDateTime = new Date(`${reservation.date}T${reservation.heure_debut}`);
  const twoHoursBefore = new Date(resDateTime.getTime() - 2 * 60 * 60 * 1000);
  if (new Date() > twoHoursBefore) {
    return { error: "Annulation impossible moins de 2h avant le créneau." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ statut: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", reservationId);

  if (error) return { error: "Erreur lors de l'annulation." };

  revalidatePath("/reservation");
  revalidatePath("/mon-compte");

  return { success: "Réservation annulée." };
}
