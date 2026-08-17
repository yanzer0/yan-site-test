/**
 * Recebe o mapa gerado localmente, valida, renderiza e grava.
 *
 * O script local só faz o que precisa ser local: ler a transcrição do disco e
 * chamar o modelo. A validação, a renderização e a persistência acontecem aqui,
 * numa fonte única, e não duplicadas num script que não consegue importar o
 * mesmo código.
 *
 * O mapa nasce no estado `gerado`, que NÃO é servível. Só vira documento depois
 * da aprovação humana (FR-015).
 *
 * Envs:
 *   MAPA_PUBLICAR_SECRET  (sensível, autentica o script local)
 *   POSTGRES_URL          (sensível)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { validarMapa } from "@/lib/diagnostico/mapa-schema";
import {
  renderizarMapa,
  tokensNaoPreenchidos,
  REPRESENTANTE,
  VERSAO_TEMPLATE,
} from "@/lib/diagnostico/mapa-render";
import { gravarMapa } from "@/lib/diagnostico/mapa-db";
import { buscarLeadPorContato } from "@/lib/diagnostico/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cópia versionada do template canônico do brain.
 *
 * O canônico vive em `_knowledge/templates/mapa-diagnostico/` e é ele que o
 * guard do brain cobre. Esta cópia existe porque o brain não é deployado, e um
 * teste compara as duas: divergiu, a suíte reprova.
 */
const TEMPLATE = readFileSync(
  join(process.cwd(), "src", "lib", "diagnostico", "mapa-template.html"),
  "utf8",
);

function segredoConfere(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface CorpoPublicar {
  readonly email?: unknown;
  readonly conteudo?: unknown;
  readonly data?: unknown;
  readonly dataCurta?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const esperado = process.env.MAPA_PUBLICAR_SECRET;
  if (!esperado) {
    console.error("[mapa/publicar] MAPA_PUBLICAR_SECRET nao configurado");
    return NextResponse.json({ erro: "config_missing" }, { status: 500 });
  }

  const recebido = req.headers.get("x-mapa-secret") ?? "";
  if (!segredoConfere(recebido, esperado)) {
    return NextResponse.json({ erro: "nao_autorizado" }, { status: 401 });
  }

  let corpo: CorpoPublicar;
  try {
    corpo = (await req.json()) as CorpoPublicar;
  } catch {
    return NextResponse.json({ erro: "payload_invalido" }, { status: 400 });
  }

  const email = typeof corpo.email === "string" ? corpo.email : "";
  if (!email) return NextResponse.json({ erro: "email_ausente" }, { status: 400 });

  // A validacao vem ANTES de qualquer coisa tocar o banco, e devolve todos os
  // problemas de uma vez para quem for ajustar o prompt.
  const validacao = validarMapa(corpo.conteudo);
  if (!validacao.ok) {
    return NextResponse.json({ erro: "conteudo_invalido", problemas: validacao.problemas }, { status: 422 });
  }

  const leadId = await buscarLeadPorContato(email, null);
  if (!leadId) {
    return NextResponse.json({ erro: "lead_nao_encontrado" }, { status: 404 });
  }

  let html: string;
  try {
    html = renderizarMapa(TEMPLATE, {
      conteudo: validacao.conteudo,
      // Sempre a empresa, nunca a pessoa. O documento é da Infuser, e a Call 1
      // pode ser conduzida por qualquer um do time, então assinar com nome
      // individual criaria um vínculo que o processo não tem. Fixado aqui, e
      // não vindo do corpo, para não depender de quem chama passar certo.
      representante: REPRESENTANTE,
      data: typeof corpo.data === "string" ? corpo.data : "",
      dataCurta: typeof corpo.dataCurta === "string" ? corpo.dataCurta : "",
    });
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message : "desconhecido";
    console.error(`[mapa/publicar] render falhou: ${motivo}`);
    return NextResponse.json({ erro: "render_falhou", motivo }, { status: 500 });
  }

  // Documento com token por preencher e documento com buraco. Melhor falhar
  // aqui do que o cliente abrir e ver {{ALGUMA_COISA}}.
  const sobrando = tokensNaoPreenchidos(html);
  if (sobrando.length > 0) {
    console.error(`[mapa/publicar] tokens nao preenchidos: ${sobrando.join(", ")}`);
    return NextResponse.json({ erro: "tokens_nao_preenchidos", tokens: sobrando }, { status: 500 });
  }

  try {
    const mapa = await gravarMapa(leadId, validacao.conteudo, html, VERSAO_TEMPLATE);
    return NextResponse.json({
      token: mapa.token,
      estado: mapa.estado,
      // A URL ja vem montada, mas o documento so abre depois de aprovado.
      url: `/mapa/${mapa.token}`,
    });
  } catch {
    console.error("[mapa/publicar] falha ao gravar");
    return NextResponse.json({ erro: "storage_failed" }, { status: 500 });
  }
}
