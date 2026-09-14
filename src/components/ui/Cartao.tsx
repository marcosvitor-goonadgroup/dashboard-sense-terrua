"use client";

import { useId, useState, type ReactNode } from "react";

type Props = {
  titulo: string;
  descricao?: string;
  /** Gêmeo em tabela do gráfico — todo valor continua alcançável sem depender de cor. */
  tabela?: ReactNode;
  acessorio?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Cartao({ titulo, descricao, tabela, acessorio, children, className }: Props) {
  const [verTabela, setVerTabela] = useState(false);
  const idConteudo = useId();

  return (
    <section className={`card flex min-w-0 flex-col p-5 ${className ?? ""}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-1">{titulo}</h2>
          {descricao ? <p className="mt-1 text-[13px] text-ink-2">{descricao}</p> : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {acessorio}
          {tabela ? (
            <div
              className="no-print flex rounded-lg border border-[var(--border)] bg-surface-2 p-0.5"
              role="group"
              aria-label="Modo de exibição"
            >
              <BotaoModo ativo={!verTabela} onClick={() => setVerTabela(false)} controla={idConteudo}>
                Gráfico
              </BotaoModo>
              <BotaoModo ativo={verTabela} onClick={() => setVerTabela(true)} controla={idConteudo}>
                Tabela
              </BotaoModo>
            </div>
          ) : null}
        </div>
      </header>

      <div id={idConteudo} className="min-w-0 flex-1">
        {verTabela && tabela ? tabela : children}
      </div>
    </section>
  );
}

function BotaoModo({
  ativo,
  onClick,
  controla,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  controla: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      aria-controls={controla}
      className={`rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
        ativo ? "bg-surface text-ink-1 shadow-sm" : "text-ink-2 hover:text-ink-1"
      }`}
    >
      {children}
    </button>
  );
}
