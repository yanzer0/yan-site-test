/**
 * Kiwify Webhook -> Meta CAPI Purchase com Advanced Matching
 *
 * Fluxo:
 *   1. Kiwify envia POST com payload de compra + ?signature=<hex> (HMAC-SHA1
 *      do raw body usando KIWIFY_WEBHOOK_SECRET como chave).
 *   2. Validamos a assinatura (timing-safe). Body invalido => 401.
 *   3. Filtramos apenas eventos de compra aprovada (order_status === "paid"
 *      ou webhook_event_type === "order_approved"). Outros => 200 + skipped.
 *   4. Hasheamos em/ph/fn/ln/external_id (SHA-256, lowercase trim) e
 *      disparamos Purchase no Meta CAPI com event_id = order_id
 *      (idempotente em retry do Kiwify).
 *
 * Envs necessarias:
 *   META_PIXEL_ID            (ja existe)
 *   META_CAPI_ACCESS_TOKEN   (ja existe, sensitive)
 *   KIWIFY_WEBHOOK_SECRET    (sensitive — token configurado no painel Kiwify)
 *   META_TEST_EVENT_CODE     (opcional — se setado, manda test_event_code
 *                             no payload pra Test Events sem afetar prod)
 *   META_EVENT_SOURCE_URL    (opcional — default "https://useinfuser.com")
 *
 * Teste local (PowerShell):
 *   $body = '{"order_id":"abc","order_status":"paid","webhook_event_type":"order_approved","Customer":{"email":"t@t.com","CPF":"000.000.000-00","first_name":"Test","last_name":"User","mobile":"+5511999999999","ip":"1.2.3.4"},"Commissions":{"charge_amount":19700,"currency":"BRL"}}'
 *   $sig = node -e "console.log(require('crypto').createHmac('sha1',process.env.S).update(process.env.B).digest('hex'))" -S "SECRET" -B "$body"
 *   curl -X POST "http://localhost:3000/api/kiwify-webhook?signature=$sig" -H "Content-Type: application/json" --data $body
 *
 * IMPORTANTE — passo manual no painel Kiwify apos validacao:
 *   Desativar o disparo nativo do Pixel/CAPI da Kiwify (Configuracoes ->
 *   Pixels) para evitar Purchase duplicado. event_id = order_id ainda
 *   deduplica caso fique ligado, mas o disparo nativo nao envia Advanced
 *   Matching — entao o evento nativo seria substituido pelo nosso (este)
 *   se chegasse depois, mas pode chegar antes. Mais limpo desligar.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { pickIp, processUserData, sendMetaCapiEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_EVENT_SOURCE_URL = "https://useinfuser.com";

interface KiwifyCustomer {
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  mobile?: string;
  CPF?: string;
  ip?: string;
  country?: string;
}

interface KiwifyCommissions {
  charge_amount?: number;
  currency?: string;
}

interface KiwifyProduct {
  product_id?: string;
  product_name?: string;
}

interface KiwifyPayload {
  order_id?: string;
  order_status?: string;
  webhook_event_type?: string;
  subscription_id?: string;
  Customer?: KiwifyCustomer;
  Commissions?: KiwifyCommissions;
  Product?: KiwifyProduct;
  TrackingParameters?: Record<string, string | undefined>;
}

function digitsOnly(value: string | undefined | null): string {
  return value ? value.replace(/\D+/g, "") : "";
}

function normalizePhone(value: string | undefined | null): string {
  const digits = digitsOnly(value);
  if (!digits) return "";
  // Brazilian mobile sem country code = 10 ou 11 digitos. Prepend "55".
  if (digits.length <= 11) return `55${digits}`;
  return digits;
}

function verifyKiwifySignature(rawBody: string, providedSig: string, secret: string): boolean {
  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(providedSig.toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const SECRET = process.env.KIWIFY_WEBHOOK_SECRET;
  if (!SECRET) {
    console.error("[kiwify-webhook] KIWIFY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "config_missing" }, { status: 500 });
  }

  const rawBody = await req.text();
  const providedSig =
    req.nextUrl.searchParams.get("signature") ??
    req.headers.get("x-kiwify-signature") ??
    "";

  if (!providedSig || !verifyKiwifySignature(rawBody, providedSig, SECRET)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: KiwifyPayload;
  try {
    payload = JSON.parse(rawBody) as KiwifyPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const isApproved =
    payload.order_status === "paid" || payload.webhook_event_type === "order_approved";
  if (!isApproved) {
    return NextResponse.json({ ok: true, skipped: "not_approved" });
  }

  const orderId = payload.order_id;
  if (!orderId) {
    return NextResponse.json({ error: "missing_order_id" }, { status: 400 });
  }

  const customer: KiwifyCustomer = payload.Customer ?? {};
  const commissions: KiwifyCommissions = payload.Commissions ?? {};
  const tracking: Record<string, string | undefined> = payload.TrackingParameters ?? {};

  const firstName =
    customer.first_name?.trim() || customer.full_name?.trim().split(/\s+/)[0] || "";
  const lastName =
    customer.last_name?.trim() ||
    (customer.full_name ? customer.full_name.trim().split(/\s+/).slice(1).join(" ") : "") ||
    "";

  const phone = normalizePhone(customer.mobile);
  const cpf = digitsOnly(customer.CPF);

  const fbp = tracking._fbp ?? tracking.fbp ?? tracking.s1;
  const fbc = tracking._fbc ?? tracking.fbc ?? tracking.s2;

  const userDataInput: Record<string, string> = {};
  if (customer.email) userDataInput.em = customer.email;
  if (phone) userDataInput.ph = phone;
  if (firstName) userDataInput.fn = firstName;
  if (lastName) userDataInput.ln = lastName;
  if (cpf) userDataInput.external_id = cpf;
  if (customer.country) userDataInput.country = customer.country;
  if (fbp) userDataInput.fbp = fbp;
  if (fbc) userDataInput.fbc = fbc;
  if (payload.subscription_id) userDataInput.subscription_id = payload.subscription_id;

  // Customer.ip vem do payload (IP do comprador no checkout). x-forwarded-for
  // aqui seria o IP do servidor Kiwify - inutil pra match quality.
  const ip = customer.ip || pickIp(req.headers);

  const user_data: Record<string, string> = {
    ...processUserData(userDataInput),
    ...(ip ? { client_ip_address: ip } : {}),
  };

  const chargeAmountCents =
    typeof commissions.charge_amount === "number" ? commissions.charge_amount : 0;
  const value = Math.round(chargeAmountCents) / 100;
  const currency = commissions.currency ?? "BRL";

  const productId = payload.Product?.product_id;
  const custom_data: Record<string, unknown> = {
    value,
    currency,
    content_type: "product",
    ...(productId ? { content_ids: [productId] } : {}),
  };

  const result = await sendMetaCapiEvent({
    event_name: "Purchase",
    event_id: orderId,
    event_source_url: process.env.META_EVENT_SOURCE_URL ?? DEFAULT_EVENT_SOURCE_URL,
    user_data,
    custom_data,
  });

  if (!result.ok) {
    console.error(
      `[kiwify-webhook] Meta CAPI failed for order_id=${orderId}: ${result.error}`,
    );
    // Retornamos 200 mesmo em falha upstream pra evitar retry storm da Kiwify.
    // event_id = order_id garante idempotencia se reprocessarmos manualmente.
    return NextResponse.json({ ok: false, error: result.error });
  }

  return NextResponse.json({ ok: true });
}
