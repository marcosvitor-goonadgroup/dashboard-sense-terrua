import { redirect } from "next/navigation";

import { Cabecalho } from "@/components/Cabecalho";
import { DashboardClient } from "@/components/DashboardClient";
import { aplicarEscopo, buscarLinhas, ErroApi } from "@/lib/api";
import { lerSessao } from "@/lib/auth";
import { dataHora } from "@/lib/format";
import type { Linha } from "@/lib/types";

export default async function Dashboard() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");

  let linhas: Linha[] = [];
  let erro: string | null = null;

  try {
    // O recorte por matriz acontece AQUI, no servidor: o navegador de uma
    // matriz nunca recebe as linhas de outra.
    linhas = aplicarEscopo(await buscarLinhas(), sessao.escopo);
  } catch (e) {
    console.error("[pesquisas]", e);
    erro =
      e instanceof ErroApi
        ? e.message
        : "Não foi possível carregar as pesquisas neste momento.";
  }

  return (
    <>
      <Cabecalho escopo={sessao.escopo} atualizadoEm={dataHora(new Date().toISOString())} />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 md:px-6 md:py-6">
        {erro ? (
          <div
            role="alert"
            className="card flex flex-col items-start gap-3 p-6 ring-1 ring-inset ring-status-critical/20"
          >
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-1">
              <span aria-hidden className="text-status-critical">
                ▼
              </span>
              Falha ao carregar os dados
            </p>
            <p className="text-[13px] text-ink-2">{erro}</p>
            <p className="text-[12px] text-ink-3">
              Use o botão “Atualizar” no topo para tentar de novo.
            </p>
          </div>
        ) : (
          <DashboardClient linhas={linhas} escopo={sessao.escopo} />
        )}
      </main>

      <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-2 text-[11px] text-ink-3 md:px-6">
        Sense · Terruá — notas de 1 a 5. Perguntas de seções marcadas como “não se aplica” ficam
        fora de todas as médias.
      </footer>
    </>
  );
}
