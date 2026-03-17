"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

type News = {
  id: string;
  titre: string;
  categorie: string;
  image_url: string | null;
  texte: string | null;
  cta_label: string | null;
  cta_url: string | null;
  date_publication: string;
};

const categorieBadge: Record<string, { bg: string; text: string; label: string }> = {
  soiree: { bg: "bg-[#f6ca73]", text: "text-green-900", label: "Soirée" },
  stage: { bg: "bg-green-500", text: "text-white", label: "Stage" },
  tournoi: { bg: "bg-green-600", text: "text-white", label: "Tournoi" },
  club: { bg: "bg-green-800", text: "text-white", label: "Club" },
};

const defaultCategories = [
  { value: "all", label: "Toutes" },
  { value: "club", label: "Club" },
  { value: "tournoi", label: "Tournoi" },
  { value: "soiree", label: "Soirée" },
  { value: "stage", label: "Stage" },
];

export function ActualitesClient({ news }: { news: News[] }) {
  useReveal();
  const [filter, setFilter] = useState("all");

  // Build categories dynamically from news data
  const extraCats = Array.from(new Set(news.map((n) => n.categorie)))
    .filter((c) => !defaultCategories.some((d) => d.value === c))
    .map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
  const categories = [...defaultCategories, ...extraCats];

  const filtered = filter === "all" ? news : news.filter((n) => n.categorie === filter);

  return (
    <>
      {/* HERO */}
      <section className="bg-green-900 text-white py-14 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#f6ca73] font-medium tracking-widest uppercase text-sm mb-3 reveal">
            Restez inform&eacute;s
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold reveal d1">
            Actualit&eacute;s du club
          </h1>
          <p className="mt-4 text-white/70 max-w-lg mx-auto reveal d2">
            Retrouvez toutes les nouvelles du Tennis Club Halluin : tournois, stages, soir&eacute;es et vie du club.
          </p>
        </div>
      </section>

      {/* FILTRES + LISTE */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-10 reveal">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === cat.value
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-900 border border-gray-200 hover:border-green-600 hover:text-green-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grille */}
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Aucune actualit&eacute; dans cette cat&eacute;gorie.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, i) => {
                const badge = categorieBadge[item.categorie] ?? categorieBadge.club;
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100 animate-fade-in"
                    style={{ animationDelay: `${(i % 3) * 100}ms` }}
                  >
                    {item.image_url && (
                      <div className="relative h-48 sm:h-52 overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text} rounded-full`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    )}
                    {!item.image_url && (
                      <div className="px-6 pt-5">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text} rounded-full`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(item.date_publication).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="text-lg font-bold text-green-900 leading-snug">
                        {item.titre}
                      </h3>
                      {item.texte && (
                        <div
                          className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.texte }}
                        />
                      )}
                      {item.cta_label && item.cta_url && (
                        <Link
                          href={item.cta_url}
                          className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
                        >
                          {item.cta_label}
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
