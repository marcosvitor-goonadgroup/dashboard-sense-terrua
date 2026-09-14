"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { sair } from "@/app/actions";
import { Logo } from "@/components/Logo";
import type { Escopo } from "@/lib/types";

export function Cabecalho({ escopo, atualizadoEm }: { escopo: Escopo; atualizadoEm: string }) {
  const router = useRouter();
  const [atualizando, iniciarAtualizacao] = useTransition();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-page/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-auto text-terrua" />
          <span aria-hidden className="h-7 w-px bg-[var(--border-strong)]" />
          <div>
            <p className="text-[13px] font-semibold leading-tight text-ink-1">Sense</p>
            <p className="text-[11px] leading-tight text-ink-3">Pesquisas de satisfação</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
              escopo.tipo === "admin"
                ? "bg-terrua-plum/10 text-terrua-plum ring-1 ring-inset ring-terrua-plum/20"
                : "bg-terrua/10 text-terrua-deep ring-1 ring-inset ring-terrua/25"
            }`}
          >
            <span aria-hidden>{escopo.tipo === "admin" ? "◆" : "●"}</span>
            {escopo.tipo === "admin" ? "Visão geral · todas as matrizes" : escopo.matriz}
          </span>

          <button
            type="button"
            onClick={() => iniciarAtualizacao(() => router.refresh())}
            disabled={atualizando}
            className="no-print h-8 rounded-lg border border-[var(--border)] bg-surface px-3 text-[12px] font-medium text-ink-2 transition-colors hover:border-[var(--border-strong)] hover:text-ink-1 disabled:opacity-50"
          >
            {atualizando ? "Atualizando…" : "Atualizar"}
          </button>

          <form action={sair} className="no-print">
            <button
              type="submit"
              className="h-8 rounded-lg px-3 text-[12px] font-medium text-ink-2 transition-colors hover:text-ink-1"
            >
              Sair
            </button>
          </form>
        </div>

        <p className="w-full text-[11px] text-ink-3 md:w-auto md:basis-full">
          Dados atualizados em {atualizadoEm}
          {escopo.tipo === "matriz"
            ? " · esta sessão recebe apenas os registros da sua matriz"
            : ""}
        </p>
      </div>
    </header>
  );
}
