"use client";

import { Dica, LinhaDica, useDica } from "@/components/ui/Dica";
import { nota2, numero, passoSequencial, tintaSobreSequencial } from "@/lib/format";
import type { Heatmap } from "@/lib/metrics";

const ESCALA = [
  { rotulo: "< 2,0", cor: "var(--color-seq-100)" },
  { rotulo: "2,0", cor: "var(--color-seq-200)" },
  { rotulo: "3,0", cor: "var(--color-seq-300)" },
  { rotulo: "3,5", cor: "var(--color-seq-400)" },
  { rotulo: "4,0", cor: "var(--color-seq-500)" },
  { rotulo: "4,4", cor: "var(--color-seq-600)" },
  { rotulo: "4,75+", cor: "var(--color-seq-700)" },
];

/**
 * Grade seção × evento.
 *
 * O trabalho da cor aqui é magnitude, então é sequencial: um único matiz da
 * marca, claro → escuro. O número fica dentro de cada célula, o que também
 * resolve o contraste dos passos mais claros.
 */
export function HeatmapSecoes({ dados }: { dados: Heatmap }) {
  const { dica, aoMover, limpar } = useDica();

  if (dados.colunas.length === 0 || dados.linhas.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-3">Sem dados para este recorte.</p>;
  }

  const grade = `minmax(9rem, 11rem) repeat(${dados.colunas.length}, minmax(6.5rem, 1fr))`;

  return (
    <div className="relative" data-area-dica>
      <Dica estado={dica} />

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-max">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: grade }}>
            <div className="sticky left-0 z-10 bg-surface" />
            {dados.colunas.map((c) => (
              <div key={c.chave} className="px-1.5 pb-2">
                <p className="truncate text-[12px] font-medium text-ink-1" title={c.rotulo}>
                  {c.rotulo}
                </p>
                <p className="truncate text-[10px] text-ink-3" title={c.sublegenda}>
                  {c.sublegenda}
                </p>
              </div>
            ))}

            {dados.linhas.map((linha) => (
              <div key={linha.chave} className="contents">
                <div className="sticky left-0 z-10 flex items-center bg-surface pr-3">
                  <span className="truncate text-[13px] font-medium text-ink-1" title={linha.rotulo}>
                    {linha.rotulo}
                  </span>
                </div>

                {linha.celulas.map((celula, i) => {
                  const coluna = dados.colunas[i];
                  const vazia = celula.media == null;
                  return (
                    <div
                      key={`${linha.chave}-${coluna.chave}`}
                      className="flex h-11 items-center justify-center rounded-[4px] transition-transform hover:scale-[1.03]"
                      style={{
                        background: vazia ? "var(--color-surface-2)" : passoSequencial(celula.media),
                        color: vazia ? "var(--color-ink-3)" : tintaSobreSequencial(celula.media),
                        boxShadow: vazia ? "inset 0 0 0 1px var(--color-hairline)" : undefined,
                      }}
                      onMouseMove={(e) =>
                        aoMover(e, (
                          <div className="space-y-1">
                            <p className="font-semibold">{linha.rotulo}</p>
                            <p className="text-ink-2">
                              {coluna.rotulo} · {coluna.sublegenda}
                            </p>
                            <div className="mt-1.5 space-y-0.5 border-t border-[var(--border)] pt-1.5">
                              <LinhaDica rotulo="Média" valor={nota2(celula.media)} />
                              <LinhaDica rotulo="Notas" valor={numero(celula.totalNotas)} />
                              {celula.naoAplicavel ? (
                                <p className="pt-1 text-ink-2">Seção marcada como não aplicável.</p>
                              ) : null}
                            </div>
                          </div>
                        ))
                      }
                      onMouseLeave={limpar}
                    >
                      <span className="tnum text-[13px] font-semibold">
                        {vazia ? (celula.naoAplicavel ? "N/A" : "—") : nota2(celula.media)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] text-ink-2">Média</span>
        <div className="flex items-end gap-0.5">
          {ESCALA.map((passo) => (
            <div key={passo.rotulo} className="flex flex-col items-center gap-1">
              <span
                aria-hidden
                className="h-3 w-8 rounded-[2px]"
                style={{ background: passo.cor }}
              />
              <span className="tnum text-[9px] text-ink-3">{passo.rotulo}</span>
            </div>
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
          <span
            aria-hidden
            className="h-3 w-5 rounded-[2px] bg-surface-2 ring-1 ring-inset ring-[var(--color-hairline)]"
          />
          <strong className="font-semibold">N/A</strong> não se aplica ·{" "}
          <strong className="font-semibold">—</strong> sem registro
        </span>
      </div>
    </div>
  );
}
