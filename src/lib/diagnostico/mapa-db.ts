/**
 * Persistência do mapa de diagnóstico.
 *
 * Mesmas regras do `db.ts`: query parametrizada sempre, erro com classe
 * própria, nenhum dado pessoal em log.
 */

import { sql } from "@vercel/postgres";

import { ErroPersistencia } from "./db";
import type { EstadoMapa, MapaConteudo } from "./mapa-tipos";

export interface MapaGravado {
  readonly id: string;
  readonly token: string;
  readonly estado: EstadoMapa;
}

export interface MapaServivel {
  readonly id: string;
  readonly html: string;
  readonly estado: EstadoMapa;
}

/** Token opaco da URL. Sem nada do lead dentro (FR-013a). */
export function gerarToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function gravarMapa(
  leadId: string,
  conteudo: MapaConteudo,
  html: string,
  versaoTemplate: string,
): Promise<MapaGravado> {
  const token = gerarToken();
  try {
    const inserido = await sql<{ id: string }>`
      INSERT INTO mapas (lead_id, token, conteudo, html, versao_template)
      VALUES (${leadId}, ${token}, ${JSON.stringify(conteudo)}::jsonb, ${html}, ${versaoTemplate})
      RETURNING id
    `;
    const id = inserido.rows[0]?.id;
    if (!id) throw new Error("insert de mapa nao devolveu id");

    // Os achados em forma consultavel, para a pergunta "que limites a gente
    // mais encontra" nao exigir abrir documento nenhum.
    let ordem = 0;
    for (const etapa of conteudo.etapas) {
      await sql`
        INSERT INTO mapa_achados (mapa_id, tipo, classificacao, titulo, descricao, ordem)
        VALUES (${id}, 'etapa', 'fato', ${etapa.titulo}, ${etapa.descricao}, ${ordem++})
      `;
    }
    for (const achado of conteudo.achados) {
      await sql`
        INSERT INTO mapa_achados (mapa_id, tipo, classificacao, titulo, descricao, ordem)
        VALUES (${id}, ${achado.tipo}, ${achado.classificacao}, ${achado.titulo}, ${achado.descricao}, ${ordem++})
      `;
    }

    return { id, token, estado: "gerado" };
  } catch (causa) {
    throw new ErroPersistencia("gravar mapa", causa);
  }
}

/**
 * Busca o mapa para servir e conta a abertura na mesma ida ao banco.
 *
 * Só devolve `aprovado` ou `entregue`. Mapa `gerado` não existe para o mundo:
 * é o gate de FR-015, e ele mora aqui e não na rota, para não haver caminho
 * que sirva documento não aprovado por esquecimento de quem escrever a próxima
 * rota.
 */
export async function abrirMapaPorToken(token: string): Promise<MapaServivel | null> {
  try {
    const r = await sql<{ id: string; html: string; estado: EstadoMapa }>`
      UPDATE mapas
         SET aberturas = aberturas + 1,
             primeira_abertura_em = COALESCE(primeira_abertura_em, now()),
             ultima_abertura_em = now(),
             estado = CASE WHEN estado = 'aprovado' THEN 'entregue' ELSE estado END,
             atualizado_em = now()
       WHERE token = ${token}
         AND estado IN ('aprovado','entregue')
       RETURNING id, html, estado
    `;
    return r.rows[0] ?? null;
  } catch (causa) {
    throw new ErroPersistencia("abrir mapa", causa);
  }
}

export async function aprovarMapa(
  token: string,
  quem: string,
  houveCorrecao: boolean,
): Promise<boolean> {
  try {
    const r = await sql`
      UPDATE mapas
         SET estado = 'aprovado',
             aprovado_por = ${quem},
             aprovado_em = now(),
             houve_correcao = ${houveCorrecao},
             atualizado_em = now()
       WHERE token = ${token} AND estado = 'gerado'
    `;
    return (r.rowCount ?? 0) > 0;
  } catch (causa) {
    throw new ErroPersistencia("aprovar mapa", causa);
  }
}

export interface ResumoMapa {
  readonly token: string;
  readonly estado: EstadoMapa;
  readonly cliente: string;
  readonly aberturas: number;
  readonly criadoEm: Date;
}

export async function listarMapas(estado?: EstadoMapa): Promise<readonly ResumoMapa[]> {
  try {
    const r = await sql<{
      token: string;
      estado: EstadoMapa;
      cliente: string;
      aberturas: number;
      criado_em: Date;
    }>`
      SELECT m.token, m.estado, COALESCE(l.empresa, l.nome) AS cliente,
             m.aberturas, m.criado_em
        FROM mapas m JOIN leads l ON l.id = m.lead_id
       WHERE (${estado ?? null}::text IS NULL OR m.estado = ${estado ?? null})
       ORDER BY m.criado_em DESC
       LIMIT 100
    `;
    return r.rows.map((x) => ({
      token: x.token,
      estado: x.estado,
      cliente: x.cliente,
      aberturas: x.aberturas,
      criadoEm: x.criado_em,
    }));
  } catch (causa) {
    throw new ErroPersistencia("listar mapas", causa);
  }
}

/**
 * A taxa de correção de FR-018.
 *
 * É o número que decide se o gate de aprovação humana continua valendo a pena,
 * ou se o gerador já é confiável o bastante para entregar direto.
 */
export async function taxaDeCorrecao(): Promise<{ total: number; comCorrecao: number }> {
  try {
    const r = await sql<{ total: number; com_correcao: number }>`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE houve_correcao)::int AS com_correcao
        FROM mapas
       WHERE aprovado_em IS NOT NULL
    `;
    return { total: r.rows[0]?.total ?? 0, comCorrecao: r.rows[0]?.com_correcao ?? 0 };
  } catch (causa) {
    throw new ErroPersistencia("calcular taxa de correcao", causa);
  }
}
