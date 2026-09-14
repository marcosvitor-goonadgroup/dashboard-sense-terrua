import { redirect } from "next/navigation";

import { Logo } from "@/components/Logo";
import { lerSessao } from "@/lib/auth";

import { FormularioLogin } from "./FormularioLogin";

export default async function Login() {
  if (await lerSessao()) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      {/* Painel da marca — o laranja do site, saindo na frente */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-terrua-tan px-6 py-10 text-white md:px-12 lg:w-[46%] lg:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-terrua-deep/15"
        />

        <Logo className="relative h-10 w-auto text-white md:h-12" />

        <div className="relative mt-10 lg:mt-0">
          <h1 className="max-w-md text-[34px] font-bold leading-[1.1] tracking-tight md:text-[44px]">
            Como foi a nossa performance em cada evento.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
            O Sense reúne as pesquisas de satisfação da Terruá e mostra, por matriz, evento e
            seção, onde a entrega brilhou e onde ela pode crescer.
          </p>
        </div>

        <p className="relative mt-10 text-[12px] text-white/70 lg:mt-0">
          Acesso restrito · cada matriz enxerga apenas os próprios resultados.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          <h2 className="text-[22px] font-semibold tracking-tight text-ink-1">Entrar no Sense</h2>
          <p className="mb-7 mt-1.5 text-[13px] text-ink-2">
            Use as credenciais enviadas pela administração da Terruá.
          </p>

          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}
