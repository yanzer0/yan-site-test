export async function lerCorpoLimitado(req: Request, limite: number): Promise<string> {
  if (Number(req.headers.get("content-length") ?? 0) > limite) throw new Error("body_too_large");
  const leitor = req.body?.getReader();
  if (!leitor) throw new Error("invalid_body");
  const decoder = new TextDecoder();
  let tamanho = 0, texto = "";
  while (true) {
    const parte = await leitor.read(); if (parte.done) break;
    tamanho += parte.value.byteLength;
    if (tamanho > limite) { await leitor.cancel(); throw new Error("body_too_large"); }
    texto += decoder.decode(parte.value, { stream: true });
  }
  return texto + decoder.decode();
}
