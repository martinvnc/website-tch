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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/assets/logos/logo-vert-header.png"
              alt="Tennis Club Halluin"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm text-green-900 transition-colors border-b-2 hover:border-[#f6ca73] ${isActive ? "border-[#f6ca73]" : "border-transparent"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <div className="relative ml-auto">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-colors"
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
              <Link
                href="/connexion"
                className="ml-auto px-5 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors"
              >
                Connexion
              </Link>
            )}
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
              <Link
                href="/connexion"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-5 py-3 rounded-lg text-sm font-bold bg-green-600 text-white text-center hover:bg-green-800 transition-colors"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
