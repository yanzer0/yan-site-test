import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInNewContext } from "node:vm";
const estado = vi.hoisted(() => ({ pathname: "/kit-vscode", effect: undefined as undefined | (() => void | (() => void)) }));
vi.mock("next/navigation", () => ({ usePathname: () => estado.pathname }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("react", async () => ({ ...await vi.importActual<typeof import("react")>("react"), useEffect: (effect: () => void | (() => void)) => { estado.effect = effect; } }));
import { Gtm } from "@/components/gtm";
import { UtmTracker } from "@/components/utm-tracker";

beforeEach(() => { estado.pathname = "/kit-vscode"; estado.effect = undefined; });
afterEach(() => { vi.unstubAllGlobals(); });
describe("tracking do Kit gratuito", () => {
  it("Kit monta apenas o loader compartilhado de consentimento", () => {
    const elemento = Gtm(); expect(elemento.props.src).toBe("/guias/marketing.js?v=20261028-1"); expect(elemento.props.children).toBeUndefined();
  });
  it("Kit não lê/grava storage nem altera URLs", () => {
    vi.stubGlobal("window", new Proxy({}, { get: () => { throw new Error("Kit não deveria ler window no UtmTracker"); } }));
    vi.stubGlobal("localStorage", new Proxy({}, { get: () => { throw new Error("Kit não deveria tocar storage"); } }));
    UtmTracker(); expect(() => estado.effect?.()).not.toThrow();
  });
  it("LPs existentes mantêm o container e a gravação de campanha", () => {
    estado.pathname = "/legiao"; const elemento = Gtm(); expect(elemento.props.children).toContain("https://api.useinfuser.com/etrthkooc.js");
    const setItem = vi.fn(), getItem = vi.fn(() => null);
    vi.stubGlobal("localStorage", { setItem, getItem, removeItem: vi.fn() });
    vi.stubGlobal("window", { location: { search: "?utm_source=instagram", origin: "https://useinfuser.com", pathname: "/legiao", href: "https://useinfuser.com/legiao" }, requestAnimationFrame: vi.fn(), cancelAnimationFrame: vi.fn() });
    vi.stubGlobal("document", { querySelectorAll: () => [], body: {} });
    vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} });
    UtmTracker(); const cleanup = estado.effect?.(); expect(setItem).toHaveBeenCalledWith("utms", expect.stringContaining("instagram")); if (typeof cleanup === "function") cleanup();
  });
  it("guard compartilhado impede GTM duplicado na navegação", () => {
    estado.pathname = "/legiao"; const script = Gtm().props.children;
    const insertBefore = vi.fn(); const window = { dataLayer: [] };
    const document = { getElementById: () => null, getElementsByTagName: () => [{ parentNode: { insertBefore } }], createElement: () => ({}) };
    const contexto = { window, document }; runInNewContext(script, contexto); runInNewContext(script, contexto); expect(insertBefore).toHaveBeenCalledTimes(1);
  });
});
