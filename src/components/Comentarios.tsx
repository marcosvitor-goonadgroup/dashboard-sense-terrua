import { SeloFaixa } from "@/components/ui/Indicadores";
import { dataHora } from "@/lib/format";
import type { Comentario } from "@/lib/metrics";

export function Comentarios({
  itens,
  mostrarMatriz,
}: {
  itens: Comentario[];
  mostrarMatriz: boolean;
}) {
  if (itens.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-ink-3">
        Nenhum comentário registrado neste recorte.
      </p>
    );
  }

  return (
    <ul className="grid max-h-[26rem] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
      {itens.map((c) => (
        <li key={c.id} className="rounded-lg border border-[var(--border)] bg-surface-2 p-3.5">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-1 ring-1 ring-inset ring-[var(--border)]">
              {c.secao}
            </span>
            <SeloFaixa media={c.mediaSecao} compacto />
            <span className="text-[11px] text-ink-3">
              {c.evento} · {c.cliente}
              {mostrarMatriz ? ` · ${c.matriz}` : ""}
            </span>
          </div>

          <blockquote className="text-[13px] leading-relaxed text-ink-1">“{c.texto}”</blockquote>

          <p className="mt-2 text-[11px] text-ink-3">
            {c.respondente ?? "Respondente não identificado"}
            {c.cargo ? ` · ${c.cargo}` : ""} · {dataHora(c.dataResposta)}
          </p>
        </li>
      ))}
    </ul>
  );
}
