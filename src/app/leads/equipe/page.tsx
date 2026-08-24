import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { listarUsuarios } from "@/lib/diagnostico/auth-db";
import { dataBR } from "@/lib/diagnostico/leads-apresentacao";
import { adminLogado } from "@/lib/diagnostico/sessao";
import { decidirCadastro } from "../acoes";
import "../leads.css";

export const metadata: Metadata = {
  title: "Equipe | Infuser",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ERROS: Record<string, string> = {
  alvo: "Cadastro inválido.",
  estado: "Estado inválido.",
  proprio: "Você não pode mudar o seu próprio acesso.",
};

const ROTULO_ESTADO: Record<string, string> = {
  pendente: "Esperando aprovação",
  aprovado: "Aprovado",
  bloqueado: "Bloqueado",
};

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; aviso?: string }>;
}) {
  // 🔴 Membro comum não abre esta tela. A ação também confere por conta
  // própria: esconder o botão não fecha o endpoint.
  const admin = await adminLogado();
  if (!admin) redirect("/leads");

  const params = await searchParams;
  const erro = params.erro ? ERROS[params.erro] : undefined;

  const pessoas = await listarUsuarios();
  const pendentes = pessoas.filter((p) => p.estado === "pendente");

  return (
    <main className="lp">
      <div className="lp-wrap" style={{ maxWidth: 760 }}>
        <Link className="lp-voltar" href="/leads">
          voltar para os leads
        </Link>

        <h1 className="lp-titulo" style={{ marginTop: 10 }}>
          Quem tem acesso
        </h1>
        <p className="lp-sub">
          {pendentes.length > 0
            ? `${pendentes.length} esperando sua aprovação.`
            : "Ninguém esperando aprovação."}
        </p>

        {erro && (
          <p className="lp-recado" data-tom="erro">
            {erro}
          </p>
        )}
        {params.aviso === "salvo" && !erro && (
          <p className="lp-recado" data-tom="aviso">
            Acesso atualizado.
          </p>
        )}

        {pessoas.map((p) => (
          <div key={p.id} className="lp-bloco">
            <div className="lp-pessoa">
              <div className="lp-pessoa-info">
                <div className="lp-pessoa-nome">{p.nome}</div>
                <div className="lp-pessoa-email">{p.email}</div>
                <div className="lp-selos" style={{ marginTop: 8 }}>
                  <span
                    className="lp-selo"
                    data-tom={
                      p.estado === "aprovado" ? "bom" : p.estado === "pendente" ? "atencao" : "frio"
                    }
                  >
                    {ROTULO_ESTADO[p.estado]}
                  </span>
                  {p.papel === "admin" && (
                    <span className="lp-selo" data-tom="frio">
                      admin
                    </span>
                  )}
                  <span className="lp-selo" data-tom="frio">
                    desde {dataBR(p.criadoEm)}
                  </span>
                </div>
              </div>

              {p.id !== admin.id && (
                <div style={{ display: "flex", gap: 8 }}>
                  {p.estado !== "aprovado" && (
                    <form action={decidirCadastro}>
                      <input type="hidden" name="usuarioId" value={p.id} />
                      <input type="hidden" name="estado" value="aprovado" />
                      <button className="lp-botao" data-tom="bom" type="submit">
                        Aprovar
                      </button>
                    </form>
                  )}
                  {p.estado !== "bloqueado" && (
                    <form action={decidirCadastro}>
                      <input type="hidden" name="usuarioId" value={p.id} />
                      <input type="hidden" name="estado" value="bloqueado" />
                      <button className="lp-botao" data-tom="ruim" type="submit">
                        Bloquear
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
