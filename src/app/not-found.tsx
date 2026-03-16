import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-green-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated tennis ball */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-yellow-400/20 animate-bounce" style={{ animationDuration: "3s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-10 h-10 rounded-full bg-yellow-400/15 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-6 h-6 rounded-full bg-yellow-400/10 animate-bounce" style={{ animationDuration: "2s", animationDelay: "1s" }} />
      </div>

      <div className="relative text-center z-10">
        <Image
          src="/assets/logos/logo-blanc-footer.png"
          alt="TCH"
          width={120}
          height={30}
          className="h-8 w-auto mx-auto mb-8 opacity-40"
        />
        <h1 className="font-display text-8xl sm:text-9xl text-yellow-400">
          404
        </h1>
        <p className="mt-4 text-xl font-extrabold text-white">
          Cette page n&apos;existe pas
        </p>
        <p className="mt-2 text-sm text-white/60">
          Vous cherchez peut-être quelque chose d&apos;autre ?
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg font-extrabold bg-yellow-400 text-green-900 hover:bg-yellow-300 btn-primary transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/reservation"
            className="px-6 py-3 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
          >
            Voir les terrains
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-lg font-bold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
