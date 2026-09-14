"use client";

import type { Facetas } from "@/lib/metrics";

export type EstadoFiltros = {
  matriz: string;
  cliente: string;
  evento: string;
  gerente: string;
  assessor: string;
  secao: string;
};

export const FILTROS_VAZIOS: EstadoFiltros = {
  matriz: "",
  cliente: "",
  evento: "",
  gerente: "",
  assessor: "",
  secao: "",
};

type Props = {
  facetas: Facetas;
  valor: EstadoFiltros;
  aoMudar: (proximo: EstadoFiltros) => void;
  /** A sessão de matriz não escolhe matriz — o recorte já veio do servidor. */
  mostrarMatriz: boolean;
};

/**
 * Uma única fileira de filtros acima de tudo que ela recorta — nunca filtros
 * dentro de um cartão de gráfico.
 */
export function Filtros({ facetas, valor, aoMudar, mostrarMatriz }: Props) {
  const ativos = Object.values(valor).filter(Boolean).length;

  const campo = (
    chave: keyof EstadoFiltros,
    rotulo: string,
    opcoes: { valor: string; texto: string }[],
  ) => (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-medium text-ink-2">{rotulo}</span>
      <select
        value={valor[chave]}
        onChange={(e) => aoMudar({ ...valor, [chave]: e.target.value })}
        className="h-9 min-w-0 rounded-lg border border-[var(--border)] bg-surface px-2.5 text-[13px] text-ink-1 transition-colors hover:border-[var(--border-strong)]"
      >
        <option value="">Todos</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );

  const simples = (lista: string[]) => lista.map((v) => ({ valor: v, texto: v }));

  return (
    <div className="no-print card flex flex-wrap items-end gap-3 p-4">
      {mostrarMatriz && facetas.matrizes.length > 1
        ? campo("matriz", "Matriz", simples(facetas.matrizes))
        : null}
      {campo("cliente", "Cliente", simples(facetas.clientes))}
      {campo("evento", "Evento", simples(facetas.eventos))}
      {facetas.gerentes.length > 0 ? campo("gerente", "Gerente", simples(facetas.gerentes)) : null}
      {facetas.assessores.length > 0
        ? campo("assessor", "Assessor", simples(facetas.assessores))
        : null}
      {campo(
        "secao",
        "Seção",
        facetas.secoes.map((s) => ({ valor: s.codigo, texto: s.nome })),
      )}

      <button
        type="button"
        onClick={() => aoMudar(FILTROS_VAZIOS)}
        disabled={ativos === 0}
        className="h-9 rounded-lg border border-[var(--border)] px-3 text-[13px] font-medium text-ink-2 transition-colors hover:border-[var(--border-strong)] hover:text-ink-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Limpar{ativos > 0 ? ` (${ativos})` : ""}
      </button>
    </div>
  );
}
