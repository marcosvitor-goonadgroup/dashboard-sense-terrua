"use client";

import { useActionState } from "react";

import { entrar, type EstadoLogin } from "@/app/actions";

const INICIAL: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState(entrar, INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <Campo id="usuario" rotulo="Usuário" tipo="text" autoComplete="username" />
      <Campo id="senha" rotulo="Senha" tipo="password" autoComplete="current-password" />

      {estado.erro ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-status-critical/8 px-3 py-2.5 text-[13px] text-ink-1 ring-1 ring-inset ring-status-critical/25"
        >
          <span aria-hidden className="mt-px text-status-critical">
            ▼
          </span>
          {estado.erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="mt-1 h-11 rounded-lg bg-terrua-ink text-[14px] font-semibold text-white transition-colors hover:bg-terrua-deep disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

function Campo({
  id,
  rotulo,
  tipo,
  autoComplete,
}: {
  id: string;
  rotulo: string;
  tipo: string;
  autoComplete: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-2">{rotulo}</span>
      <input
        id={id}
        name={id}
        type={tipo}
        required
        autoComplete={autoComplete}
        className="h-11 rounded-lg border border-[var(--border)] bg-surface px-3 text-[14px] text-ink-1 transition-colors hover:border-[var(--border-strong)]"
      />
    </label>
  );
}
