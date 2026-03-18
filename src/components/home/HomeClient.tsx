"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { Trophy, Minus, X, ArrowRight } from "lucide-react";
import { parseImageUrls } from "@/lib/utils";
import { NewsCarousel } from "@/components/ui/NewsCarousel";

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
  soiree: { bg: "bg-[#f6ca73]", text: "text-green-900" },
  stage: { bg: "bg-green-500", text: "text-white" },
  tournoi: { bg: "bg-green-600", text: "text-white" },
  club: { bg: "bg-green-800", text: "text-white" },
};

const resultatStyle: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  win: { icon: <Trophy size={16} />, color: "text-green-600", label: "Victoire" },
  loss: { icon: <X size={16} />, color: "text-red-500", label: "Défaite" },
  draw: { icon: <Minus size={16} />, color: "text-[#f6ca73]", label: "Nul" },
};

export function HomeClient({ news, resultats, ticker, sponsors, terrains }: Props) {
  useReveal();

  return (
    <>
      {/* TICKER */}
      {ticker.length > 0 && (
        <div className="bg-green-600 text-white overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap animate-ticker" style={{ width: "max-content" }}>
            {[...ticker, ...ticker, ...ticker, ...ticker].map((item, i) => (
              <span key={i} className="inline-block px-8 py-1 text-[11px] font-medium tracking-wide">
                {item.texte}
                <span className="ml-6 text-[#f6ca73]">&bull;</span>
              </span>
            ))}
          </div>
          <style jsx>{`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-ticker {
              animation: ticker 15s linear infinite;
            }
            @media (min-width: 768px) {
              .animate-ticker {
                animation: ticker 30s linear infinite;
              }
            }
          `}</style>
        </div>
      )}

      {/* HERO */}
      <section className="relative bg-green-900 text-white overflow-hidden min-h-[calc(100svh-64px)] sm:min-h-0 flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/assets/photos/club/hero-indoor-new.jpeg"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-green-900/60" />
        </div>
        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Texte */}
            <div className="text-center lg:text-left">
              <p className="text-[#f6ca73] font-medium tracking-widest uppercase text-sm mb-4 reveal">
                Depuis 1927
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] reveal d1">
                Tennis Club
                <br />
                <span className="text-[#f6ca73]">Halluin</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg mx-auto lg:mx-0 reveal d2">
                6 terrains, une communaut&eacute; passionn&eacute;e.
                <br />
                R&eacute;servez votre terrain en quelques clics.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start reveal d3">
                <Link
                  href="/reservation"
                  className="px-7 py-3.5 rounded-full font-semibold bg-[#f6ca73] text-green-900 hover:bg-[#f5c060] btn-primary transition-colors text-sm"
                >
                  R&eacute;server un terrain
                </Link>
                <Link
                  href="/le-club"
                  className="px-7 py-3.5 rounded-full font-semibold text-white hover:bg-white/10 transition-colors border border-white/30 text-sm"
                >
                  D&eacute;couvrir le club
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/40 tracking-wider uppercase reveal d4">
                Indoor &bull; Outdoor &bull; Comp&eacute;titions &bull; Stages
              </p>
            </div>

            {/* Photo — hidden on mobile */}
            <div className="hidden lg:block reveal d2">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl">
                <Image
                  src="/assets/photos/club/hero-indoor-new.jpeg"
                  alt="Courts du Tennis Club Halluin"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      {news.length > 0 && (
        <section className="pt-12 pb-12 sm:pt-14 sm:pb-14">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <div className="text-center reveal">
              <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-2">
                Restez inform&eacute;s
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900">
                Actualit&eacute;s du club
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Les derni&egrave;res nouvelles du Tennis Club Halluin
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {news.slice(0, 4).map((item, i) => {
                const badge = categorieBadge[item.categorie] ?? categorieBadge.club;
                return (
                  <Link
                    key={item.id}
                    href="/actualites"
                    className={`reveal d${Math.min(i + 1, 4)} group bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100 block`}
                  >
                    {item.image_url && (() => {
                      const images = parseImageUrls(item.image_url);
                      return images.length > 0 ? (
                        <NewsCarousel images={images} alt={item.titre} className="h-52 sm:h-60">
                          <span
                            className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text} rounded-full capitalize z-10`}
                          >
                            {item.categorie}
                          </span>
                        </NewsCarousel>
                      ) : null;
                    })()}
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
                        <span className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-bold bg-green-600 text-white group-hover:bg-green-800 transition-colors">
                          {item.cta_label}
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-10 text-center reveal d4">
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
              >
                Voir toutes les actualit&eacute;s
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RÉSULTATS */}
      {resultats.length > 0 && (
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <div className="text-center reveal">
              <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-2">
                Comp&eacute;titions
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900">
                Derniers r&eacute;sultats
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Les performances r&eacute;centes de nos &eacute;quipes
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resultats.map((r, i) => {
                const style = resultatStyle[r.resultat] ?? resultatStyle.draw;
                return (
                  <div
                    key={r.id}
                    className={`reveal d${Math.min(i + 1, 4)} bg-[#f7f5f0] rounded-2xl p-5 card-hover border border-gray-100`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {r.competition}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${style.color}`}>
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
                        <span className="mx-1.5 text-muted-foreground">-</span>
                        <span className="text-2xl font-bold text-muted-foreground">
                          {r.score_adv}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
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
            <div className="text-center mt-10 reveal">
              <Link
                href="/resultats"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors text-sm"
              >
                Tous les r&eacute;sultats
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TERRAINS */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          <div className="text-center reveal">
            <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-2">
              Nos infrastructures
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-green-900">
              Nos installations
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              6 terrains indoor &amp; outdoor &agrave; votre disposition
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {terrains.map((court, i) => (
              <div
                key={court.id}
                className={`reveal d${Math.min(i + 1, 4)} bg-white rounded-2xl p-6 card-hover shadow-sm border border-gray-100`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-green-900">{court.nom}</h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      court.type === "indoor"
                        ? "bg-green-600/10 text-green-600"
                        : "bg-[#f6ca73]/30 text-green-900"
                    }`}
                  >
                    {court.type === "indoor" ? "Indoor" : "Outdoor"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {court.surface}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 reveal">
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors text-sm"
            >
              R&eacute;server un terrain
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8 reveal">
              Nos partenaires
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 reveal d1">
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
                      className="h-10 w-auto opacity-50 hover:opacity-100 transition-opacity duration-300"
                    />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300 px-4 py-2">
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
      <section className="relative py-24 sm:py-32 bg-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/assets/photos/club/hero-indoor-new.jpeg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 text-center">
          <div className="max-w-2xl mx-auto reveal">
            <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-3">
              Rejoignez-nous
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Rejoignez le <span className="text-[#f6ca73]">TCH</span>
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
              Depuis 1927, le Tennis Club Halluin rassemble des passionn&eacute;s de
              tous niveaux. Venez nous rencontrer !
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="px-7 py-3.5 rounded-full font-semibold bg-[#f6ca73] text-green-900 hover:bg-[#f5c060] btn-primary transition-colors text-sm"
              >
                Nous contacter
              </Link>
              <Link
                href="/connexion"
                className="px-7 py-3.5 rounded-full font-semibold text-white hover:bg-white/10 transition-colors border border-white/30 text-sm"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
