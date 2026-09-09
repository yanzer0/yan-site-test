const PAUSA_RETRY_MS = 250;
const CODIGOS_TRANSITORIOS = new Set([
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

const dormirPadrao = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function detalheSeguro(causa) {
  const raiz = causa instanceof Error && causa.cause ? causa.cause : causa;
  const codigo =
    raiz && typeof raiz === "object" && typeof raiz.code === "string"
      ? raiz.code
      : "TRANSPORT_ERROR";
  const mensagemCrua = raiz instanceof Error ? raiz.message : String(raiz ?? "erro desconhecido");
  const mensagem = mensagemCrua.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, 160);
  return { codigo, mensagem: mensagem || "erro desconhecido" };
}

class ErroTransporteApi extends Error {
  constructor(caminho, causa) {
    const detalhe = detalheSeguro(causa);
    super(`transporte da API falhou em ${caminho}: ${detalhe.codigo}: ${detalhe.mensagem}`, {
      cause: causa,
    });
    this.name = "ErroTransporteApi";
    this.codigo = detalhe.codigo;
    this.detalhe = detalhe;
  }
}

/**
 * Calls the worker API without keeping a connection across model generation.
 *
 * `GET /fila` reserves work, so callers must leave retry disabled there. The
 * completion POST is idempotent by `cal_booking_id` and may opt into one local
 * retry for a transient transport failure.
 */
export async function chamarApi({
  baseUrl,
  segredo,
  caminho,
  opcoes = {},
  repetirFalhaTransitoria = false,
  fetchFn = globalThis.fetch,
  dormir = dormirPadrao,
  aoRepetir = () => {},
}) {
  const executar = async () => {
    let resposta;
    try {
      resposta = await fetchFn(`${baseUrl}${caminho}`, {
        ...opcoes,
        headers: {
          ...opcoes.headers,
          "x-roteiro-secret": segredo,
          "Content-Type": "application/json",
          Connection: "close",
        },
      });
    } catch (causa) {
      throw new ErroTransporteApi(caminho, causa);
    }

    const corpo = await resposta.json().catch(() => ({}));
    return { ok: resposta.ok, status: resposta.status, corpo };
  };

  try {
    return await executar();
  } catch (erro) {
    const podeRepetir =
      repetirFalhaTransitoria &&
      erro instanceof ErroTransporteApi &&
      CODIGOS_TRANSITORIOS.has(erro.codigo);
    if (!podeRepetir) throw erro;

    aoRepetir({ caminho, ...erro.detalhe });
    await dormir(PAUSA_RETRY_MS);
    return executar();
  }
}
