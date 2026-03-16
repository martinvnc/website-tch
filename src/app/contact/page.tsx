"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const objets = [
  { value: "information", label: "Demande d'information" },
  { value: "adhesion", label: "Adhésion" },
  { value: "reservation", label: "Réservation" },
  { value: "cours", label: "Cours & stages" },
  { value: "tournois", label: "Tournois" },
  { value: "partenariat", label: "Partenariat" },
  { value: "autre", label: "Autre" },
];

export default function ContactPage() {
  useReveal();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      prenom: form.get("prenom") as string,
      nom: form.get("nom") as string,
      email: form.get("email") as string,
      telephone: form.get("telephone") as string,
      objet: form.get("objet") as string,
      message: form.get("message") as string,
      numero: `TCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    };

    const supabase = createClient();
    const { error: dbError } = await supabase.from("contact_tickets").insert(data);

    if (dbError) {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-green-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl">
            <span className="text-yellow-400">Contact</span>
          </h1>
          <p className="mt-3 text-white/80">
            Une question ? Contactez le Tennis Club Halluin
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Infos contact */}
            <div className="lg:col-span-2 space-y-5 reveal">
              <h2 className="text-2xl font-extrabold text-green-600">
                Nos coordonnées
              </h2>
              {[
                { icon: <MapPin size={20} />, label: "Adresse", value: "341 rue de la Lys, 59250 Halluin" },
                { icon: <Mail size={20} />, label: "Email", value: "contact@tch.fr" },
                { icon: <Phone size={20} />, label: "Téléphone", value: "Voir nos réseaux sociaux" },
                { icon: <Clock size={20} />, label: "Horaires", value: "Sem. 9h–22h · Week-end 9h–20h" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="text-green-600 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-green-900">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-3 reveal d2">
              {success ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900">
                    Message envoyé !
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nous reviendrons vers vous dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-green-900 mb-1">Prénom</label>
                      <input type="text" name="prenom" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-green-900 mb-1">Nom</label>
                      <input type="text" name="nom" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Téléphone <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                    <input type="tel" name="telephone" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Objet</label>
                    <select name="objet" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors bg-white">
                      <option value="">Choisir un objet...</option>
                      {objets.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Message</label>
                    <textarea name="message" required rows={5} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors resize-none" />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    En envoyant ce message, vous acceptez notre{" "}
                    <Link href="/confidentialite" className="underline text-green-600">
                      politique de confidentialité
                    </Link>.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
