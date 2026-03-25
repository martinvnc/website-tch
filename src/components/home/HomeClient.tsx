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

const resultatStyle: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  win: { icon: <Trophy size={16} />, color: "text-green-600", label: "Victoire" },
  loss: { icon: <X size={16} />, color: "text-red-500", label: "Défaite" },
  draw: { icon: <Minus size={16} />, color: "text-[#f6ca73]", label: "Nul" },
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {resultats.map((r, i) => {
            const style = resultatStyle[r.resultat] ?? resultatStyle.draw;
            return (
              <div key={r.id} className={`reveal d${Math.min(i + 1, 4)} relative rounded-2xl overflow-hidden group h-52`}>
                {r.image_url ? (
                  <Image src={r.image_url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-green-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="relative h-full flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">{r.competition}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${style.color}`}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-bold text-white">{r.equipe_tch}</p>
                      <p className="text-sm text-white/50">{r.equipe_adversaire}</p>
                      <p className="text-[11px] text-white/30 mt-1">{formatDate(r.date)}</p>
                    </div>
                    <div className="text-white">
                      {r.sets && r.sets.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {r.sets.map((s, si) => (
                            <span key={si} className="text-lg font-bold">{s.tch}-{s.adv}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-3xl sm:text-4xl font-black">{r.score_tch}</span>
                          <span className="mx-2 text-lg opacity-40">:</span>
                          <span className="text-3xl sm:text-4xl font-black opacity-40">{r.score_adv}</span>
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
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {news.slice(0, 4).map((item, i) => {
                const badge = categorieBadge[item.categorie] ?? categorieBadge.club;
                return (
                  <Link
                    key={item.id}
                    href="/actualites"
                    className={`reveal d${Math.min(i + 1, 4)} group bg-white rounded-lg overflow-hidden shadow-sm card-hover border border-gray-100 block`}
                  >
                    {item.image_url && (() => {
                      const images = parseImageUrls(item.image_url);
                      return images.length > 0 ? (
                        <NewsCarousel images={images} alt={item.titre} className="h-40 sm:h-44">
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text} rounded-full capitalize z-10`}
                          >
                            {item.categorie}
                          </span>
                        </NewsCarousel>
                      ) : null;
                    })()}
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(item.date_publication).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="text-sm font-bold text-green-900 leading-snug line-clamp-2">
                        {item.titre}
                      </h3>
                      {item.texte && (
                        <div
                          className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.texte }}
                        />
                      )}
                      {item.cta_label && item.cta_url && (
                        <span className="inline-flex items-center mt-3 px-3 py-1.5 rounded-full text-xs font-bold bg-green-600 text-white group-hover:bg-green-800 transition-colors">
                          {item.cta_label}
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
        <section className="py-12 sm:py-14">
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
