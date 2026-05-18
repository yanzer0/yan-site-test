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

function shouldSkip(href: string): boolean {
  if (!href) return true;
  if (href.startsWith("#")) return true;
  if (href.startsWith("mailto:")) return true;
  if (href.startsWith("tel:")) return true;
  if (href.startsWith("javascript:")) return true;
  return false;
}

function buildForwardParams(saved: Record<string, string>): URLSearchParams {
  const forward = new URLSearchParams(window.location.search);
  Object.entries(saved).forEach(([key, value]) => {
    if (!forward.has(key)) forward.set(key, value);
  });
  return forward;
}

function applyParamsToAnchors(forward: URLSearchParams) {
  if (![...forward.keys()].length) return;

  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const raw = link.getAttribute("href");
    if (!raw || shouldSkip(raw)) return;

    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash && !url.search) {
        return;
      }
      forward.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
      link.href = url.toString();
    } catch {
      /* href inválido — ignora */
    }
  });
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
    const forward = buildForwardParams(saved);
    if (![...forward.keys()].length) return;

    applyParamsToAnchors(forward);

    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        applyParamsToAnchors(forward);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
}
