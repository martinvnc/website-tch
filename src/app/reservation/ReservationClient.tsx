"use client";

import { useState, useEffect, useCallback } from "react";
import { useReveal } from "@/hooks/useReveal";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Loader2, Lock, X, Search, CheckCircle } from "lucide-react";
import Link from "next/link";

type Terrain = {
  id: string;
  nom: string;
  surface: string;
  type: "indoor" | "outdoor";
  horaire_ouverture: string;
  horaire_fermeture: string;
};

type Reservation = {
  id: string;
  terrain_id: string;
  user_id: string | null;
  partenaire_user_id: string | null;
  date: string;
  heure_debut: string;
  heure_fin: string;
  statut: string;
};

type Member = { id: string; prenom: string; nom: string };

type Props = {
  terrains: Terrain[];
  isAuthenticated: boolean;
};

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + offset * 7 - today.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getSlots(ouverture: string, fermeture: string): string[] {
  const start = parseInt(ouverture.split(":")[0]);
  const end = parseInt(fermeture.split(":")[0]);
  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

const joursFr = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const moisFr = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function ReservationClient({ terrains, isAuthenticated }: Props) {
  useReveal();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTerrain, setSelectedTerrain] = useState(terrains[0]?.id ?? "");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalHeure, setModalHeure] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Member | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ error?: string; success?: string } | null>(null);

  const dates = getWeekDates(weekOffset);
  const terrain = terrains.find((t) => t.id === selectedTerrain);
  const slots = terrain ? getSlots(terrain.horaire_ouverture, terrain.horaire_fermeture) : [];

  const fetchReservations = useCallback(async () => {
    if (!selectedTerrain || dates.length === 0) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("reservations")
      .select("id, terrain_id, user_id, partenaire_user_id, date, heure_debut, heure_fin, statut")
      .eq("terrain_id", selectedTerrain)
      .eq("statut", "confirmed")
      .gte("date", formatDate(dates[0]))
      .lte("date", formatDate(dates[6]));
    setReservations(data ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTerrain, weekOffset]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  function isSlotBooked(date: string, heure: string): boolean {
    return reservations.some((r) => r.date === date && r.heure_debut === heure + ":00");
  }

  async function openModal(date: string, heure: string) {
    setModalDate(date);
    setModalHeure(heure);
    setSelectedPartner(null);
    setBookingResult(null);
    setSearchQuery("");
    setModalOpen(true);

    // Fetch members for partner selection
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .neq("id", currentUser?.id ?? "")
      .order("nom");
    setMembers(data ?? []);
  }

  async function handleBook() {
    if (!selectedPartner) return;
    setBooking(true);
    setBookingResult(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBookingResult({ error: "Vous devez être connecté." });
      setBooking(false);
      return;
    }

    // Check user quota
    const { count: userCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .or(`user_id.eq.${user.id},partenaire_user_id.eq.${user.id}`)
      .eq("date", modalDate)
      .eq("statut", "confirmed");

    if (userCount && userCount > 0) {
      setBookingResult({ error: "Vous avez déjà une réservation ce jour (limite : 1/jour)." });
      setBooking(false);
      return;
    }

    // Check partner quota
    const { count: partnerCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .or(`user_id.eq.${selectedPartner.id},partenaire_user_id.eq.${selectedPartner.id}`)
      .eq("date", modalDate)
      .eq("statut", "confirmed");

    if (partnerCount && partnerCount > 0) {
      setBookingResult({ error: "Votre partenaire a déjà une réservation ce jour." });
      setBooking(false);
      return;
    }

    // Check slot still free
    const { count: slotCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("terrain_id", selectedTerrain)
      .eq("date", modalDate)
      .eq("heure_debut", modalHeure + ":00")
      .eq("statut", "confirmed");

    if (slotCount && slotCount > 0) {
      setBookingResult({ error: "Ce créneau vient d'être réservé." });
      setBooking(false);
      return;
    }

    const startHour = parseInt(modalHeure.split(":")[0]);
    const heureFin = `${(startHour + 1).toString().padStart(2, "0")}:00:00`;

    const { error } = await supabase.from("reservations").insert({
      terrain_id: selectedTerrain,
      user_id: user.id,
      partenaire_user_id: selectedPartner.id,
      date: modalDate,
      heure_debut: modalHeure + ":00",
      heure_fin: heureFin,
      statut: "confirmed",
    });

    if (error) {
      setBookingResult({ error: "Erreur lors de la réservation." });
    } else {
      setBookingResult({ success: "Terrain réservé !" });
      fetchReservations();
    }
    setBooking(false);
  }

  const filteredMembers = members.filter(
    (m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = formatDate(new Date());

  return (
    <>
      {/* HERO */}
      <section className="bg-green-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl">
            <span className="text-yellow-400">Réservation</span>
          </h1>
          <p className="mt-3 text-white/80">
            Consultez les disponibilités et réservez votre terrain
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Terrain selector */}
          <div className="reveal flex flex-wrap gap-2 mb-6">
            {terrains.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTerrain(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  selectedTerrain === t.id
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-900 hover:bg-green-600/10"
                }`}
              >
                {t.nom}
                <span className={`ml-1.5 text-xs ${selectedTerrain === t.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {t.type === "indoor" ? "Indoor" : "Outdoor"}
                </span>
              </button>
            ))}
          </div>

          {/* Week nav */}
          <div className="reveal d1 flex items-center justify-between mb-6">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              disabled={weekOffset <= 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-green-900">
              {dates[0].getDate()} {moisFr[dates[0].getMonth()]} — {dates[6].getDate()} {moisFr[dates[6].getMonth()]} {dates[6].getFullYear()}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 3}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Grid */}
          <div className="reveal d2 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-green-600" size={32} />
              </div>
            ) : (
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-bold text-muted-foreground w-16">Heure</th>
                    {dates.map((d) => {
                      const isToday = formatDate(d) === today;
                      return (
                        <th key={formatDate(d)} className={`p-2 text-center text-xs font-bold ${isToday ? "text-green-600" : "text-muted-foreground"}`}>
                          <div>{joursFr[d.getDay()]}</div>
                          <div className={`text-lg ${isToday ? "text-green-600" : "text-green-900"}`}>{d.getDate()}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot} className="border-t border-gray-100">
                      <td className="p-2 text-xs font-bold text-muted-foreground">{slot}</td>
                      {dates.map((d) => {
                        const dateStr = formatDate(d);
                        const booked = isSlotBooked(dateStr, slot);
                        const past = dateStr < today || (dateStr === today && parseInt(slot) <= new Date().getHours());

                        return (
                          <td key={dateStr + slot} className="p-1">
                            {past ? (
                              <div className="h-10 rounded-lg bg-gray-50" />
                            ) : booked ? (
                              <div className="h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-red-400">Réservé</span>
                              </div>
                            ) : isAuthenticated ? (
                              <button
                                className="w-full h-10 rounded-lg bg-green-50 hover:bg-green-100 text-xs font-bold text-green-600 transition-colors"
                                onClick={() => openModal(dateStr, slot)}
                              >
                                Libre
                              </button>
                            ) : (
                              <Link
                                href="/connexion?redirect=/reservation&message=Connectez-vous pour réserver"
                                className="flex items-center justify-center w-full h-10 rounded-lg bg-green-50 hover:bg-green-100 text-xs font-bold text-green-600 transition-colors gap-1"
                              >
                                <Lock size={10} /> Libre
                              </Link>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs reveal d3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
              <span className="text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
              <span className="text-muted-foreground">Réservé</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
              <span className="text-muted-foreground">Passé</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !booking && setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            {bookingResult?.success ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900">Réservation confirmée !</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {terrain?.nom} — {new Date(modalDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {modalHeure}
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-green-900 mb-1">Réserver un créneau</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {terrain?.nom} — {new Date(modalDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {modalHeure}
                </p>

                {bookingResult?.error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4">
                    {bookingResult.error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-2">
                    Choisir un partenaire (obligatoire)
                  </label>
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Rechercher un membre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors text-sm"
                    />
                  </div>

                  {selectedPartner && (
                    <div className="mb-3 p-3 rounded-lg bg-green-50 flex items-center justify-between">
                      <span className="text-sm font-bold text-green-900">
                        {selectedPartner.prenom} {selectedPartner.nom}
                      </span>
                      <button
                        onClick={() => setSelectedPartner(null)}
                        className="text-xs text-red-500 font-bold hover:text-red-700"
                      >
                        Changer
                      </button>
                    </div>
                  )}

                  {!selectedPartner && (
                    <div className="max-h-40 overflow-y-auto space-y-1 mb-4">
                      {filteredMembers.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3 text-center">
                          {members.length === 0 ? "Chargement des membres..." : "Aucun membre trouvé"}
                        </p>
                      ) : (
                        filteredMembers.slice(0, 20).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedPartner(m)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm transition-colors"
                          >
                            <span className="font-bold text-green-900">{m.prenom} {m.nom}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBook}
                  disabled={!selectedPartner || booking}
                  className="w-full mt-2 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {booking && <Loader2 size={18} className="animate-spin" />}
                  {booking ? "Réservation en cours..." : "Confirmer la réservation"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
