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
              <div className="flex items-center gap-2 mr-1">
                <a
                  href="https://facebook.com/tennisclubhalluin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-900 hover:text-green-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href="https://instagram.com/tch_halluin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-900 hover:text-pink-500 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
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
                    className="px-5 py-2 rounded-full text-sm border border-green-900 text-green-900 hover:text-green-600 hover:border-green-600 transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/connexion?tab=register"
                    className="px-5 py-2 rounded-full text-sm border border-green-600 bg-green-600 text-white hover:bg-green-800 hover:border-green-800 transition-colors"
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

            <div className="flex items-center gap-4 px-4 py-2">
              <a
                href="https://facebook.com/tennisclubhalluin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-900 hover:text-green-600 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://instagram.com/tch_halluin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-900 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>

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
