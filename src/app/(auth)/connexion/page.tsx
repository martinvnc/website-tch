"use client";

import { useState, Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ConnexionPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={32} /></div>}>
      <ConnexionPage />
    </Suspense>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && <Loader2 size={18} className="animate-spin" />}
      {pending ? "Chargement..." : label}
    </button>
  );
}

function ConnexionPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const message = searchParams.get("message") || "";

  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginState, loginAction] = useFormState<AuthState, FormData>(signIn, {});
  const [registerState, registerAction] = useFormState<AuthState, FormData>(signUp, {});

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/logos/logo-vert-header.png"
            alt="Tennis Club Halluin"
            width={200}
            height={50}
            className="h-12 w-auto mx-auto"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Espace réservé aux adhérents du TCH
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-400/20 text-yellow-800 text-sm text-center font-medium">
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === "login"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === "register"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="p-6">
            {tab === "login" && (
              <form action={loginAction} className="space-y-4">
                <input type="hidden" name="redirect" value={redirectTo} />

                {loginState.error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {loginState.error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors"
                    placeholder="votre@email.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <SubmitButton label="Se connecter" />
              </form>
            )}

            {tab === "register" && (
              <form action={registerAction} className="space-y-4">
                {registerState.error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {registerState.error}
                  </div>
                )}

                {registerState.success && (
                  <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                    {registerState.success}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors"
                    placeholder="votre@email.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-900 mb-1">
                    Code d&apos;accès club
                  </label>
                  <input
                    type="text"
                    name="codeAcces"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 transition-colors"
                    placeholder="Code fourni par le club"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Code fourni par le TCH lors de votre adhésion
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="acceptCgu"
                    id="acceptCgu"
                    value="true"
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <label htmlFor="acceptCgu" className="text-xs text-muted-foreground">
                    J&apos;accepte les{" "}
                    <Link href="/cgu" className="underline text-green-600 hover:text-green-800">
                      CGU
                    </Link>{" "}
                    et la{" "}
                    <Link
                      href="/confidentialite"
                      className="underline text-green-600 hover:text-green-800"
                    >
                      politique de confidentialité
                    </Link>
                  </label>
                </div>

                <SubmitButton label="Créer mon compte" />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
