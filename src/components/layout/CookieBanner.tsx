"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("tch_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("tch_cookie_consent", "accepted");
    localStorage.setItem("tch_cookie_date", new Date().toISOString());
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("tch_cookie_consent", "refused");
    localStorage.setItem("tch_cookie_date", new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border p-5 sm:p-6">
        <p className="text-sm text-green-900">
          Ce site utilise des cookies essentiels au fonctionnement du service.
          Pour en savoir plus, consultez notre{" "}
          <Link href="/confidentialite" className="underline text-green-600 font-bold">
            politique de confidentialité
          </Link>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={accept}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors"
          >
            Accepter
          </button>
          <button
            onClick={refuse}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-gray-100 text-green-900 hover:bg-gray-200 transition-colors"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
