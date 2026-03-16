"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { createClient } from "@/lib/supabase/client";
import { cancelReservation } from "@/lib/actions/reservation";
import { User, Calendar, Users, Settings, Loader2, Pencil, Save, X } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  classement_fft: string | null;
  niveau: string | null;
  role: string;
  adhesion_expire: string | null;
};

type Reservation = {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  statut: string;
  terrains: { nom: string } | null;
};

type Enfant = {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string | null;
  niveau: string | null;
};

type Props = {
  profile: Profile | null;
  reservations: Reservation[];
  enfants: Enfant[];
};

const tabs = [
  { id: "profil", label: "Profil", icon: <User size={16} /> },
  { id: "reservations", label: "Réservations", icon: <Calendar size={16} /> },
  { id: "enfants", label: "Mes enfants", icon: <Users size={16} /> },
];

const niveaux = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "confirme", label: "Confirmé" },
  { value: "competiteur", label: "Compétiteur" },
];

export function MonCompteClient({ profile: initialProfile, reservations: initialReservations, enfants }: Props) {
  useReveal();
  const [activeTab, setActiveTab] = useState("profil");
  const [reservations, setReservations] = useState(initialReservations);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    telephone: initialProfile?.telephone ?? "",
    classement_fft: initialProfile?.classement_fft ?? "",
    niveau: initialProfile?.niveau ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  if (!profile) return null;

  const adhesionActive = profile.adhesion_expire
    ? new Date(profile.adhesion_expire) >= new Date()
    : false;

  async function handleCancel(id: string) {
    if (!confirm("Annuler cette réservation ?")) return;
    setCancellingId(id);

    const result = await cancelReservation(id);

    if (result.error) {
      alert(result.error);
    } else {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: "cancelled" } : r))
      );
    }
    setCancellingId(null);
  }

  function canCancel(r: Reservation): boolean {
    if (r.statut !== "confirmed") return false;
    const resDateTime = new Date(`${r.date}T${r.heure_debut}`);
    const twoHoursBefore = new Date(resDateTime.getTime() - 2 * 60 * 60 * 1000);
    return new Date() < twoHoursBefore;
  }

  function startEditing() {
    setEditForm({
      telephone: profile!.telephone ?? "",
      classement_fft: profile!.classement_fft ?? "",
      niveau: profile!.niveau ?? "",
    });
    setSaveMsg(null);
    setEditing(true);
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        telephone: editForm.telephone || null,
        classement_fft: editForm.classement_fft || null,
        niveau: editForm.niveau || null,
      })
      .eq("id", profile!.id);

    if (error) {
      setSaveMsg("Erreur lors de la sauvegarde.");
    } else {
      setProfile((prev) =>
        prev ? {
          ...prev,
          telephone: editForm.telephone || null,
          classement_fft: editForm.classement_fft || null,
          niveau: editForm.niveau || null,
        } : prev
      );
      setSaveMsg("Profil mis à jour !");
      setEditing(false);
    }
    setSaving(false);
  }

  return (
    <>
      <section className="bg-green-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-yellow-400">
              {profile.prenom?.[0]}{profile.nom?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile.prenom} {profile.nom}
              </h1>
              <p className="text-sm text-white/70">{profile.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-muted-foreground hover:text-green-900"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "profil" && (
            <div className="reveal space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <Settings size={18} /> Informations personnelles
                  </h2>
                  {!editing && (
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div className={`p-3 rounded-lg text-sm mb-4 ${saveMsg.includes("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {saveMsg}
                  </div>
                )}

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Prénom</p>
                        <p className="text-sm font-bold text-green-900 capitalize px-3 py-2.5 bg-gray-50 rounded-lg">{profile.prenom}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Nom</p>
                        <p className="text-sm font-bold text-green-900 capitalize px-3 py-2.5 bg-gray-50 rounded-lg">{profile.nom}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                        <p className="text-sm font-bold text-green-900 px-3 py-2.5 bg-gray-50 rounded-lg">{profile.email}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Téléphone</label>
                        <input
                          type="tel"
                          value={editForm.telephone}
                          onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                          placeholder="06 XX XX XX XX"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Classement FFT</label>
                        <input
                          type="text"
                          value={editForm.classement_fft}
                          onChange={(e) => setEditForm({ ...editForm, classement_fft: e.target.value })}
                          placeholder="ex: 30/2"
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Niveau</label>
                        <select
                          value={editForm.niveau}
                          onChange={(e) => setEditForm({ ...editForm, niveau: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                        >
                          <option value="">Non renseigné</option>
                          {niveaux.map((n) => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors text-sm disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Enregistrer
                      </button>
                      <button
                        onClick={() => { setEditing(false); setSaveMsg(null); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold bg-gray-100 text-green-900 hover:bg-gray-200 transition-colors text-sm"
                      >
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Prénom", value: profile.prenom },
                      { label: "Nom", value: profile.nom },
                      { label: "Email", value: profile.email },
                      { label: "Téléphone", value: profile.telephone ?? "Non renseigné" },
                      { label: "Classement FFT", value: profile.classement_fft ?? "Non classé" },
                      { label: "Niveau", value: profile.niveau ?? "Non renseigné" },
                      { label: "Rôle", value: profile.role },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs font-bold text-muted-foreground uppercase">{item.label}</p>
                        <p className="text-sm font-bold text-green-900 capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Adhésion</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${adhesionActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {adhesionActive ? "Active" : "Inactive"}
                    </span>
                    {profile.adhesion_expire && (
                      <span className="text-xs text-muted-foreground">
                        (expire le {new Date(profile.adhesion_expire).toLocaleDateString("fr-FR")})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reservations" && (
            <div className="reveal space-y-3">
              {reservations.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Aucune réservation.</p>
              ) : (
                reservations.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-xl p-4 shadow-sm flex items-center justify-between ${
                      r.statut === "cancelled" ? "opacity-50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-bold text-green-900">{r.terrains?.nom ?? "Terrain"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("fr-FR", {
                          weekday: "long", day: "numeric", month: "long",
                        })} · {r.heure_debut.slice(0, 5)} – {r.heure_fin.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.statut === "confirmed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {r.statut === "confirmed" ? "Confirmée" : "Annulée"}
                      </span>
                      {canCancel(r) && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === r.id ? <Loader2 size={12} className="animate-spin" /> : "Annuler"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "enfants" && (
            <div className="reveal space-y-3">
              {enfants.length === 0 ? (
                <div className="text-center py-10">
                  <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun profil enfant.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fonctionnalité disponible prochainement.
                  </p>
                </div>
              ) : (
                enfants.map((e) => (
                  <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center font-bold text-green-600">
                      {e.prenom?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-green-900">{e.prenom} {e.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.niveau ?? "Niveau non renseigné"}
                        {e.date_naissance && <> · Né(e) le {new Date(e.date_naissance).toLocaleDateString("fr-FR")}</>}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
