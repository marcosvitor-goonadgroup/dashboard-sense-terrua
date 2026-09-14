import type { Linha } from "./types";

/* ------------------------------------------------------------------ *
 * Regras de contagem
 *
 * · Uma "linha" é a nota de UMA pergunta.
 * · `nota == null` significa que a seção foi marcada como não aplicável
 *   (ou que o jurídico não participou) — essas linhas nunca entram em médias.
 * · Um "respondente" é um `resposta_id` distinto.
 * · Uma "pesquisa" é um `pesquisa_id` distinto (um evento avaliado).
 * ------------------------------------------------------------------ */

export const comNota = (linhas: Linha[]) => linhas.filter((l) => l.nota != null);

const media = (valores: number[]): number | null =>
  valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length;

const mediaDeLinhas = (linhas: Linha[]) => media(comNota(linhas).map((l) => l.nota as number));

const distintos = <T>(itens: T[]) => Array.from(new Set(itens));

function agrupar<T>(itens: T[], chave: (item: T) => string): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const k = chave(item);
    const atual = mapa.get(k);
    if (atual) atual.push(item);
    else mapa.set(k, [item]);
  }
  return mapa;
}

export type Distribuicao = { nota: 1 | 2 | 3 | 4 | 5; quantidade: number; parcela: number }[];

export function distribuicao(linhas: Linha[]): Distribuicao {
  const validas = comNota(linhas);
  const total = validas.length;
  return ([1, 2, 3, 4, 5] as const).map((nota) => {
    const quantidade = validas.filter((l) => l.nota === nota).length;
    return { nota, quantidade, parcela: total === 0 ? 0 : quantidade / total };
  });
}

export type Resumo = {
  mediaGeral: number | null;
  totalNotas: number;
  satisfacao: number | null; // parcela de notas 4–5
  criticas: number | null; // parcela de notas 1–2
  respondentes: number;
  pesquisas: number;
  eventos: number;
  matrizes: number;
  clientes: number;
  naoAplicaveis: number; // perguntas puladas por "não se aplica"
  comentarios: number;
};

export function resumo(linhas: Linha[]): Resumo {
  const validas = comNota(linhas);
  const total = validas.length;
  const altas = validas.filter((l) => (l.nota as number) >= 4).length;
  const baixas = validas.filter((l) => (l.nota as number) <= 2).length;

  return {
    mediaGeral: media(validas.map((l) => l.nota as number)),
    totalNotas: total,
    satisfacao: total === 0 ? null : altas / total,
    criticas: total === 0 ? null : baixas / total,
    respondentes: distintos(linhas.map((l) => l.resposta_id)).length,
    pesquisas: distintos(linhas.map((l) => l.pesquisa_id)).length,
    eventos: distintos(linhas.map((l) => l.evento)).length,
    matrizes: distintos(linhas.map((l) => l.matriz)).length,
    clientes: distintos(linhas.map((l) => l.cliente)).length,
    naoAplicaveis: linhas.filter((l) => l.nota == null).length,
    comentarios: comentarios(linhas).length,
  };
}

export type ItemSecao = {
  codigo: string;
  nome: string;
  ordem: number;
  media: number | null;
  totalNotas: number;
  naoAplicaveis: number;
  distribuicao: Distribuicao;
};

export function porSecao(linhas: Linha[]): ItemSecao[] {
  return Array.from(agrupar(linhas, (l) => l.secao_codigo).entries())
    .map(([codigo, doGrupo]) => ({
      codigo,
      nome: doGrupo[0].secao,
      ordem: doGrupo[0].secao_ordem,
      media: mediaDeLinhas(doGrupo),
      totalNotas: comNota(doGrupo).length,
      naoAplicaveis: doGrupo.filter((l) => l.nota == null).length,
      distribuicao: distribuicao(doGrupo),
    }))
    .sort((a, b) => a.ordem - b.ordem);
}

export type ItemEvento = {
  pesquisaId: string;
  evento: string;
  cliente: string;
  matriz: string;
  gerente: string | null;
  assessor: string | null;
  dataEvento: string | null;
  dataResposta: string | null;
  media: number | null;
  totalNotas: number;
  respondentes: number;
  secoes: ItemSecao[];
};

export function porEvento(linhas: Linha[]): ItemEvento[] {
  return Array.from(agrupar(linhas, (l) => l.pesquisa_id).entries())
    .map(([pesquisaId, doGrupo]) => {
      const primeira = doGrupo[0];
      const respostas = doGrupo
        .map((l) => l.data_resposta)
        .filter((d): d is string => Boolean(d))
        .sort();
      return {
        pesquisaId,
        evento: primeira.evento,
        cliente: primeira.cliente,
        matriz: primeira.matriz,
        gerente: primeira.gerente,
        assessor: primeira.assessor,
        dataEvento: primeira.data_evento,
        dataResposta: respostas.at(-1) ?? null,
        media: mediaDeLinhas(doGrupo),
        totalNotas: comNota(doGrupo).length,
        respondentes: distintos(doGrupo.map((l) => l.resposta_id)).length,
        secoes: porSecao(doGrupo),
      };
    })
    .sort((a, b) => (b.media ?? -1) - (a.media ?? -1));
}

export type ItemMatriz = {
  matriz: string;
  media: number | null;
  totalNotas: number;
  pesquisas: number;
  respondentes: number;
  clientes: number;
  satisfacao: number | null;
};

export function porMatriz(linhas: Linha[]): ItemMatriz[] {
  return Array.from(agrupar(linhas, (l) => l.matriz).entries())
    .map(([matriz, doGrupo]) => {
      const validas = comNota(doGrupo);
      const altas = validas.filter((l) => (l.nota as number) >= 4).length;
      return {
        matriz,
        media: mediaDeLinhas(doGrupo),
        totalNotas: validas.length,
        pesquisas: distintos(doGrupo.map((l) => l.pesquisa_id)).length,
        respondentes: distintos(doGrupo.map((l) => l.resposta_id)).length,
        clientes: distintos(doGrupo.map((l) => l.cliente)).length,
        satisfacao: validas.length === 0 ? null : altas / validas.length,
      };
    })
    .sort((a, b) => (b.media ?? -1) - (a.media ?? -1));
}

export type ItemProfissional = {
  nome: string;
  media: number | null;
  totalNotas: number;
  satisfacao: number | null;
  pesquisas: number;
  respondentes: number;
  clientes: number;
  matrizes: number;
  melhorSecao: { nome: string; media: number } | null;
  piorSecao: { nome: string; media: number } | null;
};

export const SEM_RESPONSAVEL = "Não informado";

/**
 * Desempenho por profissional (gerente ou assessor).
 *
 * A nota é do projeto, não da pessoa: ela responde "como foram avaliados os
 * eventos que passaram por este profissional". Por isso `pesquisas` e
 * `totalNotas` viajam junto — uma média de 5,00 sobre 4 notas não diz o mesmo
 * que 4,80 sobre 40.
 */
export function porProfissional(
  linhas: Linha[],
  campo: "gerente" | "assessor",
): ItemProfissional[] {
  return Array.from(agrupar(linhas, (l) => l[campo] ?? SEM_RESPONSAVEL).entries())
    .map(([nome, doGrupo]) => {
      const validas = comNota(doGrupo);
      const altas = validas.filter((l) => (l.nota as number) >= 4).length;

      const secoesOrdenadas = porSecao(doGrupo)
        .filter((s): s is ItemSecao & { media: number } => s.media != null && s.totalNotas > 0)
        .sort((a, b) => b.media - a.media);

      return {
        nome,
        media: mediaDeLinhas(doGrupo),
        totalNotas: validas.length,
        satisfacao: validas.length === 0 ? null : altas / validas.length,
        pesquisas: distintos(doGrupo.map((l) => l.pesquisa_id)).length,
        respondentes: distintos(doGrupo.map((l) => l.resposta_id)).length,
        clientes: distintos(doGrupo.map((l) => l.cliente)).length,
        matrizes: distintos(doGrupo.map((l) => l.matriz)).length,
        melhorSecao: secoesOrdenadas.at(0)
          ? { nome: secoesOrdenadas[0].nome, media: secoesOrdenadas[0].media }
          : null,
        // Só faz sentido apontar o ponto fraco quando há mais de uma seção a comparar.
        piorSecao:
          secoesOrdenadas.length > 1
            ? {
                nome: secoesOrdenadas[secoesOrdenadas.length - 1].nome,
                media: secoesOrdenadas[secoesOrdenadas.length - 1].media,
              }
            : null,
      };
    })
    .sort((a, b) => (b.media ?? -1) - (a.media ?? -1));
}

export type ItemCliente = {
  cliente: string;
  matriz: string;
  media: number | null;
  totalNotas: number;
  pesquisas: number;
};

export function porCliente(linhas: Linha[]): ItemCliente[] {
  return Array.from(agrupar(linhas, (l) => l.cliente).entries())
    .map(([cliente, doGrupo]) => ({
      cliente,
      matriz: distintos(doGrupo.map((l) => l.matriz)).join(", "),
      media: mediaDeLinhas(doGrupo),
      totalNotas: comNota(doGrupo).length,
      pesquisas: distintos(doGrupo.map((l) => l.pesquisa_id)).length,
    }))
    .sort((a, b) => (b.media ?? -1) - (a.media ?? -1));
}

export type ItemPergunta = {
  pergunta: string;
  secao: string;
  secaoCodigo: string;
  media: number | null;
  totalNotas: number;
};

export function porPergunta(linhas: Linha[]): ItemPergunta[] {
  return Array.from(agrupar(comNota(linhas), (l) => `${l.secao_codigo}::${l.pergunta}`).entries())
    .map(([, doGrupo]) => ({
      pergunta: doGrupo[0].pergunta,
      secao: doGrupo[0].secao,
      secaoCodigo: doGrupo[0].secao_codigo,
      media: mediaDeLinhas(doGrupo),
      totalNotas: doGrupo.length,
    }))
    .sort((a, b) => (b.media ?? -1) - (a.media ?? -1));
}

export type Heatmap = {
  colunas: { chave: string; rotulo: string; sublegenda: string }[];
  linhas: {
    chave: string;
    rotulo: string;
    celulas: { chave: string; media: number | null; totalNotas: number; naoAplicavel: boolean }[];
  }[];
};

/** Grade seção × evento com a média de cada cruzamento (magnitude → rampa sequencial). */
export function heatmapSecaoEvento(linhas: Linha[]): Heatmap {
  const eventos = porEvento(linhas).sort((a, b) =>
    (a.dataEvento ?? "").localeCompare(b.dataEvento ?? "") || a.evento.localeCompare(b.evento),
  );
  const secoes = porSecao(linhas);

  return {
    colunas: eventos.map((e) => ({
      chave: e.pesquisaId,
      rotulo: e.evento,
      sublegenda: e.cliente,
    })),
    linhas: secoes.map((s) => ({
      chave: s.codigo,
      rotulo: s.nome,
      celulas: eventos.map((e) => {
        const recorte = linhas.filter(
          (l) => l.pesquisa_id === e.pesquisaId && l.secao_codigo === s.codigo,
        );
        return {
          chave: e.pesquisaId,
          media: mediaDeLinhas(recorte),
          totalNotas: comNota(recorte).length,
          naoAplicavel: recorte.length > 0 && recorte.every((l) => l.nota == null),
        };
      }),
    })),
  };
}

export type Comentario = {
  id: string;
  texto: string;
  secao: string;
  secaoCodigo: string;
  evento: string;
  cliente: string;
  matriz: string;
  respondente: string | null;
  cargo: string | null;
  dataResposta: string | null;
  mediaSecao: number | null;
};

/** Um comentário por (resposta, seção) — a API repete o texto em cada pergunta. */
export function comentarios(linhas: Linha[]): Comentario[] {
  const vistos = new Map<string, Comentario>();

  for (const l of linhas) {
    const texto = l.comentario_secao?.trim();
    if (!texto) continue;

    const id = `${l.resposta_id}::${l.secao_codigo}`;
    if (vistos.has(id)) continue;

    const daSecao = linhas.filter(
      (o) => o.resposta_id === l.resposta_id && o.secao_codigo === l.secao_codigo,
    );

    vistos.set(id, {
      id,
      texto,
      secao: l.secao,
      secaoCodigo: l.secao_codigo,
      evento: l.evento,
      cliente: l.cliente,
      matriz: l.matriz,
      respondente: l.nome_respondente,
      cargo: l.cargo_respondente,
      dataResposta: l.data_resposta,
      mediaSecao: mediaDeLinhas(daSecao),
    });
  }

  return Array.from(vistos.values()).sort((a, b) =>
    (b.dataResposta ?? "").localeCompare(a.dataResposta ?? ""),
  );
}

export type Facetas = {
  matrizes: string[];
  clientes: string[];
  eventos: string[];
  gerentes: string[];
  assessores: string[];
  secoes: { codigo: string; nome: string }[];
};

export function facetas(linhas: Linha[]): Facetas {
  const ordenar = (v: string[]) =>
    distintos(v)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));

  return {
    matrizes: ordenar(linhas.map((l) => l.matriz)),
    clientes: ordenar(linhas.map((l) => l.cliente)),
    eventos: ordenar(linhas.map((l) => l.evento)),
    gerentes: ordenar(linhas.map((l) => l.gerente ?? SEM_RESPONSAVEL)),
    assessores: ordenar(linhas.map((l) => l.assessor ?? SEM_RESPONSAVEL)),
    secoes: porSecao(linhas).map((s) => ({ codigo: s.codigo, nome: s.nome })),
  };
}
