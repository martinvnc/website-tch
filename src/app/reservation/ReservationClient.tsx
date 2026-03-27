"use client";

import { useState, useEffect, useCallback } from "react";
import { useReveal } from "@/hooks/useReveal";
import { createClient } from "@/lib/supabase/client";
import { createReservation } from "@/lib/actions/reservation";
import { ChevronLeft, ChevronRight, Loader2, Lock, X, Search, CheckCircle } from "lucide-react";
import Image from "next/image";
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

type CreneauSlot = {
  id: string;
  type_id: string;
  terrain_id: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  recurrent: boolean;
  date_specifique: string | null;
  creneaux_types: { nom: string; couleur: string } | null;
};

type Member = { id: string; prenom: string; nom: string };

type Props = {
  terrains: Terrain[];
  isAuthenticated: boolean;
  creneaux: CreneauSlot[];
};

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getSlots(terrains: Terrain[]): string[] {
  // Get the widest range across all terrains
  let earliest = 23;
  let latest = 0;
  for (const t of terrains) {
    const open = parseInt(t.horaire_ouverture.split(":")[0]);
    const close = parseInt(t.horaire_fermeture.split(":")[0]);
    if (open < earliest) earliest = open;
    if (close > latest) latest = close;
  }
  const slots: string[] = [];
  for (let h = earliest; h < latest; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

function isTerrainOpenAt(terrain: Terrain, heure: string): boolean {
  const h = parseInt(heure.split(":")[0]);
  const open = parseInt(terrain.horaire_ouverture.split(":")[0]);
  const close = parseInt(terrain.horaire_fermeture.split(":")[0]);
  return h >= open && h < close;
}

const joursFrLong = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const moisFrLong = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function ReservationClient({ terrains, isAuthenticated, creneaux }: Props) {
  useReveal();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTerrainId, setModalTerrainId] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [modalHeure, setModalHeure] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Member | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ error?: string; success?: string } | null>(null);

  const dateStr = formatDate(selectedDate);
  const todayStr = formatDate(new Date());
  const slots = getSlots(terrains);

  // Max +28 days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 28);

  const canGoPrev = dateStr > todayStr;
  const canGoNext = formatDate(selectedDate) < formatDate(maxDate);

  function goDay(dir: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
  }

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const ds = formatDate(selectedDate);
    const { data } = await supabase
      .from("reservations")
      .select("id, terrain_id, user_id, partenaire_user_id, date, heure_debut, heure_fin, statut")
      .eq("statut", "confirmed")
      .eq("date", ds);
    setReservations(data ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  function isSlotBooked(terrainId: string, heure: string): boolean {
    return reservations.some((r) => r.terrain_id === terrainId && r.heure_debut === heure + ":00");
  }

  function getCreneauForSlot(terrainId: string, date: Date, heure: string): CreneauSlot | null {
    const jsDay = date.getDay();
    const jour = jsDay === 0 ? 6 : jsDay - 1;
    const heureH = parseInt(heure.split(":")[0]);
    const ds = formatDate(date);

    return creneaux.find(c => {
      if (c.terrain_id !== terrainId) return false;
      const cStart = parseInt(c.heure_debut.split(":")[0]);
      const cEnd = parseInt(c.heure_fin.split(":")[0]);
      if (heureH < cStart || heureH >= cEnd) return false;

      if (!c.recurrent && c.date_specifique) {
        return c.date_specifique === ds;
      }
      return c.jour_semaine === jour;
    }) ?? null;
  }

  async function openModal(terrainId: string, date: string, heure: string) {
    setModalTerrainId(terrainId);
    setModalDate(date);
    setModalHeure(heure);
    setSelectedPartner(null);
    setBookingResult(null);
    setSearchQuery("");
    setModalOpen(true);

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

    const formData = new FormData();
    formData.set("terrainId", modalTerrainId);
    formData.set("date", modalDate);
    formData.set("heureDebut", modalHeure);
    formData.set("partenaireId", selectedPartner.id);

    const result = await createReservation({ error: undefined, success: undefined }, formData);

    if (result.error) {
      setBookingResult({ error: result.error });
    } else {
      setBookingResult({ success: result.success ?? "Terrain réservé !" });
      fetchReservations();
    }
    setBooking(false);
  }

  const filteredMembers = members.filter(
    (m) => `${m.prenom} ${m.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalTerrain = terrains.find((t) => t.id === modalTerrainId);

  const dateLabel = `${joursFrLong[selectedDate.getDay()]} ${selectedDate.getDate()} ${moisFrLong[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <>
      {/* HERO */}
      <section className="relative bg-green-900 text-white py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/photos/club/hero-indoor-new.jpeg"
            alt=""
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-green-900/60" />
        </div>
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 text-center">
          <h1 className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl">
            Réserv<span className="text-[#f6ca73]">ation</span>
          </h1>
          <p className="mt-3 text-white/80">
            Consultez les disponibilités et réservez votre terrain
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          {/* Date navigation */}
          <div className="reveal flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => goDay(-1)}
              disabled={!canGoPrev}
              className="p-2.5 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-lg font-bold text-green-900 capitalize min-w-[300px] text-center">
              {dateLabel}
            </span>
            <button
              onClick={() => goDay(1)}
              disabled={!canGoNext}
              className="p-2.5 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Grid — 6 terrains as columns */}
          <div className="reveal d1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-green-600" size={32} />
              </div>
            ) : (
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-bold text-muted-foreground w-20">Heure</th>
                    {terrains.map((t) => (
                      <th key={t.id} className="p-2 text-center">
                        <div className="text-sm font-bold text-green-900">{t.nom}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {t.type === "indoor" ? "Indoor" : "Outdoor"} · {t.surface}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot} className="border-t border-gray-100">
                      <td className="p-2 text-xs font-bold text-muted-foreground">{slot}</td>
                      {terrains.map((t) => {
                        // Terrain fermé à cette heure
                        if (!isTerrainOpenAt(t, slot)) {
                          return <td key={t.id + slot} className="p-1"><div className="h-10 rounded-lg bg-gray-50/50" /></td>;
                        }

                        const booked = isSlotBooked(t.id, slot);
                        const past = dateStr < todayStr || (dateStr === todayStr && parseInt(slot) <= new Date().getHours());
                        const creneau = getCreneauForSlot(t.id, selectedDate, slot);

                        return (
                          <td key={t.id + slot} className="p-1">
                            {past ? (
                              <div className="h-10 rounded-lg bg-gray-50" />
                            ) : creneau ? (
                              <div
                                className="h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: (creneau.creneaux_types?.couleur ?? "#4c7650") + "22" }}
                              >
                                <span
                                  className="text-[10px] font-bold truncate px-1"
                                  style={{ color: creneau.creneaux_types?.couleur ?? "#4c7650" }}
                                >
                                  {creneau.creneaux_types?.nom ?? "Créneau"}
                                </span>
                              </div>
                            ) : booked ? (
                              <div className="h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-red-400">Réservé</span>
                              </div>
                            ) : isAuthenticated ? (
                              <button
                                className="w-full h-10 rounded-lg bg-green-50 hover:bg-green-100 text-xs font-bold text-green-600 transition-colors"
                                onClick={() => openModal(t.id, dateStr, slot)}
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
          <div className="mt-4 flex flex-wrap gap-4 text-xs reveal d2">
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
              <span className="text-muted-foreground">Passé / Fermé</span>
            </div>
            {Array.from(new Map(creneaux.map(c => [c.type_id, c.creneaux_types])).values()).map((ct, i) => ct && (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: ct.couleur + "33", border: `1px solid ${ct.couleur}55` }} />
                <span className="text-muted-foreground">{ct.nom}</span>
              </div>
            ))}
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
                  {modalTerrain?.nom} — {new Date(modalDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {modalHeure}
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
                  {modalTerrain?.nom} — {new Date(modalDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {modalHeure}
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
