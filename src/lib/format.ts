const NUM_1 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const NUM_2 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM_0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export const numero = (v: number) => NUM_0.format(v);
export const nota1 = (v: number | null) => (v == null ? "—" : NUM_1.format(v));
export const nota2 = (v: number | null) => (v == null ? "—" : NUM_2.format(v));
export const percentual = (v: number | null) => (v == null ? "—" : `${NUM_0.format(v * 100)}%`);

export function dataCurta(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // As datas chegam em UTC à meia-noite; usar UTC evita voltar um dia no fuso do Brasil.
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function dataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

/** Quatro faixas de desempenho. Cada uma viaja com ícone + rótulo — nunca cor sozinha. */
export type Faixa = {
  chave: "excelente" | "bom" | "atencao" | "critico";
  rotulo: string;
  cor: string;
  icone: string;
};

export function faixaDaNota(media: number | null): Faixa | null {
  if (media == null) return null;
  if (media >= 4.5)
    return { chave: "excelente", rotulo: "Excelente", cor: "var(--color-status-good)", icone: "▲" };
  if (media >= 3.5)
    return { chave: "bom", rotulo: "Satisfatório", cor: "var(--color-status-warning)", icone: "●" };
  if (media >= 2.5)
    return { chave: "atencao", rotulo: "Atenção", cor: "var(--color-status-serious)", icone: "◆" };
  return { chave: "critico", rotulo: "Crítico", cor: "var(--color-status-critical)", icone: "▼" };
}

/** Passo da rampa sequencial laranja para uma nota de 1 a 5. */
export function passoSequencial(media: number | null): string {
  if (media == null) return "var(--color-surface-2)";
  if (media >= 4.75) return "var(--color-seq-700)";
  if (media >= 4.4) return "var(--color-seq-600)";
  if (media >= 4.0) return "var(--color-seq-500)";
  if (media >= 3.5) return "var(--color-seq-400)";
  if (media >= 3.0) return "var(--color-seq-300)";
  if (media >= 2.0) return "var(--color-seq-200)";
  return "var(--color-seq-100)";
}

/** Tinta legível dentro de uma célula preenchida da rampa (branco ou tinta escura). */
export function tintaSobreSequencial(media: number | null): string {
  if (media == null) return "var(--color-ink-3)";
  return media >= 4.0 ? "#ffffff" : "var(--color-ink-1)";
}
