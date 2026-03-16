"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { Trophy, Minus, X, Filter } from "lucide-react";

type Resultat = {
  id: string;
  type: string;
  equipe_tch: string;
  equipe_adversaire: string;
  score_tch: number;
  score_adv: number;
  resultat: "win" | "loss" | "draw";
  date: string;
  competition: string;
};

const resultatStyle: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  win: { icon: <Trophy size={16} />, color: "text-green-600", bg: "bg-green-50", label: "Victoire" },
  loss: { icon: <X size={16} />, color: "text-red-500", bg: "bg-red-50", label: "Défaite" },
  draw: { icon: <Minus size={16} />, color: "text-yellow-600", bg: "bg-yellow-50", label: "Nul" },
};

export function ResultatsClient({ resultats }: { resultats: Resultat[] }) {
  useReveal();
  const [filter, setFilter] = useState<"all" | "win" | "loss" | "draw">("all");

  const types = Array.from(new Set(resultats.map((r) => r.type)));
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = resultats.filter((r) => {
    if (filter !== "all" && r.resultat !== filter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  return (
    <>
      {/* HERO */}
      <section className="bg-green-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl">
            <span className="text-yellow-400">Résultats</span>
          </h1>
          <p className="mt-3 text-white/80">
            Tous les résultats des matchs du TCH
          </p>
        </div>
      </section>

      {/* FILTERS + RESULTS */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="reveal flex flex-wrap items-center gap-3 mb-8">
            <Filter size={16} className="text-muted-foreground" />
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === "all" ? "bg-green-600 text-white" : "bg-white text-green-900 hover:bg-green-600/10"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter("win")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === "win" ? "bg-green-600 text-white" : "bg-white text-green-900 hover:bg-green-600/10"
              }`}
            >
              Victoires
            </button>
            <button
              onClick={() => setFilter("draw")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === "draw" ? "bg-yellow-400 text-green-900" : "bg-white text-green-900 hover:bg-yellow-400/20"
              }`}
            >
              Nuls
            </button>
            <button
              onClick={() => setFilter("loss")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filter === "loss" ? "bg-red-500 text-white" : "bg-white text-green-900 hover:bg-red-50"
              }`}
            >
              Défaites
            </button>

            {types.length > 1 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                <option value="all">Toutes compétitions</option>
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {/* Stats summary */}
          <div className="reveal d1 grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Victoires", count: resultats.filter((r) => r.resultat === "win").length, color: "text-green-600" },
              { label: "Nuls", count: resultats.filter((r) => r.resultat === "draw").length, color: "text-yellow-600" },
              { label: "Défaites", count: resultats.filter((r) => r.resultat === "loss").length, color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Results list */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                Aucun résultat avec ces filtres.
              </p>
            )}
            {filtered.map((r, i) => {
              const style = resultatStyle[r.resultat] ?? resultatStyle.draw;
              return (
                <div
                  key={r.id}
                  className={`reveal d${Math.min(i + 1, 4)} ${style.bg} rounded-xl p-4 card-hover flex items-center justify-between gap-4`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-xs font-bold ${style.color}`}>
                        {style.icon} {style.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.competition}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-green-900">{r.equipe_tch}</span>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span className="text-sm text-muted-foreground">{r.equipe_adversaire}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-3xl font-bold text-green-900">
                      {r.score_tch}
                    </span>
                    <span className="mx-1 text-lg text-muted-foreground">-</span>
                    <span className="text-3xl font-bold text-muted-foreground">
                      {r.score_adv}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
