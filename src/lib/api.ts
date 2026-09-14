import "server-only";

import type { Escopo, Linha, RespostaApi } from "./types";

const ENDPOINT =
  process.env.API_PESQUISAS_URL ??
  "https://api-rac-n-play.vercel.app/api/data/all?event=pesquisa";

export class ErroApi extends Error {
  constructor(
    message: string,
    readonly causaTecnica?: string,
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

/** Busca as linhas brutas da API de pesquisas. */
export async function buscarLinhas(): Promise<Linha[]> {
  let resposta: Response;
  try {
    resposta = await fetch(ENDPOINT, {
      headers: { accept: "application/json" },
      // Revalida a cada 5 min; o botão "Atualizar" força um refetch.
      next: { revalidate: 300, tags: ["pesquisas"] },
    });
  } catch (erro) {
    throw new ErroApi("Não foi possível alcançar a API de pesquisas.", String(erro));
  }

  if (!resposta.ok) {
    throw new ErroApi(
      `A API de pesquisas respondeu ${resposta.status}.`,
      `${resposta.status} ${resposta.statusText}`,
    );
  }

  const json = (await resposta.json()) as RespostaApi;
  const tabela = json?.tables?.dados_respostas_pesquisas;

  if (!json?.success || !tabela || !Array.isArray(tabela.data)) {
    throw new ErroApi("A API respondeu em um formato inesperado.");
  }

  return tabela.data;
}

/**
 * Recorta as linhas para o escopo da sessão.
 *
 * Isto roda **no servidor**: uma sessão de matriz nunca recebe no navegador
 * as linhas de outra matriz — a divisão é de dados, não apenas visual.
 */
export function aplicarEscopo(linhas: Linha[], escopo: Escopo): Linha[] {
  if (escopo.tipo === "admin") return linhas;
  return linhas.filter((l) => l.matriz === escopo.matriz);
}
