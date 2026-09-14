"use client";

import { useMemo, useState } from "react";

import { BarrasRanking, type ItemBarra } from "@/components/charts/BarrasRanking";
import { HeatmapSecoes } from "@/components/charts/HeatmapSecoes";
import { LikertDivergente } from "@/components/charts/LikertDivergente";
import { Comentarios } from "@/components/Comentarios";
import { FILTROS_VAZIOS, Filtros, type EstadoFiltros } from "@/components/Filtros";
import { Cartao } from "@/components/ui/Cartao";
import { Heroi, Medidor, SeloFaixa } from "@/components/ui/Indicadores";
import { Tabela } from "@/components/ui/Tabela";
import { dataCurta, nota2, numero, percentual } from "@/lib/format";
import {
  comentarios,
  facetas,
  heatmapSecaoEvento,
  porEvento,
  porMatriz,
  porPergunta,
  porProfissional,
  porSecao,
  resumo,
  SEM_RESPONSAVEL,
  type ItemEvento,
  type ItemMatriz,
  type ItemPergunta,
  type ItemProfissional,
  type ItemSecao,
} from "@/lib/metrics";
import type { Escopo, Linha } from "@/lib/types";

export function DashboardClient({ linhas, escopo }: { linhas: Linha[]; escopo: Escopo }) {
  const [filtros, setFiltros] = useState<EstadoFiltros>(FILTROS_VAZIOS);

  const facetasDisponiveis = useMemo(() => facetas(linhas), [linhas]);

  const recorte = useMemo(
    () =>
      linhas.filter(
        (l) =>
          (!filtros.matriz || l.matriz === filtros.matriz) &&
          (!filtros.cliente || l.cliente === filtros.cliente) &&
          (!filtros.evento || l.evento === filtros.evento) &&
          (!filtros.gerente || (l.gerente ?? SEM_RESPONSAVEL) === filtros.gerente) &&
          (!filtros.assessor || (l.assessor ?? SEM_RESPONSAVEL) === filtros.assessor) &&
          (!filtros.secao || l.secao_codigo === filtros.secao),
      ),
    [linhas, filtros],
  );

  const m = useMemo(
    () => ({
      geral: resumo(recorte),
      secoes: porSecao(recorte),
      eventos: porEvento(recorte),
      matrizes: porMatriz(recorte),
      gerentes: porProfissional(recorte, "gerente"),
      assessores: porProfissional(recorte, "assessor"),
      perguntas: porPergunta(recorte),
      heatmap: heatmapSecaoEvento(recorte),
      comentarios: comentarios(recorte),
    }),
    [recorte],
  );

  const ehAdmin = escopo.tipo === "admin";
  const atencao = [...m.perguntas].reverse().slice(0, 6);

  if (linhas.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-[15px] font-semibold text-ink-1">Nenhuma pesquisa disponível</p>
        <p className="mt-1.5 text-[13px] text-ink-2">
          {ehAdmin
            ? "A API não retornou respostas de pesquisa."
            : `Ainda não há respostas registradas para ${escopo.matriz}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Filtros
        facetas={facetasDisponiveis}
        valor={filtros}
        aoMudar={setFiltros}
        mostrarMatriz={ehAdmin}
      />

      {recorte.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[15px] font-semibold text-ink-1">Nenhum registro neste recorte</p>
          <p className="mt-1.5 text-[13px] text-ink-2">Ajuste ou limpe os filtros acima.</p>
        </div>
      ) : (
        <>
          {/* ── Painel-resumo: uma figura-herói + ladrilhos ─────────────── */}
          <section className="card overflow-hidden">
            <div className="grid gap-px bg-[var(--border)] md:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
              <div className="bg-surface p-6">
                <Heroi
                  valor={nota2(m.geral.mediaGeral)}
                  unidade="/ 5,00"
                  rotulo="Nota média geral"
                  apoio={
                    <div className="space-y-3">
                      <SeloFaixa media={m.geral.mediaGeral} />
                      <Medidor valor={m.geral.mediaGeral} rotulo="Posição na escala" />
                      <p className="text-[12px] text-ink-3">
                        Base: {numero(m.geral.totalNotas)} notas respondidas
                        {m.geral.naoAplicaveis > 0
                          ? ` · ${numero(m.geral.naoAplicaveis)} perguntas não aplicáveis`
                          : ""}
                      </p>
                    </div>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-px bg-[var(--border)] lg:grid-cols-3">
                <Celula
                  rotulo="Satisfação"
                  valor={percentual(m.geral.satisfacao)}
                  apoio="Notas 4 e 5"
                />
                <Celula
                  rotulo="Notas críticas"
                  valor={percentual(m.geral.criticas)}
                  apoio="Notas 1 e 2"
                />
                <Celula
                  rotulo="Respondentes"
                  valor={numero(m.geral.respondentes)}
                  apoio={`${numero(m.geral.pesquisas)} pesquisas`}
                />
                <Celula
                  rotulo="Eventos avaliados"
                  valor={numero(m.geral.eventos)}
                  apoio={`${numero(m.geral.clientes)} clientes`}
                />
                <Celula
                  rotulo={ehAdmin ? "Matrizes" : "Seções avaliadas"}
                  valor={numero(ehAdmin ? m.geral.matrizes : m.secoes.length)}
                  apoio={ehAdmin ? "Com respostas" : "Com ao menos uma nota"}
                />
                <Celula
                  rotulo="Comentários"
                  valor={numero(m.geral.comentarios)}
                  apoio="Texto livre por seção"
                />
              </div>
            </div>
          </section>

          {/* ── Seções ──────────────────────────────────────────────────── */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Cartao
              titulo="Desempenho por seção"
              descricao="Média das notas de cada etapa do projeto, de 1 a 5."
              tabela={<TabelaSecoes itens={m.secoes} />}
            >
              <BarrasRanking
                itens={m.secoes.map(
                  (s): ItemBarra => ({
                    chave: s.codigo,
                    rotulo: s.nome,
                    valor: s.media,
                    totalNotas: s.totalNotas,
                    detalhes: [
                      {
                        rotulo: "Satisfação",
                        valor: percentual(
                          s.distribuicao
                            .filter((d) => d.nota >= 4)
                            .reduce((a, d) => a + d.parcela, 0),
                        ),
                      },
                      { rotulo: "Não aplicáveis", valor: numero(s.naoAplicaveis) },
                    ],
                  }),
                )}
              />
            </Cartao>

            <Cartao
              titulo="Distribuição das notas por seção"
              descricao="Escala ordenada centrada no neutro: à esquerda as notas 1 e 2, à direita as 4 e 5."
              tabela={<TabelaDistribuicao itens={m.secoes} />}
            >
              <LikertDivergente
                linhas={m.secoes.map((s) => ({
                  chave: s.codigo,
                  rotulo: s.nome,
                  sublegenda: `${numero(s.totalNotas)} notas`,
                  distribuicao: s.distribuicao,
                  totalNotas: s.totalNotas,
                }))}
              />
            </Cartao>
          </div>

          {/* ── Grade seção × evento ────────────────────────────────────── */}
          <Cartao
            titulo="Seção × evento"
            descricao="Onde cada evento foi forte e onde ficou devendo. Quanto mais escuro, maior a média."
            tabela={<TabelaHeatmap itens={m.eventos} />}
          >
            <HeatmapSecoes dados={m.heatmap} />
          </Cartao>

          {/* ── Eventos e matrizes ──────────────────────────────────────── */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Cartao
              titulo="Desempenho por evento"
              descricao="Média geral de cada pesquisa respondida."
              tabela={<TabelaEventos itens={m.eventos} mostrarMatriz={ehAdmin} />}
            >
              <BarrasRanking
                itens={m.eventos.map(
                  (e): ItemBarra => ({
                    chave: e.pesquisaId,
                    rotulo: e.evento,
                    sublegenda: ehAdmin ? `${e.cliente} · ${e.matriz}` : e.cliente,
                    valor: e.media,
                    totalNotas: e.totalNotas,
                    detalhes: [
                      { rotulo: "Respondentes", valor: numero(e.respondentes) },
                      { rotulo: "Data do evento", valor: dataCurta(e.dataEvento) },
                      { rotulo: "Gerente", valor: e.gerente ?? "—" },
                    ],
                  }),
                )}
              />
            </Cartao>

            {ehAdmin ? (
              <Cartao
                titulo="Comparativo entre matrizes"
                descricao="Média geral de cada matriz no recorte selecionado."
                tabela={<TabelaMatrizes itens={m.matrizes} />}
              >
                <BarrasRanking
                  itens={m.matrizes.map(
                    (mz): ItemBarra => ({
                      chave: mz.matriz,
                      rotulo: mz.matriz,
                      sublegenda: `${numero(mz.pesquisas)} pesquisas · ${numero(mz.clientes)} clientes`,
                      valor: mz.media,
                      totalNotas: mz.totalNotas,
                      detalhes: [
                        { rotulo: "Satisfação", valor: percentual(mz.satisfacao) },
                        { rotulo: "Respondentes", valor: numero(mz.respondentes) },
                      ],
                    }),
                  )}
                  larguraRotulo="10rem"
                />
              </Cartao>
            ) : (
              <Cartao
                titulo="Pontos de atenção"
                descricao="As perguntas com menor média — onde a matriz tem mais a ganhar."
                tabela={<TabelaPerguntas itens={m.perguntas} />}
              >
                <BarrasRanking itens={atencao.map(paraBarraPergunta)} larguraRotulo="20rem" duasLinhas />
              </Cartao>
            )}
          </div>

          {/* ── Equipe: gerentes e assessores ─────────────────────────────
              Largura total: a visão de tabela tem oito colunas e, em meia
              largura, escondia justamente "seção mais forte / mais fraca". */}
          <Cartao
            titulo="Desempenho por gerente"
            descricao="Média dos eventos conduzidos por cada gerente. A tabela mostra a seção mais forte e a mais fraca de cada um."
            tabela={
              <TabelaProfissionais itens={m.gerentes} papel="Gerente" mostrarMatrizes={ehAdmin} />
            }
          >
            <BarrasRanking
              itens={m.gerentes.map((p) => paraBarraProfissional(p, ehAdmin))}
              larguraRotulo="16rem"
            />
          </Cartao>

          <Cartao
            titulo="Desempenho por assessor"
            descricao="Média dos eventos atendidos por cada assessor. A tabela mostra a seção mais forte e a mais fraca de cada um."
            tabela={
              <TabelaProfissionais itens={m.assessores} papel="Assessor" mostrarMatrizes={ehAdmin} />
            }
          >
            <BarrasRanking
              itens={m.assessores.map((p) => paraBarraProfissional(p, ehAdmin))}
              larguraRotulo="16rem"
            />
          </Cartao>

          {ehAdmin ? (
            <Cartao
              titulo="Pontos de atenção"
              descricao="As perguntas com menor média em todo o recorte. A tabela traz as demais."
              tabela={<TabelaPerguntas itens={m.perguntas} />}
            >
              <BarrasRanking itens={atencao.map(paraBarraPergunta)} larguraRotulo="32rem" duasLinhas />
            </Cartao>
          ) : null}

          {/* ── Comentários e detalhe ───────────────────────────────────── */}
          <Cartao
            titulo="Comentários dos respondentes"
            descricao="Texto livre deixado ao final de cada seção."
          >
            <Comentarios itens={m.comentarios} mostrarMatriz={ehAdmin} />
          </Cartao>

          <Cartao titulo="Eventos avaliados" descricao="Ficha completa de cada pesquisa.">
            <TabelaEventos itens={m.eventos} mostrarMatriz={ehAdmin} detalhado />
          </Cartao>
        </>
      )}
    </div>
  );
}

function Celula({ rotulo, valor, apoio }: { rotulo: string; valor: string; apoio: string }) {
  return (
    <div className="bg-surface p-4">
      <p className="text-[12px] font-medium text-ink-2">{rotulo}</p>
      <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-ink-1">
        {valor}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-3">{apoio}</p>
    </div>
  );
}

const plural = (n: number, singular: string, plural: string) =>
  `${numero(n)} ${n === 1 ? singular : plural}`;

const paraBarraProfissional = (p: ItemProfissional, mostrarMatrizes: boolean): ItemBarra => ({
  chave: p.nome,
  rotulo: p.nome,
  sublegenda: `${plural(p.pesquisas, "pesquisa", "pesquisas")} · ${plural(p.clientes, "cliente", "clientes")}`,
  valor: p.media,
  totalNotas: p.totalNotas,
  detalhes: [
    { rotulo: "Satisfação", valor: percentual(p.satisfacao) },
    { rotulo: "Respondentes", valor: numero(p.respondentes) },
    ...(mostrarMatrizes ? [{ rotulo: "Matrizes", valor: numero(p.matrizes) }] : []),
    ...(p.melhorSecao
      ? [
          {
            rotulo: "Seção mais forte",
            valor: `${p.melhorSecao.nome} · ${nota2(p.melhorSecao.media)}`,
          },
        ]
      : []),
    ...(p.piorSecao
      ? [
          {
            rotulo: "Seção mais fraca",
            valor: `${p.piorSecao.nome} · ${nota2(p.piorSecao.media)}`,
          },
        ]
      : []),
  ],
});

const paraBarraPergunta = (p: ItemPergunta): ItemBarra => ({
  chave: `${p.secaoCodigo}::${p.pergunta}`,
  rotulo: p.pergunta,
  sublegenda: p.secao,
  valor: p.media,
  totalNotas: p.totalNotas,
});

/* ── Gêmeos em tabela ─────────────────────────────────────────────────── */

function TabelaSecoes({ itens }: { itens: ItemSecao[] }) {
  return (
    <Tabela
      itens={itens}
      chave={(s) => s.codigo}
      legenda="Média por seção"
      colunas={[
        { chave: "secao", cabecalho: "Seção", celula: (s) => s.nome },
        { chave: "media", cabecalho: "Média", alinhar: "direita", celula: (s) => nota2(s.media) },
        {
          chave: "faixa",
          cabecalho: "Faixa",
          celula: (s) => <SeloFaixa media={s.media} compacto />,
        },
        {
          chave: "n",
          cabecalho: "Notas",
          alinhar: "direita",
          celula: (s) => numero(s.totalNotas),
        },
        {
          chave: "na",
          cabecalho: "Não aplic.",
          alinhar: "direita",
          celula: (s) => numero(s.naoAplicaveis),
        },
      ]}
    />
  );
}

function TabelaDistribuicao({ itens }: { itens: ItemSecao[] }) {
  return (
    <Tabela
      itens={itens}
      chave={(s) => s.codigo}
      legenda="Distribuição das notas por seção"
      colunas={[
        { chave: "secao", cabecalho: "Seção", celula: (s) => s.nome },
        ...([1, 2, 3, 4, 5] as const).map((n) => ({
          chave: `n${n}`,
          cabecalho: `Nota ${n}`,
          alinhar: "direita" as const,
          celula: (s: ItemSecao) => {
            const d = s.distribuicao.find((x) => x.nota === n);
            return d && d.quantidade > 0 ? `${numero(d.quantidade)} (${percentual(d.parcela)})` : "—";
          },
        })),
        {
          chave: "total",
          cabecalho: "Total",
          alinhar: "direita",
          celula: (s) => numero(s.totalNotas),
        },
      ]}
    />
  );
}

function TabelaHeatmap({ itens }: { itens: ItemEvento[] }) {
  const secoes = Array.from(
    new Map(itens.flatMap((e) => e.secoes).map((s) => [s.codigo, s])).values(),
  ).sort((a, b) => a.ordem - b.ordem);

  return (
    <Tabela
      itens={itens}
      chave={(e) => e.pesquisaId}
      legenda="Média por seção em cada evento"
      colunas={[
        { chave: "evento", cabecalho: "Evento", celula: (e) => e.evento },
        { chave: "cliente", cabecalho: "Cliente", celula: (e) => e.cliente },
        ...secoes.map((sec) => ({
          chave: sec.codigo,
          cabecalho: sec.nome,
          alinhar: "direita" as const,
          celula: (e: ItemEvento) => {
            const s = e.secoes.find((x) => x.codigo === sec.codigo);
            if (!s) return "—";
            return s.media == null ? "N/A" : nota2(s.media);
          },
        })),
      ]}
    />
  );
}

function TabelaEventos({
  itens,
  mostrarMatriz,
  detalhado = false,
}: {
  itens: ItemEvento[];
  mostrarMatriz: boolean;
  detalhado?: boolean;
}) {
  return (
    <Tabela
      itens={itens}
      chave={(e) => e.pesquisaId}
      legenda="Eventos avaliados"
      colunas={[
        { chave: "evento", cabecalho: "Evento", celula: (e) => e.evento },
        { chave: "cliente", cabecalho: "Cliente", celula: (e) => e.cliente },
        ...(mostrarMatriz
          ? [{ chave: "matriz", cabecalho: "Matriz", celula: (e: ItemEvento) => e.matriz }]
          : []),
        ...(detalhado
          ? [
              {
                chave: "data",
                cabecalho: "Data",
                celula: (e: ItemEvento) => dataCurta(e.dataEvento),
              },
              {
                chave: "gerente",
                cabecalho: "Gerente",
                celula: (e: ItemEvento) => e.gerente ?? "—",
              },
              {
                chave: "assessor",
                cabecalho: "Assessor",
                celula: (e: ItemEvento) => e.assessor ?? "—",
              },
            ]
          : []),
        { chave: "media", cabecalho: "Média", alinhar: "direita", celula: (e) => nota2(e.media) },
        {
          chave: "faixa",
          cabecalho: "Faixa",
          celula: (e) => <SeloFaixa media={e.media} compacto />,
        },
        {
          chave: "resp",
          cabecalho: "Respond.",
          alinhar: "direita",
          celula: (e) => numero(e.respondentes),
        },
      ]}
    />
  );
}

function TabelaMatrizes({ itens }: { itens: ItemMatriz[] }) {
  return (
    <Tabela
      itens={itens}
      chave={(m) => m.matriz}
      legenda="Comparativo entre matrizes"
      colunas={[
        { chave: "matriz", cabecalho: "Matriz", celula: (m) => m.matriz },
        { chave: "media", cabecalho: "Média", alinhar: "direita", celula: (m) => nota2(m.media) },
        {
          chave: "sat",
          cabecalho: "Satisfação",
          alinhar: "direita",
          celula: (m) => percentual(m.satisfacao),
        },
        {
          chave: "pesq",
          cabecalho: "Pesquisas",
          alinhar: "direita",
          celula: (m) => numero(m.pesquisas),
        },
        {
          chave: "resp",
          cabecalho: "Respond.",
          alinhar: "direita",
          celula: (m) => numero(m.respondentes),
        },
      ]}
    />
  );
}

function TabelaProfissionais({
  itens,
  papel,
  mostrarMatrizes,
}: {
  itens: ItemProfissional[];
  papel: string;
  mostrarMatrizes: boolean;
}) {
  return (
    <Tabela
      itens={itens}
      chave={(p) => p.nome}
      legenda={`Desempenho por ${papel.toLowerCase()}`}
      colunas={[
        { chave: "nome", cabecalho: papel, celula: (p) => p.nome },
        { chave: "media", cabecalho: "Média", alinhar: "direita", celula: (p) => nota2(p.media) },
        {
          chave: "faixa",
          cabecalho: "Faixa",
          celula: (p) => <SeloFaixa media={p.media} compacto />,
        },
        {
          chave: "sat",
          cabecalho: "Satisfação",
          alinhar: "direita",
          celula: (p) => percentual(p.satisfacao),
        },
        {
          chave: "pesq",
          cabecalho: "Pesquisas",
          alinhar: "direita",
          celula: (p) => numero(p.pesquisas),
        },
        {
          chave: "notas",
          cabecalho: "Notas",
          alinhar: "direita",
          celula: (p) => numero(p.totalNotas),
        },
        ...(mostrarMatrizes
          ? [
              {
                chave: "matrizes",
                cabecalho: "Matrizes",
                alinhar: "direita" as const,
                celula: (p: ItemProfissional) => numero(p.matrizes),
              },
            ]
          : []),
        {
          chave: "melhor",
          cabecalho: "Seção mais forte",
          celula: (p) =>
            p.melhorSecao ? `${p.melhorSecao.nome} (${nota2(p.melhorSecao.media)})` : "—",
        },
        {
          chave: "pior",
          cabecalho: "Seção mais fraca",
          celula: (p) => (p.piorSecao ? `${p.piorSecao.nome} (${nota2(p.piorSecao.media)})` : "—"),
        },
      ]}
    />
  );
}

function TabelaPerguntas({ itens }: { itens: ItemPergunta[] }) {
  const crescente = [...itens].reverse();
  return (
    <Tabela
      itens={crescente}
      chave={(p) => `${p.secaoCodigo}::${p.pergunta}`}
      legenda="Média por pergunta"
      colunas={[
        { chave: "pergunta", cabecalho: "Pergunta", celula: (p) => p.pergunta },
        { chave: "secao", cabecalho: "Seção", celula: (p) => p.secao },
        { chave: "media", cabecalho: "Média", alinhar: "direita", celula: (p) => nota2(p.media) },
        {
          chave: "n",
          cabecalho: "Notas",
          alinhar: "direita",
          celula: (p) => numero(p.totalNotas),
        },
      ]}
    />
  );
}
