"use client";

import { useCallback, useState, type ReactNode } from "react";

export type EstadoDica = { x: number; y: number; conteudo: ReactNode } | null;

/**
 * Camada de hover compartilhada pelos gráficos.
 *
 * A dica sempre *acrescenta* — nunca é o único caminho para um valor: todo
 * gráfico tem rótulos diretos e uma visão de tabela equivalente.
 */
export function useDica() {
  const [dica, setDica] = useState<EstadoDica>(null);

  const aoMover = useCallback((evento: { clientX: number; clientY: number; currentTarget: Element }, conteudo: ReactNode) => {
    const caixa = evento.currentTarget.closest("[data-area-dica]")?.getBoundingClientRect();
    if (!caixa) return;
    setDica({ x: evento.clientX - caixa.left, y: evento.clientY - caixa.top, conteudo });
  }, []);

  const limpar = useCallback(() => setDica(null), []);

  return { dica, aoMover, limpar, setDica };
}

export function Dica({ estado }: { estado: EstadoDica }) {
  if (!estado) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30 max-w-[17rem] rounded-lg border border-[var(--border-strong)] bg-surface px-3 py-2 text-[12px] leading-snug text-ink-1 shadow-lg"
      style={{
        left: estado.x,
        top: estado.y,
        transform: `translate(${estado.x > 220 ? "-105%" : "12px"}, -50%)`,
      }}
    >
      {estado.conteudo}
    </div>
  );
}

export function LinhaDica({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-2">{rotulo}</span>
      <span className="tnum font-semibold">{valor}</span>
    </div>
  );
}
