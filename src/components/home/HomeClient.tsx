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

type SetScore = { tch: number; adv: number };

type Resultat = {
  id: string;
  type: string;
  categorie?: "interclub" | "tournoi" | "amical";
  equipe_tch: string;
  equipe_adversaire: string;
  score_tch: number;
  score_adv: number;
  resultat: "win" | "loss" | "draw";
  date: string;
  competition: string;
  sets?: SetScore[] | null;
  image_url?: string | null;
};

type Ticker = { id: string; texte: string };

type Props = {
  news: News[];
  resultats: Resultat[];
  ticker: Ticker[];
};

const categorieBadge: Record<string, { bg: string; text: string }> = {
  soiree: { bg: "bg-[#f6ca73]", text: "text-green-900" },
  stage: { bg: "bg-green-500", text: "text-white" },
  tournoi: { bg: "bg-green-600", text: "text-white" },
  club: { bg: "bg-green-800", text: "text-white" },
};

const resultatStyle: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string; scoreColor: string }> = {
  win: { icon: <Trophy size={12} />, bg: "bg-green-500", text: "text-white", label: "Victoire", scoreColor: "text-green-400" },
  loss: { icon: <X size={12} />, bg: "bg-red-500", text: "text-white", label: "Défaite", scoreColor: "text-red-400" },
  draw: { icon: <Minus size={12} />, bg: "bg-[#f6ca73]", text: "text-green-900", label: "Nul", scoreColor: "text-[#f6ca73]" },
};

function ResultatsSection({ resultats }: { resultats: Resultat[] }) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="pt-12 pb-12 sm:pt-14 sm:pb-14 bg-green-900 text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="text-center reveal">
          <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-2">Compétitions</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Derniers résultats</h2>
          <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">Les performances récentes de nos équipes</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resultats.map((r, i) => {
            const style = resultatStyle[r.resultat] ?? resultatStyle.draw;
            return (
              <div key={r.id} className={`reveal d${Math.min(i + 1, 4)} relative rounded-2xl overflow-hidden group h-52`}>
                {r.image_url ? (
                  <Image src={r.image_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-green-800" />
                )}
                <div className="absolute inset-0 bg-black/70" />
                <div className="relative h-full flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">{r.competition}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-bold text-[#f6ca73]">{r.equipe_tch}</p>
                      <p className="text-sm text-white/70">{r.equipe_adversaire}</p>
                      <p className="text-[11px] text-white/50 mt-1">{formatDate(r.date)}</p>
                    </div>
                    <div>
                      {r.sets && r.sets.length > 0 ? (
                        <div className="flex items-center gap-2">
                          {r.sets.map((s, si) => (
                            <span key={si} className="text-2xl sm:text-3xl font-black">
                              <span className={s.tch >= s.adv ? style.scoreColor : "text-white/40"}>{s.tch}</span>
                              <span className="text-white/30">-</span>
                              <span className={s.adv >= s.tch ? style.scoreColor : "text-white/40"}>{s.adv}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className={`text-3xl sm:text-4xl font-black ${style.scoreColor}`}>{r.score_tch}</span>
                          <span className="mx-2 text-lg text-white/40">:</span>
                          <span className="text-3xl sm:text-4xl font-black text-white/50">{r.score_adv}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 reveal">
          <Link href="/resultats" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold bg-[#f6ca73] text-green-900 hover:bg-[#f5c060] transition-colors text-sm">
            Tous les résultats <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeClient({ news, resultats, ticker }: Props) {
  useReveal();

  return (
    <>
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
              <div className="relative rounded-lg overflow-hidden aspect-[16/10] shadow-2xl">
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
        <div className="absolute bottom-6 left-0 right-0 flex justify-center reveal d4">
          <button
            onClick={() => document.getElementById("content")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors text-xs tracking-widest uppercase"
          >
            D&eacute;couvrir
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </section>

      <div id="content" />

      {/* TICKER */}
      {ticker.length > 0 && (
        <div className="bg-green-600 text-white overflow-hidden">
          <div className="ticker-track flex whitespace-nowrap animate-ticker" style={{ width: "max-content" }}>
            {Array.from({ length: 10 }, () => ticker).flat().map((item, i) => (
              <span key={i} className="inline-block px-8 py-1 text-[11px] font-medium tracking-wide leading-normal">
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
              animation: ticker 40s linear infinite;
            }
            @media (min-width: 768px) {
              .animate-ticker {
                animation: ticker 60s linear infinite;
              }
            }
          `}</style>
        </div>
      )}

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
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* FEATURED — première news, grande card à gauche */}
              {news[0] && (() => {
                const featured = news[0];
                const badge = categorieBadge[featured.categorie] ?? categorieBadge.club;
                const images = featured.image_url ? parseImageUrls(featured.image_url) : [];
                return (
                  <Link
                    key={featured.id}
                    href="/actualites"
                    className="reveal d1 group bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100 block lg:col-span-3 lg:row-span-2"
                  >
                    {images.length > 0 && (
                      <NewsCarousel images={images} alt={featured.titre} className="h-56 sm:h-64 lg:h-[340px]">
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold ${badge.bg} ${badge.text} rounded-full capitalize z-10`}
                        >
                          {featured.categorie}
                        </span>
                      </NewsCarousel>
                    )}
                    <div className="p-5 sm:p-6">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {new Date(featured.date_publication).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold text-green-600 leading-snug">
                        {featured.titre}
                      </h3>
                      {featured.texte && (
                        <div
                          className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: featured.texte }}
                        />
                      )}
                      <span className="inline-flex items-center mt-4 text-xs font-bold text-green-900 uppercase tracking-widest group-hover:underline">
                        {featured.cta_label || "Lire la suite"}&ensp;<ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })()}

              {/* SECONDARY — 2 petites cards empilées à droite */}
              {news.slice(1, 3).map((item, i) => {
                const badge = categorieBadge[item.categorie] ?? categorieBadge.club;
                const images = item.image_url ? parseImageUrls(item.image_url) : [];
                return (
                  <Link
                    key={item.id}
                    href="/actualites"
                    className={`reveal d${i + 2} group bg-white rounded-2xl overflow-hidden shadow-sm card-hover border border-gray-100 block lg:col-span-2`}
                  >
                    {images.length > 0 && (
                      <div className="relative h-32 sm:h-36 overflow-hidden">
                        <Image
                          src={images[0]}
                          alt={item.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text} rounded-full capitalize z-10`}
                        >
                          {item.categorie}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {new Date(item.date_publication).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="text-sm font-bold text-green-600 leading-snug line-clamp-2">
                        {item.titre}
                      </h3>
                      {item.texte && (
                        <div
                          className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.texte }}
                        />
                      )}
                      <span className="inline-flex items-center mt-3 text-[11px] font-bold text-green-900 uppercase tracking-widest group-hover:underline">
                        En savoir plus&ensp;<ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-10 text-center reveal d4">
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm bg-[#f6ca73] text-green-900 hover:bg-[#f5c060] transition-colors"
              >
                Voir toutes les actualit&eacute;s
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RÉSULTATS */}
      {resultats.length > 0 && <ResultatsSection resultats={resultats} />}


      {/* SPONSORS */}
      {(() => {
        const logos = [
          { src: "/assets/partenaires/script-colors.png", alt: "Script Colors" },
          { src: "/assets/partenaires/schelfhout.png", alt: "Schelfhout" },
          { src: "/assets/partenaires/cavevents.png", alt: "La Cav'events" },
          { src: "/assets/partenaires/lys-vision.png", alt: "Lys Vision" },
          { src: "/assets/partenaires/halluin.png", alt: "Ville d'Halluin" },
          { src: "/assets/partenaires/atelier-compote.png", alt: "Atelier Compote" },
        ];
        return (
        <section className="pt-12 pb-6 sm:pt-14 sm:pb-8">
          <div className="text-center mb-8">
            <p className="text-[#f6ca73] font-semibold tracking-widest uppercase text-xs mb-2">
              Ils nous soutiennent
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              Nos partenaires
            </h2>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex animate-sponsors whitespace-nowrap">
              {Array.from({ length: 4 }, () => logos).flat().map((l, i) => (
                <div
                  key={`${l.alt}-${i}`}
                  className="flex-shrink-0 flex items-center justify-center mx-12 sm:mx-20"
                >
                  <Image
                    src={l.src}
                    alt={l.alt}
                    width={160}
                    height={64}
                    className="h-14 sm:h-16 w-auto"
                  />
                </div>
              ))}
            </div>
          </div>
          <style jsx>{`
            @keyframes sponsors-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-sponsors {
              animation: sponsors-scroll 30s linear infinite;
            }
          `}</style>
        </section>
        );
      })()}

    </>
  );
}
