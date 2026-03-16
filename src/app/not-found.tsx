import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Image
          src="/assets/logos/logo-vert-header.png"
          alt="TCH"
          width={120}
          height={30}
          className="h-8 w-auto mx-auto mb-6 opacity-40"
        />
        <h1 className="text-7xl font-bold text-green-600">404</h1>
        <p className="mt-3 text-lg font-bold text-green-900">
          Page introuvable
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
