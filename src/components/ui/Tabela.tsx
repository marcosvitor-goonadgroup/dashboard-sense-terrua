import type { ReactNode } from "react";

export type Coluna<T> = {
  chave: string;
  cabecalho: string;
  alinhar?: "esquerda" | "direita";
  celula: (item: T) => ReactNode;
};

/** Gêmeo em tabela dos gráficos: todo valor alcançável sem depender de cor. */
export function Tabela<T>({
  colunas,
  itens,
  chave,
  legenda,
}: {
  colunas: Coluna<T>[];
  itens: T[];
  chave: (item: T) => string;
  legenda?: string;
}) {
  if (itens.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-3">Sem dados para este recorte.</p>;
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-max border-collapse text-[13px]">
        {legenda ? <caption className="sr-only">{legenda}</caption> : null}
        <thead>
          <tr className="border-b border-[var(--border)]">
            {colunas.map((c) => (
              <th
                key={c.chave}
                scope="col"
                className={`whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3 ${
                  c.alinhar === "direita" ? "text-right" : "text-left"
                }`}
              >
                {c.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={chave(item)} className="border-b border-hairline last:border-0 hover:bg-surface-2">
              {colunas.map((c) => (
                <td
                  key={c.chave}
                  className={`px-3 py-2 align-middle text-ink-1 ${
                    c.alinhar === "direita" ? "tnum text-right" : "text-left"
                  }`}
                >
                  {c.celula(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
