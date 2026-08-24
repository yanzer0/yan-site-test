/**
 * Hash de senha, com `scrypt` do `node:crypto`.
 *
 * Por que a stdlib e não uma dependência: senha é o pedaço do sistema onde
 * supply chain dói mais. `scrypt` já vem no Node, é function de derivação
 * cara em memória (o que mata GPU), e está na lista de algoritmos aceitos do
 * OWASP. Trazer `bcryptjs` ou binário nativo aqui adiciona risco sem ganho.
 *
 * Custo MEDIDO nesta máquina, não estimado: N=2^17, r=8, p=1 leva ~570ms e
 * usa 128MB. É o mínimo recomendado pelo OWASP, e com três pessoas fazendo
 * login de vez em quando meio segundo não custa nada.
 *
 * 🔴 O custo alto é arma nos dois sentidos: cada tentativa gasta 128MB do
 * servidor. Por isso o rate limit roda ANTES do hash, nunca depois - senão o
 * proprio login vira o DoS.
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt) as (
  senha: string,
  sal: Buffer,
  tamanho: number,
  opcoes: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/** Mínimo OWASP para scrypt. Subir isto depois não invalida hash antigo: o N vive no próprio hash. */
const CUSTO = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 } as const;
const TAMANHO = 64;

/** Doze e não oito: são três pessoas, e exigir senha forte aqui não derruba conversão de ninguém. */
export const TAMANHO_MINIMO_SENHA = 12;

/**
 * `scrypt$N$r$p$sal$hash`.
 *
 * O prefixo com os parâmetros é o que permite encarecer o hash amanhã sem
 * obrigar todo mundo a trocar de senha: cada hash carrega o custo com que
 * nasceu, e a verificação usa o dele, não o global.
 */
export async function gerarHash(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const derivado = await derivar(senha, sal, TAMANHO, CUSTO);
  return [
    "scrypt",
    CUSTO.N,
    CUSTO.r,
    CUSTO.p,
    sal.toString("base64"),
    derivado.toString("base64"),
  ].join("$");
}

/**
 * A senha corresponde ao hash? Nunca lança, nunca vaza por tempo.
 *
 * Hash malformado devolve `false` em vez de erro: um registro corrompido no
 * banco tem que negar acesso, não derrubar a rota com stack trace.
 */
export async function conferirSenha(senha: string, hashGuardado: string): Promise<boolean> {
  const partes = hashGuardado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, n, r, p, salB64, hashB64] = partes;
  const N = Number(n);
  const R = Number(r);
  const P = Number(p);
  if (!Number.isInteger(N) || !Number.isInteger(R) || !Number.isInteger(P)) return false;

  try {
    const sal = Buffer.from(salB64, "base64");
    const esperado = Buffer.from(hashB64, "base64");
    const derivado = await derivar(senha, sal, esperado.length, {
      N,
      r: R,
      p: P,
      maxmem: 256 * 1024 * 1024,
    });
    if (derivado.length !== esperado.length) return false;
    return timingSafeEqual(derivado, esperado);
  } catch {
    return false;
  }
}

/**
 * Gasta o mesmo trabalho de uma verificação real, e sempre falha.
 *
 * Sem isto, login com e-mail que não existe responde na hora e login com
 * e-mail que existe demora meio segundo - e essa diferença é um oráculo que
 * diz de graça quais e-mails têm conta. Cobrado no caminho onde o usuário não
 * foi encontrado.
 */
export async function gastarTempoDeSenha(senha: string): Promise<false> {
  await derivar(senha, Buffer.alloc(16, 7), TAMANHO, CUSTO);
  return false;
}

export interface CriticaDeSenha {
  readonly ok: boolean;
  readonly motivo?: string;
}

/**
 * A senha é aceitável?
 *
 * Regras curtas de propósito. Exigência de símbolo e maiúscula empurra a
 * pessoa para `Senha@123`, que é pior que uma frase longa: o NIST abandonou
 * essa composição obrigatória justamente por isso. O que fica é tamanho, e
 * proibir os dois erros que aparecem de verdade - repetir o e-mail e usar uma
 * senha de lista.
 */
export function criticarSenha(senha: string, email: string): CriticaDeSenha {
  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return { ok: false, motivo: `A senha precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.` };
  }
  if (senha.length > 200) {
    // Teto porque scrypt trabalha em cima do que recebe: senha de 10MB seria
    // um jeito barato de fazer o servidor gastar caro.
    return { ok: false, motivo: "A senha é longa demais." };
  }

  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 3 && senha.toLowerCase().includes(local)) {
    return { ok: false, motivo: "A senha não pode conter o seu e-mail." };
  }

  const comuns = [
    "123456789012", "senha123456", "password1234", "qwertyuiop12",
    "infuser12345", "111111111111", "abcdefghijkl",
  ];
  if (comuns.includes(senha.toLowerCase())) {
    return { ok: false, motivo: "Essa senha é fácil demais de adivinhar." };
  }

  return { ok: true };
}
