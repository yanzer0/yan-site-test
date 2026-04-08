"use client";

import { useState } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "FAQ", href: "#faq" },
];

interface NavbarProps {
  onBack?: () => void;
}

export function Navbar({ onBack }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="mx-auto max-w-3xl glass rounded-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer mr-1"
              aria-label="Voltar aos kits"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kits</span>
            </button>
          )}
          {/* Logo */}
          <a href="#" className="flex items-center cursor-pointer">
          <Image
            src="/lockup-sem-fundo.png"
            alt="Infuser"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </a>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="https://pay.kiwify.com.br/D3Ari3v"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-green-400 cursor-pointer green-glow-sm"
        >
          Comprar Kit
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white cursor-pointer p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-3xl glass rounded-lg p-6 flex flex-col gap-4">
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
      )}
    </header>
  );
}
