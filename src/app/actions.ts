"use server";

import { redirect } from "next/navigation";

import {
  autenticar,
  ErroConfiguracao,
  gravarSessao,
  limparSessao,
  verificarConfiguracao,
} from "@/lib/auth";
import type { Sessao } from "@/lib/types";

export type EstadoLogin = { erro?: string };

const MSG_CONFIG =
  "O acesso não está configurado no servidor. Fale com a administração — as variáveis de ambiente do dashboard precisam ser definidas.";

/** Registra o motivo real no log do servidor, sem expô-lo na tela de login. */
function registrarFalhaDeConfig(erro: unknown): void {
  if (erro instanceof ErroConfiguracao) {
    console.error(`[auth][config] ${erro.variavel} — ${erro.detalhe}`);
  } else {
    console.error("[auth][config] falha inesperada ao ler a configuração:", erro);
  }
}

export async function entrar(_estado: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const usuario = String(dados.get("usuario") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");

  if (!usuario || !senha) {
    return { erro: "Informe usuário e senha." };
  }

  let sessao: Sessao | null;
  try {
    // Valida AUTH_SECRET junto das contas: assim uma chave faltando aparece
    // aqui, e não depois, na hora de assinar o cookie.
    verificarConfiguracao();
    sessao = autenticar(usuario, senha);
  } catch (erro) {
    registrarFalhaDeConfig(erro);
    return { erro: MSG_CONFIG };
  }

  if (!sessao) {
    return { erro: "Usuário ou senha incorretos." };
  }

  try {
    await gravarSessao(sessao);
  } catch (erro) {
    registrarFalhaDeConfig(erro);
    return { erro: MSG_CONFIG };
  }

  // Fora do try: redirect sinaliza por exceção e não pode ser capturado acima.
  redirect("/dashboard");
}

export async function sair(): Promise<void> {
  await limparSessao();
  redirect("/login");
}
