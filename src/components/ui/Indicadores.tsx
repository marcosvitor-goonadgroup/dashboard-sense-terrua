import type { ReactNode } from "react";

import { faixaDaNota } from "@/lib/format";

/** Selo de faixa: cor sempre acompanhada de ícone + rótulo. */
export function SeloFaixa({ media, compacto = false }: { media: number | null; compacto?: boolean }) {
  const faixa = faixaDaNota(media);
  if (!faixa) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-3">
        <span aria-hidden>—</span> Sem nota
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-surface-2 font-medium text-ink-1 ${
        compacto ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]"
      }`}
    >
      <span aria-hidden style={{ color: faixa.cor }}>
        {faixa.icone}
      </span>
      {faixa.rotulo}
    </span>
  );
}

/** Figura-herói: o número que a visão lidera. Exatamente uma por tela. */
export function Heroi({
  valor,
  unidade,
  rotulo,
  apoio,
}: {
  valor: string;
  unidade?: string;
  rotulo: string;
  apoio?: ReactNode;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-ink-2">{rotulo}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[56px] font-semibold leading-none tracking-tight text-ink-1">
          {valor}
        </span>
        {unidade ? (
          <span className="text-[20px] font-medium leading-none text-ink-3">{unidade}</span>
        ) : null}
      </p>
      {apoio ? <div className="mt-3">{apoio}</div> : null}
    </div>
  );
}

/**
 * Medidor: um valor contra um limite — magnitude, não estado. Por isso veste a
 * rampa sequencial da marca, com a trilha vazia num passo mais claro da MESMA
 * rampa; quem carrega o estado é o selo de faixa, com ícone e rótulo.
 */
export function Medidor({
  valor,
  maximo = 5,
  rotulo,
}: {
  valor: number | null;
  maximo?: number;
  rotulo: string;
}) {
  const fracao = valor == null ? 0 : Math.max(0, Math.min(1, valor / maximo));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-ink-2">{rotulo}</span>
        <span className="tnum text-[12px] font-semibold text-ink-1">
          {valor == null ? "—" : valor.toFixed(2).replace(".", ",")} / {maximo}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-seq-100"
        role="meter"
        aria-valuenow={valor ?? undefined}
        aria-valuemin={0}
        aria-valuemax={maximo}
        aria-label={rotulo}
      >
        <div
          className="h-full rounded-full bg-seq-600 transition-[width] duration-500"
          style={{ width: `${fracao * 100}%` }}
        />
      </div>
    </div>
  );
}
