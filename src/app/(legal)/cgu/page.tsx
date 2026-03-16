import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — Tennis Club Halluin",
};

export default function CguPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-green-600 mb-8">Conditions Générales d&apos;Utilisation</h1>
      <div className="prose prose-green max-w-none space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-green-900">1. Objet</h2>
          <p>Les présentes CGU régissent l&apos;utilisation de l&apos;application web du Tennis Club Halluin. En créant un compte, vous acceptez ces conditions.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">2. Accès au service</h2>
          <p>L&apos;accès est réservé aux adhérents du TCH disposant d&apos;un code d&apos;accès valide. Chaque compte est personnel et ne peut être partagé.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">3. Réservation de terrains</h2>
          <p>Chaque membre peut réserver un terrain par jour maximum. La réservation est d&apos;une durée de 1 heure. Un partenaire membre est obligatoire. L&apos;annulation est libre jusqu&apos;à 2 heures avant le créneau.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">4. Responsabilités</h2>
          <p>Le TCH ne saurait être tenu responsable des interruptions de service ou des données incorrectes. L&apos;utilisateur s&apos;engage à ne pas utiliser le service à des fins illicites.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">5. Modification des CGU</h2>
          <p>Le TCH se réserve le droit de modifier les CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>
        </section>
      </div>
    </div>
  );
}
