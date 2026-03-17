"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/le-club", label: "Le Club" },
  { href: "/reservation", label: "Réservation" },
  { href: "/resultats", label: "Résultats" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/logos/logo-vert-header.png"
              alt="Tennis Club Halluin"
              width={160}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6 flex-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-3 py-1 text-sm text-green-900"
                >
                  {link.label}
                  <span className={`absolute left-3 right-3 bottom-0 h-[2px] bg-[#f6ca73] transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}

            <div className="flex items-center gap-3 ml-auto">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-colors"
                  >
                    <User size={16} />
                    {user.user_metadata?.prenom || "Mon compte"}
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 py-1">
                        <Link
                          href="/mon-compte"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-900 hover:bg-green-600/10 transition-colors"
                        >
                          <User size={16} />
                          Mon compte
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    className="px-4 py-1.5 rounded-full text-xs border border-green-900 text-green-900 hover:text-green-600 hover:border-green-600 transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/connexion?tab=register"
                    className="px-4 py-1.5 rounded-full text-xs border border-green-600 bg-green-600 text-white hover:bg-green-800 hover:border-green-800 transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </nav>

          <button
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm text-green-900 transition-colors ${isActive ? "border-l-4 border-[#f6ca73] bg-green-600/5" : "hover:bg-green-600/10"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  href="/mon-compte"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm text-green-600 hover:bg-green-600/10 transition-colors"
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs border border-green-900 text-green-900 text-center hover:text-green-600 hover:border-green-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/connexion?tab=register"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs border border-green-600 bg-green-600 text-white text-center hover:bg-green-800 hover:border-green-800 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
