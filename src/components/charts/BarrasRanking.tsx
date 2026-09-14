"use client";

import type { ReactNode } from "react";

import { Dica, LinhaDica, useDica } from "@/components/ui/Dica";
import { nota2, numero } from "@/lib/format";

export type ItemBarra = {
  chave: string;
  rotulo: string;
  sublegenda?: string;
  valor: number | null;
  totalNotas: number;
  detalhes?: { rotulo: string; valor: ReactNode }[];
};

type Props = {
  itens: ItemBarra[];
  maximo?: number;
  /** Quando informado, só estas chaves recebem a cor de destaque; o resto recai no cinza. */
  destacar?: Set<string>;
  /** Teto da coluna de rótulos; ela sempre cede espaço à barra em telas estreitas. */
  larguraRotulo?: string;
  /** Rótulos longos (perguntas) podem ocupar duas linhas em vez de truncar. */
  duasLinhas?: boolean;
};

const TICKS = [0, 1, 2, 3, 4, 5];

/**
 * Barras horizontais, série única.
 *
 * Uma série → uma cor (slot 1 da categórica) e nenhuma caixa de legenda: o
 * título do cartão já diz o que está plotado. O valor vai no bico da barra.
 */
export function BarrasRanking({
  itens,
  maximo = 5,
  destacar,
  larguraRotulo = "13rem",
  duasLinhas = false,
}: Props) {
  const { dica, aoMover, limpar } = useDica();

  if (itens.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-3">Sem dados para este recorte.</p>;
  }

  // O rótulo nunca passa de 42% da largura — em telefone a barra continua legível.
  const grade = `minmax(0, min(${larguraRotulo}, 42%)) 1fr`;

  return (
    <div className="relative" data-area-dica>
      <Dica estado={dica} />

      <div className="flex flex-col gap-1">
        {itens.map((item) => {
          const fracao = item.valor == null ? 0 : Math.max(0, Math.min(1, item.valor / maximo));
          const emDestaque = !destacar || destacar.has(item.chave);

          return (
            <div
              key={item.chave}
              className="grid items-center gap-x-3 rounded-md py-1.5 transition-colors hover:bg-surface-2"
              style={{ gridTemplateColumns: grade }}
              onMouseMove={(e) =>
                aoMover(e, (
                  <div className="space-y-1">
                    <p className="font-semibold">{item.rotulo}</p>
                    {item.sublegenda ? (
                      <p className="text-ink-2">{item.sublegenda}</p>
                    ) : null}
                    <div className="mt-1.5 space-y-0.5 border-t border-[var(--border)] pt-1.5">
                      <LinhaDica rotulo="Média" valor={nota2(item.valor)} />
                      <LinhaDica rotulo="Notas respondidas" valor={numero(item.totalNotas)} />
                      {item.detalhes?.map((d) => (
                        <LinhaDica key={d.rotulo} rotulo={d.rotulo} valor={d.valor} />
                      ))}
                    </div>
                  </div>
                ))
              }
              onMouseLeave={limpar}
            >
              <div className="min-w-0">
                <p
                  className={`text-[13px] font-medium leading-snug text-ink-1 ${
                    duasLinhas ? "line-clamp-2" : "truncate"
                  }`}
                  title={item.rotulo}
                >
                  {item.rotulo}
                </p>
                {item.sublegenda ? (
                  <p className="truncate text-[11px] text-ink-3" title={item.sublegenda}>
                    {item.sublegenda}
                  </p>
                ) : null}
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <div className="relative h-3 min-w-0 flex-1 rounded-sm bg-surface-2">
                  {/* Grade: hairlines sólidas, um passo fora da superfície */}
                  {TICKS.slice(1, -1).map((t) => (
                    <span
                      key={t}
                      aria-hidden
                      className="absolute top-0 h-full w-px bg-hairline"
                      style={{ left: `${(t / maximo) * 100}%` }}
                    />
                  ))}
                  {item.valor != null ? (
                    <div
                      className="absolute left-0 top-0 h-full rounded-r-[4px] transition-[width] duration-500"
                      style={{
                        width: `${fracao * 100}%`,
                        background: emDestaque ? "var(--color-cat-1)" : "var(--color-axis)",
                      }}
                    />
                  ) : null}
                </div>
                <span className="tnum w-11 shrink-0 text-right text-[13px] font-semibold text-ink-1">
                  {nota2(item.valor)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Eixo x — carrega os valores que não foram rotulados diretamente */}
      <div
        className="mt-1 grid gap-x-3 border-t border-hairline pt-1.5"
        style={{ gridTemplateColumns: grade }}
      >
        <span />
        <div className="flex items-center gap-2">
          <div className="relative h-4 min-w-0 flex-1">
            {TICKS.map((t) => (
              <span
                key={t}
                className="tnum absolute top-0 -translate-x-1/2 text-[10px] text-ink-3"
                style={{ left: `${(t / maximo) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
          <span className="w-11 shrink-0" />
        </div>
      </div>
    </div>
  );
}
