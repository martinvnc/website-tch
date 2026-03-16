"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { Users, Calendar, BarChart3, CheckCircle, XCircle, HelpCircle, Clock } from "lucide-react";

type Groupe = {
  id: string;
  nom: string;
  couleur_hex: string;
  groupe_membres: {
    id: string;
    profiles: { prenom: string; nom: string } | null;
    profils_enfants: { prenom: string; nom: string } | null;
  }[];
};

type Presence = {
  id: string;
  user_id: string | null;
  enfant_id: string | null;
  reponse: string;
  reponse_reelle: string;
  profiles: { prenom: string; nom: string } | null;
  profils_enfants: { prenom: string; nom: string } | null;
};

type Seance = {
  id: string;
  date: string;
  heure_debut: string;
  duree_minutes: number;
  type: string;
  lieu: string | null;
  note: string | null;
  statut: string;
  groupes_entrainement: { nom: string; couleur_hex: string } | null;
  presences: Presence[];
};

type Props = {
  groupes: Groupe[];
  seances: Seance[];
  coachId: string;
};

const presenceIcon: Record<string, React.ReactNode> = {
  present: <CheckCircle size={14} className="text-green-600" />,
  absent: <XCircle size={14} className="text-red-500" />,
  peut_etre: <HelpCircle size={14} className="text-yellow-500" />,
  en_attente: <Clock size={14} className="text-gray-400" />,
};

const tabs = [
  { id: "seances", label: "Séances", icon: <Calendar size={16} /> },
  { id: "groupes", label: "Groupes", icon: <Users size={16} /> },
  { id: "stats", label: "Statistiques", icon: <BarChart3 size={16} /> },
];

export function EntraineurClient({ groupes, seances }: Props) {
  useReveal();
  const [activeTab, setActiveTab] = useState("seances");

  const totalPresences = seances.flatMap((s) => s.presences);
  const presentCount = totalPresences.filter((p) => p.reponse === "present").length;
  const absentCount = totalPresences.filter((p) => p.reponse === "absent").length;

  return (
    <>
      <section className="bg-green-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold">Espace Entraîneur</h1>
          <p className="text-sm text-white/70 mt-1">
            {groupes.length} groupe{groupes.length > 1 ? "s" : ""} · {seances.length} séance{seances.length > 1 ? "s" : ""} à venir
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-green-600 border-b-2 border-green-600" : "text-muted-foreground hover:text-green-900"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* SÉANCES */}
          {activeTab === "seances" && (
            <div className="reveal space-y-4">
              {seances.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Aucune séance à venir.</p>
              ) : (
                seances.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.groupes_entrainement?.couleur_hex ?? "#4c7650" }}
                        />
                        <div>
                          <h3 className="font-bold text-green-900">
                            {s.groupes_entrainement?.nom ?? "Groupe"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(s.date).toLocaleDateString("fr-FR", {
                              weekday: "long", day: "numeric", month: "long",
                            })} · {s.heure_debut.slice(0, 5)} · {s.duree_minutes} min
                            {s.lieu && <> · {s.lieu}</>}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        s.statut === "planifiee" ? "bg-blue-100 text-blue-700"
                        : s.statut === "annulee" ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                      }`}>
                        {s.statut === "planifiee" ? "Planifiée" : s.statut === "annulee" ? "Annulée" : "Terminée"}
                      </span>
                    </div>

                    {/* Presences list */}
                    {s.presences.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-bold text-muted-foreground mb-2">
                          Présences ({s.presences.filter((p) => p.reponse === "present").length}/{s.presences.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {s.presences.map((p) => {
                            const name = p.profiles
                              ? `${p.profiles.prenom} ${p.profiles.nom}`
                              : p.profils_enfants
                              ? `${p.profils_enfants.prenom} ${p.profils_enfants.nom}`
                              : "Membre";
                            return (
                              <div key={p.id} className="flex items-center gap-2 text-sm">
                                {presenceIcon[p.reponse] ?? presenceIcon.en_attente}
                                <span className="truncate">{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* GROUPES */}
          {activeTab === "groupes" && (
            <div className="reveal grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groupes.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 col-span-2">Aucun groupe.</p>
              ) : (
                groupes.map((g) => (
                  <div key={g.id} className="bg-white rounded-xl p-5 shadow-sm card-hover">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: g.couleur_hex }} />
                      <h3 className="font-bold text-green-900">{g.nom}</h3>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {g.groupe_membres.length} membre{g.groupe_membres.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {g.groupe_membres.map((m) => {
                        const name = m.profiles
                          ? `${m.profiles.prenom} ${m.profiles.nom}`
                          : m.profils_enfants
                          ? `${m.profils_enfants.prenom} ${m.profils_enfants.nom}`
                          : "Membre";
                        return (
                          <p key={m.id} className="text-sm text-muted-foreground">{name}</p>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STATS */}
          {activeTab === "stats" && (
            <div className="reveal">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Groupes", value: groupes.length, color: "text-green-600" },
                  { label: "Séances à venir", value: seances.length, color: "text-blue-600" },
                  { label: "Présents", value: presentCount, color: "text-green-600" },
                  { label: "Absents", value: absentCount, color: "text-red-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Taux de présence global :{" "}
                <span className="font-bold text-green-600">
                  {totalPresences.length > 0
                    ? Math.round((presentCount / totalPresences.length) * 100)
                    : 0}
                  %
                </span>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
