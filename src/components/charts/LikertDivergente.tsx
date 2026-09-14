"use client";

import { Dica, useDica } from "@/components/ui/Dica";
import { numero, percentual } from "@/lib/format";
import type { Distribuicao } from "@/lib/metrics";

export type LinhaLikert = {
  chave: string;
  rotulo: string;
  sublegenda?: string;
  distribuicao: Distribuicao;
  totalNotas: number;
};

const CORES: Record<number, string> = {
  1: "var(--color-div-1)",
  2: "var(--color-div-2)",
  3: "var(--color-div-3)",
  4: "var(--color-div-4)",
  5: "var(--color-div-5)",
};

const ROTULOS: Record<number, string> = {
  1: "Nota 1 — muito abaixo",
  2: "Nota 2 — abaixo",
  3: "Nota 3 — neutro",
  4: "Nota 4 — acima",
  5: "Nota 5 — muito acima",
};

/** Converte a parcela assinada (-1…1) em posição percentual dentro da trilha. */
const posicao = (v: number) => 50 + v * 50;

/**
 * Barra empilhada divergente, centrada no neutro (nota 3).
 *
 * Escala ordenada (Likert) → polaridade é o que importa: vermelho e azul são
 * polos quente/frio (ΔE 15.0 sob deuteranopia) e o meio é cinza, que lê como
 * "nada". A metade esquerda da trilha vale 100% das notas baixas; a direita,
 * 100% das altas.
 */
export function LikertDivergente({ linhas }: { linhas: LinhaLikert[] }) {
  const { dica, aoMover, limpar } = useDica();

  if (linhas.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-3">Sem dados para este recorte.</p>;
  }

  // O rótulo cede espaço à trilha em telas estreitas.
  const grade = "minmax(0, min(11rem, 38%)) 1fr auto";

  return (
    <div className="relative" data-area-dica>
      <Dica estado={dica} />

      {/* Legenda sempre presente: identidade nunca depende só da cor */}
      <ul className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className="flex items-center gap-1.5 text-[11px] text-ink-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: CORES[n] }}
            />
            Nota {n}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1">
        {linhas.map((linha) => {
          const p = Object.fromEntries(linha.distribuicao.map((d) => [d.nota, d.parcela])) as Record<
            number,
            number
          >;
          const meioNeutro = (p[3] ?? 0) / 2;

          // Segmentos em coordenadas assinadas, do centro para fora.
          const segmentos = [
            { nota: 1, de: -(meioNeutro + p[2] + p[1]), ate: -(meioNeutro + p[2]) },
            { nota: 2, de: -(meioNeutro + p[2]), ate: -meioNeutro },
            { nota: 3, de: -meioNeutro, ate: 0 },
            { nota: 3, de: 0, ate: meioNeutro },
            { nota: 4, de: meioNeutro, ate: meioNeutro + p[4] },
            { nota: 5, de: meioNeutro + p[4], ate: meioNeutro + p[4] + p[5] },
          ].filter((s) => s.ate - s.de > 0.0001);

          const primeiro = segmentos.at(0);
          const ultimo = segmentos.at(-1);
          const satisfacao = (p[4] ?? 0) + (p[5] ?? 0);

          return (
            <div
              key={linha.chave}
              className="grid items-center gap-x-3 rounded-md py-1.5 transition-colors hover:bg-surface-2"
              style={{ gridTemplateColumns: grade }}
              onMouseMove={(e) =>
                aoMover(e, (
                  <div className="space-y-1">
                    <p className="font-semibold">{linha.rotulo}</p>
                    <p className="text-ink-2">{numero(linha.totalNotas)} notas</p>
                    <ul className="mt-1.5 space-y-0.5 border-t border-[var(--border)] pt-1.5">
                      {[...linha.distribuicao].reverse().map((d) => (
                        <li key={d.nota} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-ink-2">
                            <span
                              aria-hidden
                              className="h-2 w-2 rounded-[2px]"
                              style={{ background: CORES[d.nota] }}
                            />
                            {ROTULOS[d.nota]}
                          </span>
                          <span className="tnum font-semibold">
                            {numero(d.quantidade)} · {percentual(d.parcela)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              }
              onMouseLeave={limpar}
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink-1" title={linha.rotulo}>
                  {linha.rotulo}
                </p>
                {linha.sublegenda ? (
                  <p className="truncate text-[11px] text-ink-3">{linha.sublegenda}</p>
                ) : null}
              </div>

              <div className="relative h-5 min-w-0 rounded-sm bg-surface-2">
                {/* Linha de base no neutro */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-axis"
                />
                {segmentos.map((s, i) => {
                  const esquerda = posicao(s.de);
                  const largura = (s.ate - s.de) * 50;
                  const ehPrimeiro = s === primeiro;
                  const ehUltimo = s === ultimo;
                  return (
                    <div
                      key={`${s.nota}-${i}`}
                      className="absolute top-0 h-full"
                      style={{
                        // O recuo de 1px de cada lado cria o vão de 2px na cor da superfície.
                        left: `calc(${esquerda}% + 1px)`,
                        width: `calc(${largura}% - 2px)`,
                        background: CORES[s.nota],
                        borderTopLeftRadius: ehPrimeiro ? 4 : 0,
                        borderBottomLeftRadius: ehPrimeiro ? 4 : 0,
                        borderTopRightRadius: ehUltimo ? 4 : 0,
                        borderBottomRightRadius: ehUltimo ? 4 : 0,
                      }}
                    />
                  );
                })}
              </div>

              {/* Rótulo direto seletivo: a parcela positiva, que é a leitura do gráfico */}
              <span className="tnum w-12 shrink-0 text-right text-[13px] font-semibold text-ink-1">
                {percentual(satisfacao)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="mt-1 grid gap-x-3 border-t border-hairline pt-1.5"
        style={{ gridTemplateColumns: grade }}
      >
        <span className="text-[10px] text-ink-3">← notas baixas</span>
        <div className="relative h-4">
          {[
            { pos: 0, texto: "100%", sempre: true },
            { pos: 25, texto: "50%", sempre: false },
            { pos: 50, texto: "0", sempre: true },
            { pos: 75, texto: "50%", sempre: false },
            { pos: 100, texto: "100%", sempre: true },
          ].map((t) => (
            <span
              key={t.pos}
              className={`tnum absolute top-0 -translate-x-1/2 text-[10px] text-ink-3 ${
                t.sempre ? "" : "hidden sm:inline"
              }`}
              style={{ left: `${t.pos}%` }}
            >
              {t.texto}
            </span>
          ))}
        </div>
        <span className="w-12 shrink-0 text-right text-[10px] text-ink-3">4 e 5</span>
      </div>
    </div>
  );
}
