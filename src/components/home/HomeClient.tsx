"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { Trophy, Minus, X } from "lucide-react";

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

type Terrain = {
  id: string;
  nom: string;
  surface: string;
  type: "indoor" | "outdoor";
};

type Ticker = { id: string; texte: string };
type Sponsor = { id: string; nom: string; logo_url: string | null; site_url: string | null };

type Props = {
  news: News[];
  resultats: Resultat[];
  ticker: Ticker[];
  sponsors: Sponsor[];
  terrains: Terrain[];
};

const categorieBadge: Record<string, { bg: string; text: string }> = {
  soiree: { bg: "bg-yellow-400", text: "text-green-900" },
  stage: { bg: "bg-green-500", text: "text-white" },
  tournoi: { bg: "bg-green-600", text: "text-white" },
  club: { bg: "bg-green-800", text: "text-white" },
};

const resultatStyle: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  win: { icon: <Trophy size={16} />, color: "text-green-600", label: "Victoire" },
  loss: { icon: <X size={16} />, color: "text-red-500", label: "Défaite" },
  draw: { icon: <Minus size={16} />, color: "text-yellow-600", label: "Nul" },
};

export function HomeClient({ news, resultats, ticker, sponsors, terrains }: Props) {
  useReveal();

  return (
    <>
      {/* TICKER */}
      {ticker.length > 0 && (
        <div className="bg-green-600 text-white overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap animate-ticker">
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} className="inline-block px-8 py-1 text-xs font-bold">
                {item.texte}
                <span className="mx-4 text-yellow-400">•</span>
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-ticker {
              animation: ticker 30s linear infinite;
            }
          `}</style>
        </div>
      )}

      {/* HERO */}
      <section className="relative bg-green-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/photos/club/hero-indoor-new.jpeg"
            alt="Courts du Tennis Club Halluin"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Tennis Club
              <br />
              <span className="text-yellow-400">Halluin</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80">
              Depuis 1927 — 6 terrains, une communauté passionnée.
              <br />
              Réservez votre terrain en quelques clics.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/reservation"
                className="px-6 py-3 rounded-lg font-extrabold bg-yellow-400 text-green-900 hover:bg-yellow-300 btn-primary transition-colors"
              >
                Réserver un terrain
              </Link>
              <Link
                href="/le-club"
                className="px-6 py-3 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                Découvrir le club
              </Link>
            </div>

            {/* Stat chips */}
            <div className="mt-10 flex flex-wrap gap-3">
              {[
                { value: "97 ans", label: "Années d'histoire" },
                { value: "273", label: "Licenciés" },
                { value: "6", label: "Terrains" },
                { value: "14", label: "Événements / an" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`reveal d${i + 1} bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5`}
                >
                  <span className="text-lg font-extrabold text-yellow-400">{stat.value}</span>
                  <span className="ml-2 text-xs text-white/70">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      {news.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-600">
                Actualités du club
              </h2>
              <p className="mt-2 text-muted-foreground">
                Les dernières nouvelles du TCH
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item, i) => {
                const badge = categorieBadge[item.categorie] ?? categorieBadge.club;
                return (
                  <div
                    key={item.id}
                    className={`reveal d${Math.min(i + 1, 4)} bg-white rounded-2xl overflow-hidden shadow-sm card-hover`}
                  >
                    {item.image_url && (
                      <div className="relative h-48 sm:h-56">
                        <Image
                          src={item.image_url}
                          alt={item.titre}
                          fill
                          className="object-cover"
                        />
                        <span
                          className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold ${badge.bg} ${badge.text} rounded-full capitalize`}
                        >
                          {item.categorie}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-green-900">
                        {item.titre}
                      </h3>
                      {item.texte && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {item.texte}
                        </p>
                      )}
                      {item.cta_label && item.cta_url && (
                        <Link
                          href={item.cta_url}
                          className="inline-block mt-3 text-sm font-bold text-green-600 hover:text-green-800 transition-colors"
                        >
                          {item.cta_label} &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* RÉSULTATS */}
      {resultats.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-600">
                Derniers résultats
              </h2>
              <p className="mt-2 text-muted-foreground">
                Les performances récentes du TCH
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resultats.map((r, i) => {
                const style = resultatStyle[r.resultat] ?? resultatStyle.draw;
                return (
                  <div
                    key={r.id}
                    className={`reveal d${Math.min(i + 1, 4)} bg-off-white rounded-xl p-4 card-hover`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {r.competition}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${style.color}`}>
                        {style.icon} {style.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-green-900">{r.equipe_tch}</p>
                        <p className="text-sm text-muted-foreground">
                          {r.equipe_adversaire}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-900">
                          {r.score_tch}
                        </span>
                        <span className="mx-1 text-muted-foreground">-</span>
                        <span className="text-2xl font-bold text-muted-foreground">
                          {r.score_adv}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8 reveal">
              <Link
                href="/resultats"
                className="inline-block px-6 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors"
              >
                Tous les résultats
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TERRAINS */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600">
              Nos installations
            </h2>
            <p className="mt-2 text-muted-foreground">
              6 terrains indoor &amp; outdoor à votre disposition
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {terrains.map((court, i) => (
              <div
                key={court.id}
                className={`reveal d${Math.min(i + 1, 4)} bg-white rounded-xl p-5 card-hover shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-green-900">{court.nom}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      court.type === "indoor"
                        ? "bg-green-600/10 text-green-600"
                        : "bg-yellow-400/30 text-yellow-700"
                    }`}
                  >
                    {court.type === "indoor" ? "Indoor" : "Outdoor"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {court.surface}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 reveal">
            <Link
              href="/reservation"
              className="inline-block px-6 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors"
            >
              Réserver un terrain
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="py-12 bg-white border-t border-b">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 reveal">
              Nos partenaires
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 reveal d1">
              {sponsors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-center"
                >
                  {s.logo_url ? (
                    <Image
                      src={s.logo_url}
                      alt={s.nom}
                      width={120}
                      height={48}
                      className="h-10 w-auto opacity-60 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors px-4 py-2">
                      {s.nom}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-green-900 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Rejoignez le <span className="text-yellow-400">TCH</span>
          </h2>
          <p className="mt-3 text-lg text-white/80 max-w-xl mx-auto">
            Depuis 1927, le Tennis Club Halluin rassemble des passionnés de
            tous niveaux. Venez nous rencontrer !
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-lg font-extrabold bg-yellow-400 text-green-900 hover:bg-yellow-300 btn-primary transition-colors"
            >
              Nous contacter
            </Link>
            <Link
              href="/connexion"
              className="px-6 py-3 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
