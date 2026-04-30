"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "utms";
const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

interface UtmRecord {
  utms: Record<string, string>;
  expiresAt: number;
}

function readSaved(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UtmRecord;
    if (!parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed.utms ?? {};
  } catch {
    return {};
  }
}

export function UtmTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming: Record<string, string> = {};
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) incoming[key] = value;
    });

    if (Object.keys(incoming).length) {
      const record: UtmRecord = { utms: incoming, expiresAt: Date.now() + TTL_MS };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    }

    const saved = readSaved();
    if (!Object.keys(saved).length) return;

    document.querySelectorAll<HTMLAnchorElement>('a[href*="kiwify"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        Object.entries(saved).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
        link.href = url.toString();
      } catch {
        /* href inválido — ignora */
      }
    });
  }, [pathname]);

  return null;
}
