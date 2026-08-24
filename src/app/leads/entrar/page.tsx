import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TAMANHO_MINIMO_SENHA } from "@/lib/diagnostico/senha";
import { usuarioLogado } from "@/lib/diagnostico/sessao";
import { cadastrar, entrar } from "../acoes";
import "../leads.css";

export const metadata: Metadata = {
  title: "Acesso | Infuser",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * As frases moram aqui, e a URL carrega só o código.
 *
 * Assim nada que venha da query string é impresso na página: o parâmetro é
 * usado como CHAVE de um mapa fechado, e um código desconhecido simplesmente
 * não mostra recado nenhum. É o que fecha a porta de XML/HTML injetado por
 * link, que é o jeito clássico de transformar uma tela de login em armadilha.
 */
const ERROS: Record<string, string> = {
  campos: "Preencha todos os campos.",
  email: "Esse e-mail não parece válido.",
  senha_fraca: `A senha precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres e não pode conter o seu e-mail.`,
  credenciais: "E-mail ou senha incorretos.",
  pendente: "Sua conta ainda não foi aprovada. O Yan libera e você entra.",
  bloqueado: "Esta conta está bloqueada.",
  muitas_tentativas: "Tentativas demais. Espere um pouco e tente de novo.",
  muitos_cadastros: "Cadastros demais desta rede. Tente de novo mais tarde.",
  indisponivel: "Não consegui concluir agora. Tente de novo.",
};

const AVISOS: Record<string, string> = {
  cadastro: "Cadastro recebido. Assim que for aprovado, você entra com esse e-mail e senha.",
  dono: "Conta criada como dona do painel, já aprovada. Entre com esse e-mail e senha.",
  saiu: "Você saiu.",
};

function minutosOuSegundos(bruto: string | undefined): string {
  const segundos = Number(bruto);
  if (!Number.isFinite(segundos) || segundos <= 0) return "";
  if (segundos < 60) return ` Faltam ${Math.ceil(segundos)} segundos.`;
  return ` Faltam ${Math.ceil(segundos / 60)} minutos.`;
}

export default async function AcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; erro?: string; aviso?: string; esperar?: string }>;
}) {
  // Quem já tem sessão válida não vê tela de login: vai direto para o painel.
  if (await usuarioLogado()) redirect("/leads");

  const params = await searchParams;
  const cadastrando = params.aba === "cadastrar";

  const erro = params.erro ? ERROS[params.erro] : undefined;
  const aviso = params.aviso ? AVISOS[params.aviso] : undefined;
  const espera = params.erro?.startsWith("muit") ? minutosOuSegundos(params.esperar) : "";

  return (
    <main className="lp">
      <div className="lp-acesso">
        <div className="lp-acesso-caixa">
          <div className="lp-marca">Infuser</div>

          <div className="lp-abas">
            <Link className="lp-aba" data-ativo={cadastrando ? "nao" : "sim"} href="/leads/entrar">
              Entrar
            </Link>
            <Link
              className="lp-aba"
              data-ativo={cadastrando ? "sim" : "nao"}
              href="/leads/entrar?aba=cadastrar"
            >
              Criar conta
            </Link>
          </div>

          {erro && (
            <p className="lp-recado" data-tom="erro">
              {erro}
              {espera}
            </p>
          )}
          {aviso && !erro && (
            <p className="lp-recado" data-tom="aviso">
              {aviso}
            </p>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{cadastrando ? "Criar conta" : "Entrar no painel"}</CardTitle>
              <CardDescription>
                {cadastrando
                  ? "Sua conta fica esperando aprovação antes do primeiro acesso."
                  : "Leads do diagnóstico, para o time da Infuser."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* `action` com a Server Action: submete sem JavaScript, e o Next
                  confere a origem da requisição por conta própria. */}
              <form action={cadastrando ? cadastrar : entrar}>
                {cadastrando && (
                  <div className="lp-campo">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" name="nome" type="text" required maxLength={80} autoComplete="name" />
                  </div>
                )}

                <div className="lp-campo">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    // 16px evita o zoom automático do iOS ao focar o campo.
                    style={{ fontSize: 16 }}
                  />
                </div>

                <div className="lp-campo">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    required
                    minLength={cadastrando ? TAMANHO_MINIMO_SENHA : undefined}
                    maxLength={200}
                    autoComplete={cadastrando ? "new-password" : "current-password"}
                    style={{ fontSize: 16 }}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {cadastrando ? "Criar conta" : "Entrar"}
                </Button>
              </form>

              {cadastrando && (
                <p className="lp-dica">
                  Mínimo de {TAMANHO_MINIMO_SENHA} caracteres. Uma frase que só você usa vale mais
                  que símbolo no meio da palavra.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
