"use server";

import { redirect } from "next/navigation";

import { autenticar, gravarSessao, limparSessao } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

export async function entrar(_estado: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const usuario = String(dados.get("usuario") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");

  if (!usuario || !senha) {
    return { erro: "Informe usuário e senha." };
  }

  let sessao: ReturnType<typeof autenticar>;
  try {
    sessao = autenticar(usuario, senha);
  } catch (erro) {
    console.error("[auth] configuração inválida:", erro);
    return { erro: "O acesso não está configurado no servidor. Fale com a administração." };
  }

  if (!sessao) {
    return { erro: "Usuário ou senha incorretos." };
  }

  await gravarSessao(sessao);
  redirect("/dashboard");
}

export async function sair(): Promise<void> {
  await limparSessao();
  redirect("/login");
}
