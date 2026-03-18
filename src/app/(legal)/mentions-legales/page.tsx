import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Tennis Club Halluin",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-16">
      <h1 className="text-3xl font-bold text-green-600 mb-8">Mentions légales</h1>
      <div className="prose prose-green max-w-none space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-green-900">Éditeur du site</h2>
          <p>Tennis Club Halluin (TCH)<br />Association loi 1901<br />341 rue de la Lys, 59250 Halluin<br />Email : contact@tch.fr</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">Hébergement</h2>
          <p>Vercel Inc.<br />440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">Directeur de la publication</h2>
          <p>Le Président du Tennis Club Halluin</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">Propriété intellectuelle</h2>
          <p>L&apos;ensemble du contenu de ce site (textes, images, logos, graphismes) est la propriété exclusive du Tennis Club Halluin ou de ses partenaires. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
        </section>
      </div>
    </div>
  );
}
