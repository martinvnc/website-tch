"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { MapPin, Clock, Award } from "lucide-react";

type Timeline = { id: string; annee: number; titre: string; description: string | null };
type Comite = { id: string; prenom: string; nom: string; role: string; photo_url: string | null };
type Terrain = { id: string; nom: string; surface: string; type: "indoor" | "outdoor" };
type Sponsor = { id: string; nom: string; logo_url: string | null };
type GaleriePhoto = { id: string; image_url: string; caption: string | null };

type Props = {
  timeline: Timeline[];
  comite: Comite[];
  terrains: Terrain[];
  sponsors: Sponsor[];
  galerie: GaleriePhoto[];
};

export function LeClubClient({ timeline, comite, terrains, sponsors, galerie }: Props) {
  useReveal();

  return (
    <>
      {/* HERO */}
      <section className="relative bg-green-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/photos/club/hero-indoor-new.jpeg"
            alt="Courts du TCH"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-20 sm:py-28 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl">
            Le <span className="text-yellow-400">Club</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Depuis 1927, le Tennis Club Halluin fait vibrer les passionnés de
            tennis à Halluin et ses environs.
          </p>
        </div>
      </section>

      {/* INFOS RAPIDES */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <MapPin size={24} />, title: "Adresse", desc: "341 rue de la Lys, 59250 Halluin" },
              { icon: <Clock size={24} />, title: "Horaires", desc: "Sem. 9h–22h · Week-end 9h–20h" },
              { icon: <Award size={24} />, title: "Label", desc: "École de Tennis FFT" },
            ].map((item, i) => (
              <div key={i} className={`reveal d${i + 1} flex items-start gap-4 p-5 rounded-xl bg-off-white`}>
                <div className="text-green-600 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-green-900">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÉSENTATION */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="reveal">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-600">
                Notre histoire
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Fondé en 1927, le Tennis Club Halluin est l&apos;un des plus anciens clubs
                de tennis des Hauts-de-France. Avec ses 6 terrains (3 indoor, 3 outdoor),
                son école de tennis labellisée FFT et une communauté de passionnés,
                le TCH est le lieu incontournable du tennis à Halluin.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Que vous soyez débutant ou compétiteur, jeune ou vétéran,
                notre club vous accueille dans une ambiance conviviale et sportive.
              </p>
            </div>
            <div className="reveal d2 relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/assets/photos/club/IMG_6488 (1).JPEG"
                alt="Tennis Club Halluin"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      {timeline.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600 text-center reveal">
              Notre parcours
            </h2>
            <div className="mt-10 relative">
              {/* Vertical line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-yellow-400 sm:-translate-x-0.5" />

              {timeline.map((item, i) => (
                <div
                  key={item.id}
                  className={`reveal d${Math.min(i + 1, 4)} relative flex items-start mb-8 sm:mb-10 ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-yellow-400 rounded-full -translate-x-1 sm:-translate-x-1.5 mt-1.5 z-10 ring-4 ring-white" />

                  {/* Content */}
                  <div className={`ml-10 sm:ml-0 sm:w-5/12 ${i % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:pl-10"}`}>
                    <span className="text-2xl font-bold text-yellow-500">
                      {item.annee}
                    </span>
                    <h3 className="font-bold text-green-900 mt-1">{item.titre}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TERRAINS */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-green-600 text-center reveal">
            Nos terrains
          </h2>
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
                <p className="mt-1 text-sm text-muted-foreground">{court.surface}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMITÉ */}
      {comite.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600 text-center reveal">
              Le comité directeur
            </h2>

            {/* Photo de groupe */}
            <div className="mt-8 reveal d1 relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg max-w-4xl mx-auto">
              <Image
                src="/assets/photos/comite/comite.jpg"
                alt="Comité directeur du TCH"
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {comite.map((m, i) => (
                <div
                  key={m.id}
                  className={`reveal d${Math.min(i + 1, 4)} text-center p-4 rounded-xl bg-off-white card-hover`}
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-600/10 flex items-center justify-center text-green-600 font-bold text-xl">
                    {m.prenom[0]}{m.nom[0]}
                  </div>
                  <h3 className="mt-3 font-bold text-green-900 text-sm">
                    {m.prenom} {m.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALERIE */}
      {galerie.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600 text-center reveal">
              Galerie photos
            </h2>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {galerie.map((photo, i) => (
                <div
                  key={photo.id}
                  className={`reveal d${Math.min(i + 1, 4)} relative h-40 sm:h-48 rounded-xl overflow-hidden card-hover`}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.caption ?? "Photo TCH"}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
            <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 reveal">
              Nos partenaires
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 reveal d1">
              {sponsors.map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-4 py-2">
                  {s.logo_url ? (
                    <Image
                      src={s.logo_url}
                      alt={s.nom}
                      width={80}
                      height={40}
                      className="h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                      {s.nom}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
