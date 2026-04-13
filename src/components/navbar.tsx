"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className={`mx-auto max-w-3xl glass rounded-lg px-6 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1"
            aria-label="Voltar aos kits"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kits</span>
          </Link>
          <a href="#" className="flex items-center cursor-pointer">
            <Image
              src="/lockup-sem-fundo.svg"
              alt="Infuser"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </a>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://pay.kiwify.com.br/D3Ari3v"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs sm:text-sm font-semibold text-black transition-all duration-200 hover:bg-green-400 hover:shadow-[0_0_20px_rgba(168,232,76,0.3)] cursor-pointer green-glow-sm"
          >
            Comprar Kit
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white cursor-pointer p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu with animation */}
      <div
        className={`md:hidden mt-2 mx-auto max-w-3xl rounded-lg border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl p-6 flex flex-col gap-4 transition-all duration-300 origin-top ${
          mobileOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://pay.kiwify.com.br/D3Ari3v"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-black cursor-pointer"
        >
          Comprar Kit
        </a>
      </div>
    </header>
  );
}
