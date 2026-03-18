import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Tennis Club Halluin",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-16">
      <h1 className="text-3xl font-bold text-green-600 mb-8">Politique de confidentialité</h1>
      <div className="prose prose-green max-w-none space-y-6 text-sm text-muted-foreground">
        <section>
          <h2 className="text-lg font-bold text-green-900">1. Responsable du traitement</h2>
          <p>Tennis Club Halluin<br />341 rue de la Lys, 59250 Halluin<br />contact@tch.fr</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">2. Données collectées</h2>
          <p>Nous collectons : nom, prénom, email, téléphone, classement FFT, données de réservation et de présence. Ces données sont nécessaires au fonctionnement du service.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">3. Finalité du traitement</h2>
          <p>Gestion des adhérents, réservation de terrains, suivi des présences, communication club. Aucune donnée n&apos;est vendue à des tiers.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">4. Durée de conservation</h2>
          <p>Les données sont conservées pendant la durée de l&apos;adhésion et 3 ans après la dernière activité, conformément à la réglementation.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">5. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression, portabilité, limitation et opposition. Contactez-nous à contact@tch.fr pour exercer vos droits.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-green-900">6. Cookies</h2>
          <p>Ce site utilise uniquement des cookies essentiels au fonctionnement (session d&apos;authentification). Aucun cookie de tracking tiers n&apos;est utilisé sans votre consentement.</p>
        </section>
      </div>
    </div>
  );
}
