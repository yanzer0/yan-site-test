/**
 * O contrato do card de cliente, como o brain define.
 *
 * A fonte de verdade é `scripts/lib/schema-clientes.js` no `yangalasso-brain`,
 * e este repositório não tem como importá-la: o brain não é dependência, não é
 * deployado junto e nem existe no ambiente de CI.
 *
 * Então aqui vive uma cópia declarada — e um teste que, quando o brain ESTÁ na
 * máquina, lê o original e compara. Na máquina do Yan a divergência reprova a
 * suíte; no CI a cópia ainda cobre `card-lead.ts` contra o contrato conhecido.
 *
 * Sem isso, "o schema mudou no brain" só apareceria como card rejeitado no
 * commit de outra pessoa, dias depois, sem pista da causa.
 */

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

export const REQUIRED_FIELDS = [
  "status",
  "modelo",
  "empresa",
  "segmento",
  "prioridade",
  "responsavel",
  "origem",
  "proximo_passo",
  "created",
  "updated",
] as const;

export const ENUM_STATUS = new Set([
  "call-marcada",
  "diagnostico-feito",
  "proposta-enviada",
  "fechado-aguardando-pagamento",
  "ativo",
  "concluido",
]);

export const ENUM_ORIGEM = new Set([
  "instagram",
  "indicacao",
  "networking",
  "inbound",
  "outbound",
  "conector",
  "outro",
]);

export const ENUM_MODELO = new Set(["recorrencia", "one-shot", "indefinido"]);

interface SchemaDoBrain {
  readonly REQUIRED_FIELDS: readonly string[];
  readonly STATUS: readonly { readonly id: string }[];
  readonly ORIGENS: readonly string[];
  readonly MODELOS: readonly string[];
}

/** O schema real, quando o brain está clonado nesta máquina. `null` no CI. */
export function schemaOriginal(): SchemaDoBrain | null {
  const brain =
    process.env.BRAIN_PATH ??
    "C:\\Users\\PC\\Documents\\INFUSER USE - CONSULTORIA DE IA\\yangalasso-brain";
  const caminho = join(brain, "scripts", "lib", "schema-clientes.js");
  if (!existsSync(caminho)) return null;
  return createRequire(import.meta.url)(caminho) as SchemaDoBrain;
}
