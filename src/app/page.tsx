import { redirect } from "next/navigation";

import { lerSessao } from "@/lib/auth";

export default async function Raiz() {
  const sessao = await lerSessao();
  redirect(sessao ? "/dashboard" : "/login");
}
